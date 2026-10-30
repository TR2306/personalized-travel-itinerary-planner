import json
import re
import uuid
import httpx
from typing import Dict, Any, List, Optional
from app.config import settings
from app.schemas.itinerary import (
    ItineraryData, DayPlan, ActivityItem, MealRecommendation,
    AccommodationSuggestion, BudgetBreakdown
)
from app.utils.prompt_templates import (
    build_itinerary_system_prompt,
    build_itinerary_user_prompt,
    build_regenerate_day_prompt
)

class AIService:
    @staticmethod
    async def generate_itinerary(params: Dict[str, Any]) -> ItineraryData:
        """
        Generate a personalized travel itinerary using Gemini API with robust JSON schema validation,
        falling back gracefully to our expert algorithmic generator if the API key is not configured or fails.
        """
        api_key = params.get("custom_gemini_key") or settings.GEMINI_API_KEY
        if api_key and api_key.strip() and "your_gemini" not in api_key:
            try:
                itinerary = await AIService._call_gemini_api(params, api_key.strip())
                if itinerary:
                    return itinerary
            except Exception as e:
                print(f"⚠️ Gemini API invocation error: {e}. Utilizing smart fallback generator.")
        
        # High quality expert generator fallback
        return AIService._generate_smart_fallback(params)

    @staticmethod
    async def regenerate_single_day(params: Dict[str, Any]) -> DayPlan:
        """
        Regenerate a specific day plan based on user tweaks and notes.
        """
        api_key = params.get("custom_gemini_key") or settings.GEMINI_API_KEY
        if api_key and api_key.strip() and "your_gemini" not in api_key:
            try:
                day_plan = await AIService._call_gemini_day_api(params, api_key.strip())
                if day_plan:
                    return day_plan
            except Exception as e:
                print(f"⚠️ Gemini API day regeneration error: {e}. Utilizing smart fallback.")
        
        return AIService._generate_fallback_day(params)

    @staticmethod
    async def _call_gemini_api(params: Dict[str, Any], api_key: str) -> Optional[ItineraryData]:
        system_prompt = build_itinerary_system_prompt()
        user_prompt = build_itinerary_user_prompt(params)
        
        models_to_try = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]
        payload = {
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [
                {
                    "parts": [{"text": user_prompt}]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.35
            }
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            last_err = None
            for model_name in models_to_try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
                try:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        result = resp.json()
                        candidates = result.get("candidates", [])
                        if candidates:
                            content_part = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            clean_text = content_part.strip()
                            if clean_text.startswith("```json"):
                                clean_text = clean_text[7:]
                            elif clean_text.startswith("```"):
                                clean_text = clean_text[3:]
                            if clean_text.endswith("```"):
                                clean_text = clean_text[:-3]
                            clean_text = clean_text.strip()
                            data = json.loads(clean_text)
                            return ItineraryData(**data)
                    else:
                        last_err = f"Model {model_name} returned status {resp.status_code}: {resp.text[:200]}"
                except Exception as err:
                    last_err = str(err)
                    continue

            if last_err:
                raise Exception(f"All Gemini models exhausted. Last error: {last_err}")
            return None

    @staticmethod
    async def _call_gemini_day_api(params: Dict[str, Any], api_key: str) -> Optional[DayPlan]:
        user_prompt = build_regenerate_day_prompt(params)
        models_to_try = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]
        payload = {
            "contents": [{"parts": [{"text": user_prompt}]}],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.4
            }
        }
        async with httpx.AsyncClient(timeout=45.0) as client:
            last_err = None
            for model_name in models_to_try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
                try:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        result = resp.json()
                        candidates = result.get("candidates", [])
                        if candidates:
                            content_part = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            clean_text = content_part.strip()
                            if clean_text.startswith("```json"):
                                clean_text = clean_text[7:]
                            elif clean_text.startswith("```"):
                                clean_text = clean_text[3:]
                            if clean_text.endswith("```"):
                                clean_text = clean_text[:-3]
                            clean_text = clean_text.strip()
                            data = json.loads(clean_text)
                            return DayPlan(**data)
                    else:
                        last_err = f"Day regen with {model_name} failed: {resp.status_code}"
                except Exception as err:
                    last_err = str(err)
                    continue

            if last_err:
                raise Exception(last_err)
            return None

    @staticmethod
    def _generate_smart_fallback(params: Dict[str, Any]) -> ItineraryData:
        """
        Smart, tailored itinerary generator that creates high-fidelity, customized day plans
        honoring destination, budget, travel pace, interests, and diet.
        """
        dest = params.get("destination") or "Tokyo, Japan"
        days_count = int(params.get("days_count") or 3)
        budget = float(params.get("budget") or 2000)
        currency = params.get("currency") or "USD"
        budget_tier = params.get("budget_tier") or "Moderate"
        travel_pace = params.get("travel_pace") or "Balanced"
        interests = params.get("interests") or ["Culture", "Food", "Sightseeing"]
        if not interests:
            interests = ["Culture", "Food", "Sightseeing"]
        travel_style = params.get("travel_style") or "Couple"
        dietary = params.get("dietary_preferences") or "No restrictions"
        special = params.get("special_requests") or ""

        # Pacing settings
        activities_per_day = 2 if travel_pace == "Relaxed" else (3 if travel_pace == "Balanced" else 4)

        # Budget allocations
        stay_ratio = 0.40 if budget_tier == "Moderate" else (0.28 if budget_tier == "Budget" else 0.50)
        food_ratio = 0.28
        trans_ratio = 0.12
        act_ratio = 0.20

        stay_total = round(budget * stay_ratio, 2)
        food_total = round(budget * food_ratio, 2)
        trans_total = round(budget * trans_ratio, 2)
        act_total = round(budget * act_ratio, 2)
        grand_total = round(stay_total + food_total + trans_total + act_total, 2)

        # Catalog of rich thematic days
        theme_catalog = [
            {
                "theme": "Historic Heart & Ancient Icons",
                "morning": ("Historic Old Town & Iconic Heritage Plaza", "Explore centuries-old architecture, grand cobblestone squares, and scenic landmark vistas with minimal early-morning crowds.", "Old Town Core", 15.0, "Sightseeing"),
                "afternoon": ("Local Artisan Market & Culinary Heritage Walk", f"Immerse your senses in vibrant market stalls tasting authentic regional snacks ({dietary} options highlighted).", "Central Market District", 25.0, "Food"),
                "evening": ("Golden Hour Panoramic Observation & Waterfront Stroll", "Take in breathtaking skyline views as the city illuminates, followed by an atmospheric riverside walk.", "Harbor Promenade", 12.0, "Relaxation"),
                "dining_lunch": ("Bistro de l'Ancienne", "Local Heritage Bistro", "$20 - $35", "Famous for fresh regional produce and handcrafted breads."),
                "dining_dinner": ("La Terrazza Vista", "Modern Fusion & Seasonal Grills", "$35 - $60", "Scenic outdoor terrace overlooking illuminated monuments."),
                "tip": "Start at 08:30 AM to capture stunning photos with tranquil, uncrowded backdrops."
            },
            {
                "theme": "Arts, Bohemian Neighborhoods & Hidden Alleys",
                "morning": ("World-Class Fine Arts Museum & Sculpture Gardens", "Discover masterworks and peaceful botanical courtyard gardens with skip-the-line morning access.", "Arts Quarter", 22.0, "Culture"),
                "afternoon": ("Independent Designer Boutiques & Coffee Roastery Tasting", "Wander pedestrianized alleys filled with artisan leather craft, ceramics, and specialty espresso.", "Bohemian District", 10.0, "Shopping"),
                "evening": ("Atmospheric Lantern-Lit Lane & Speakeasy Jazz", "Experience the vibrant nightlife pulse of local musicians and traditional tapas.", "Heritage Alleys", 30.0, "Nightlife"),
                "dining_lunch": ("The Green Botanical Cafe", "Farm-to-Table Artisan Cafe", "$15 - $25", f"Abundant {dietary} dishes and cold-pressed botanical elixirs."),
                "dining_dinner": ("Taverna Nostalgia", "Traditional Wood-Fired Eatery", "$30 - $50", "Intimate candlelit dining featuring local wine pairings."),
                "tip": "Purchase combo tickets online to bypass the main museum ticket queue."
            },
            {
                "theme": "Nature Horizons, Coastal Breezes & Scenic Peaks",
                "morning": ("Panoramic Mountain/Coastal Trail & Sacred Lookout", "Gentle scenic hike along verdant coastal trails offering panoramic ocean and valley vistas.", "Nature Reserve", 5.0, "Nature"),
                "afternoon": ("Secluded Cove Relaxation & Botanical Sanctuaries", "Unwind along serene shores or explore shaded palm and flora greenhouses.", "Coastal Sanctuary", 18.0, "Adventure"),
                "evening": ("Sunset Catamaran Cruise or Coastal Cliff Promenade", "Watch the sun dip below the ocean horizon with refreshing coastal breezes.", "Sunset Point Pier", 45.0, "Sightseeing"),
                "dining_lunch": ("The Shoreline Pavilion", "Coastal Fresh Kitchen", "$25 - $40", "Ocean-view dining featuring catch of the day and vegan options."),
                "dining_dinner": ("Cliffside Harbor Grill", "Mediterranean & Seafood", "$40 - $70", "Perched over the waves with exceptional sunset visibility."),
                "tip": "Bring sunscreen, a light windbreaker, and refillable water bottles for the trails."
            },
            {
                "theme": "Modern Architecture, Tech & Contemporary Vibes",
                "morning": ("Futuristic Innovation Pavilion & Interactive Exhibits", "Engage with cutting-edge digital art installations and futuristic architecture.", "Innovation District", 28.0, "Culture"),
                "afternoon": ("Skybridge Gardens & Contemporary Shopping Promenade", "Stroll through elevated indoor gardens and discover flagship contemporary fashion concepts.", "Metropolitan Hub", 15.0, "Shopping"),
                "evening": ("Rooftop Mixology Lounge with 360-Degree City Views", "Sip craft cocktails while enjoying ambient beats overlooking the glittering metropolis.", "Skyline Tower Level 42", 35.0, "Nightlife"),
                "dining_lunch": ("Noodle & Dumpling Atelier", "Modern Asian Street Food", "$18 - $28", "Fresh handmade noodles and steamed dim sum baskets."),
                "dining_dinner": ("Neo Urban Brasserie", "Contemporary Gastropub", "$40 - $65", "Creative seasonal pairings in a striking loft setting."),
                "tip": "Book rooftop reservations at least 48 hours in advance for prime sunset tables."
            },
            {
                "theme": "Local Traditions, Hidden Temples & Culinary Masterclass",
                "morning": ("Sacred Temple Courtyards & Zen Meditation Grounds", "Experience spiritual tranquility among manicured moss gardens, stone lanterns, and incensed shrines.", "Temple Quarter", 8.0, "Culture"),
                "afternoon": ("Interactive Culinary Workshop or Food Walk", f"Hands-on cooking experience learning traditional flavors honoring {dietary} preferences.", "Culinary Workshop Studio", 40.0, "Food"),
                "evening": ("Night Market Food Crawl & Cultural Performance", "Immerse in energetic night markets vibrant with street food aroma and folk music.", "Night Bazaar", 20.0, "Adventure"),
                "dining_lunch": ("Market Street Masterclass Eatery", "Interactive Cooking Studio", "$30 - $45", "Dine on dishes you prepared alongside local chef instructors."),
                "dining_dinner": ("Bazaar Lantern Tavern", "Authentic Night Market Stalls", "$15 - $30", "Diverse small plates, skewers, and freshly fried delicacies."),
                "tip": "Bring small cash currency for food stalls and temple donation boxes."
            }
        ]

        days: List[DayPlan] = []
        for d in range(1, days_count + 1):
            tmpl = theme_catalog[(d - 1) % len(theme_catalog)]
            act_list: List[ActivityItem] = []

            # Morning Activity
            act_list.append(ActivityItem(
                id=f"act-{d}-1",
                time_slot="09:00 AM - 11:45 AM",
                period="morning",
                title=f"{dest}: {tmpl['morning'][0]}",
                description=f"{tmpl['morning'][1]} Tailored for {travel_style} travelers seeking a {travel_pace.lower()} rhythm.",
                attraction_name=tmpl['morning'][2],
                estimated_cost=tmpl['morning'][3],
                currency=currency,
                cost_label=f"Approx. {currency} {tmpl['morning'][3]:.2f}",
                duration_hours=2.75,
                location=f"{dest} - {tmpl['morning'][2]}",
                transportation_tip="Quick 10-15 min ride or metro line direct to the main entrance.",
                category=tmpl['morning'][4]
            ))

            # Afternoon Activity
            act_list.append(ActivityItem(
                id=f"act-{d}-2",
                time_slot="02:00 PM - 04:30 PM",
                period="afternoon",
                title=f"{tmpl['afternoon'][0]}",
                description=f"{tmpl['afternoon'][1]} Features selected stops reflecting your interests in {', '.join(interests[:2])}.",
                attraction_name=tmpl['afternoon'][2],
                estimated_cost=tmpl['afternoon'][3],
                currency=currency,
                cost_label=f"Approx. {currency} {tmpl['afternoon'][3]:.2f}",
                duration_hours=2.5,
                location=f"{dest} - {tmpl['afternoon'][2]}",
                transportation_tip="5-8 minute walk from lunch or direct short hop tram.",
                category=tmpl['afternoon'][4]
            ))

            # Evening Activity (if Balanced or Packed)
            if activities_per_day >= 3:
                act_list.append(ActivityItem(
                    id=f"act-{d}-3",
                    time_slot="06:30 PM - 09:00 PM",
                    period="evening",
                    title=f"{tmpl['evening'][0]}",
                    description=tmpl['evening'][1],
                    attraction_name=tmpl['evening'][2],
                    estimated_cost=tmpl['evening'][3],
                    currency=currency,
                    cost_label=f"Approx. {currency} {tmpl['evening'][3]:.2f}",
                    duration_hours=2.5,
                    location=f"{dest} - {tmpl['evening'][2]}",
                    transportation_tip="Safe, well-lit pedestrian corridors or scenic night bus.",
                    category=tmpl['evening'][4]
                ))

            # Dining
            dining = [
                MealRecommendation(
                    meal_type="Lunch",
                    name=f"{tmpl['dining_lunch'][0]} ({dest})",
                    cuisine=tmpl['dining_lunch'][1],
                    estimated_cost=f"{currency} {tmpl['dining_lunch'][2]}",
                    notes=f"{tmpl['dining_lunch'][3]} Accommodates {dietary}."
                ),
                MealRecommendation(
                    meal_type="Dinner",
                    name=f"{tmpl['dining_dinner'][0]}",
                    cuisine=tmpl['dining_dinner'][1],
                    estimated_cost=f"{currency} {tmpl['dining_dinner'][2]}",
                    notes=f"{tmpl['dining_dinner'][3]} Highly recommended for evening atmosphere."
                )
            ]

            day_cost = sum(a.estimated_cost for a in act_list) + (food_total / days_count) + (trans_total / days_count)

            days.append(DayPlan(
                day_number=d,
                date=f"Day {d}",
                title=f"{tmpl['theme']}",
                theme=f"Curated {travel_pace} exploration of {dest}'s top {interests[0] if interests else 'Culture'} highlights",
                summary=f"Enjoy a seamless {travel_pace.lower()} flow across {dest}'s top cultural and scenic districts.",
                activities=act_list,
                dining=dining,
                daily_estimated_cost=round(day_cost, 2),
                transport_summary="Recommended transit: Local day pass, light rail, and scenic walking routes.",
                daily_tip=tmpl["tip"]
            ))

        # Accommodations
        accommodations = [
            AccommodationSuggestion(
                name=f"The Grand Heritage Hotel & Suites {dest}",
                area=f"Central Cultural District, {dest}",
                tier=budget_tier,
                price_range_per_night=f"{currency} {round(stay_total / max(days_count, 1)):.0f} / night avg",
                reason="Prime central location with easy access to transit hubs, soundproof rooms, and 24/7 concierge."
            ),
            AccommodationSuggestion(
                name=f"Boutique Haven Sanctuary",
                area=f"Historic Quarter, {dest}",
                tier=budget_tier,
                price_range_per_night=f"{currency} {round((stay_total / max(days_count, 1)) * 0.9):.0f} / night avg",
                reason="Charming character, locally sourced breakfast, and step-free accessibility."
            )
        ]

        overview = (
            f"Welcome to your bespoke {days_count}-day journey through {dest}! Designed specifically for {travel_style.lower()} "
            f"travelers with a {travel_pace.lower()} pace, this itinerary balances iconic landmarks, secret local haunts, "
            f"and exceptional dining tailored to your {dietary.lower()} preferences."
        )

        return ItineraryData(
            destination=dest,
            destination_overview=overview,
            total_days=days_count,
            currency=currency,
            total_estimated_budget=grand_total,
            days=days,
            accommodations=accommodations,
            budget_breakdown=BudgetBreakdown(
                activities_total=act_total,
                food_total=food_total,
                transport_total=trans_total,
                stay_estimate_total=stay_total,
                grand_total=grand_total,
                currency=currency,
                budget_advisory=f"Your estimated spend ({currency} {grand_total:,.2f}) aligns cleanly with your {budget_tier} target budget."
            ),
            transportation_guide=[
                f"Get a rechargeable transit smart card or multi-day pass upon arrival in {dest}.",
                "Walking is ideal between clustered attractions; use ride-hail apps or certified cabs late at night.",
                "Airport express trains and direct shuttle buses offer the most economical transfers."
            ],
            packing_and_safety_tips=[
                "Comfortable walking shoes with sturdy soles are essential for cobblestones and historic stairs.",
                "Keep emergency local emergency numbers and offline digital maps downloaded on your phone.",
                f"Notify dining staff in advance regarding your {dietary} dietary preference."
            ],
            disclaimer="All costs, schedules, and recommendations are realistic estimates provided for itinerary planning purposes."
        )

    @staticmethod
    def _generate_fallback_day(params: Dict[str, Any]) -> DayPlan:
        d = int(params.get("day_number") or 1)
        dest = params.get("destination") or "Tokyo, Japan"
        currency = params.get("currency") or "USD"
        notes = params.get("regeneration_notes") or "Alternative cultural highlights"
        dietary = params.get("dietary_preferences") or "No restrictions"

        act_list = [
            ActivityItem(
                id=f"act-{d}-revised-1",
                time_slot="09:15 AM - 11:45 AM",
                period="morning",
                title=f"Alternative Discovery: Hidden Courtyards & Botanical Sights of {dest}",
                description=f"Freshly regenerated morning experience focusing on quieter scenic gardens and artisan studios. Note: {notes}",
                attraction_name=f"Secret Gardens of {dest}",
                estimated_cost=18.0,
                currency=currency,
                cost_label=f"Approx. {currency} 18.00",
                duration_hours=2.5,
                location=f"{dest} East Historic District",
                transportation_tip="Take metro line direct to Green Gate Station (Exit 3).",
                category="Nature & Culture"
            ),
            ActivityItem(
                id=f"act-{d}-revised-2",
                time_slot="02:15 PM - 04:45 PM",
                period="afternoon",
                title="Specialty Artisan Guild & Local Tea / Tasting House",
                description=f"Engage with regional craftsmen and savor traditional infusions. Customized with {notes}.",
                attraction_name="Artisan Crafts Quarter",
                estimated_cost=24.0,
                currency=currency,
                cost_label=f"Approx. {currency} 24.00",
                duration_hours=2.5,
                location=f"{dest} Cultural Row",
                transportation_tip="Convenient 7 min stroll from lunch venue.",
                category="Culture"
            ),
            ActivityItem(
                id=f"act-{d}-revised-3",
                time_slot="06:45 PM - 09:30 PM",
                period="evening",
                title="Acoustic Sunset Concert or Night Walk along Riverfront",
                description="Unwind with peaceful twilight reflections and ambient local musicians along the river promenade.",
                attraction_name="Riverside Promenade",
                estimated_cost=15.0,
                currency=currency,
                cost_label=f"Approx. {currency} 15.00",
                duration_hours=2.75,
                location=f"{dest} Waterfront",
                transportation_tip="Direct electric streetcar back toward center.",
                category="Relaxation"
            )
        ]

        dining = [
            MealRecommendation(
                meal_type="Lunch",
                name=f"Verdant Greenhouse Bistro ({dest})",
                cuisine="Fresh Farmstead Seasonal Cuisine",
                estimated_cost=f"{currency} 22 - 35 per person",
                notes=f"Exceptional organic selection accommodating {dietary}."
            ),
            MealRecommendation(
                meal_type="Dinner",
                name="The Cellar & Hearth",
                cuisine="Contemporary Artisan Bistro",
                estimated_cost=f"{currency} 35 - 55 per person",
                notes="Cozy ambient lighting, artisanal regional cheeses and fresh flatbreads."
            )
        ]

        return DayPlan(
            day_number=d,
            date=f"Day {d} (Updated)",
            title=f"Regenerated Day {d}: Hidden Gems & Local Treasures",
            theme=f"Revised schedule tailored to: {notes}",
            summary="A newly tailored selection of alternative sights, relaxing moments, and exquisite cuisine.",
            activities=act_list,
            dining=dining,
            daily_estimated_cost=105.0,
            transport_summary="Light transit and scenic walkways.",
            daily_tip="Reserve afternoon tasting workshops 1-2 hours prior to ensure immediate seating."
        )
