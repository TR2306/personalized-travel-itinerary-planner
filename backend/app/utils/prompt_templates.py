import json
from typing import Dict, Any

def build_itinerary_system_prompt() -> str:
    return """You are RoamAI, an elite expert travel architect, local cultural specialist, and itinerary optimization engine.
Your mission is to produce a bespoke, realistic, geographically optimized day-by-day travel itinerary strictly formatted in valid JSON.

CRITICAL RULES & OPTIMIZATION GUIDELINES:
1. GEOGRAPHIC CLUSTERING: Group attractions located in the same neighborhood or transit corridor into the same morning/afternoon/evening session to eliminate wasted commute time.
2. PACING REALISM: Match the user's travel pace:
   - Relaxed: 1-2 curated activities per day, leisurely meals, ample downtime.
   - Balanced: 2-3 activities per day with smooth transit and pleasant meal breaks.
   - Packed: 3-4 dynamic highlights per day with early starts and vibrant evenings.
3. BUDGET DISCIPLINE: Total estimated expenses across activities, dining, transport, and lodging must closely honor the user's specified budget and budget tier (Budget, Moderate, Luxury).
4. ACCESSIBILITY & DIETARY: Strictly respect dietary preferences (e.g. Vegetarian, Halal, Vegan) in restaurant picks and adhere to any accessibility needs (e.g. step-free, wheelchair-friendly).
5. STRUCTURED INTEGRITY: Return ONLY valid JSON conforming to the exact schema specified. No markdown fences outside the JSON object, no commentary before or after.
6. ESTIMATES DISCLAIMER: All prices and times are realistic estimates."""

def build_itinerary_user_prompt(data: Dict[str, Any]) -> str:
    destination = data.get("destination", "Tokyo, Japan")
    start_location = data.get("start_location", "Local airport/station")
    start_date = data.get("start_date", "2026-11-10")
    end_date = data.get("end_date", "2026-11-15")
    days_count = data.get("days_count", 5)
    budget = data.get("budget", 2000)
    currency = data.get("currency", "USD")
    budget_tier = data.get("budget_tier", "Moderate")
    travel_style = data.get("travel_style", "Couple")
    travelers_count = data.get("travelers_count", 2)
    travel_pace = data.get("travel_pace", "Balanced")
    interests = ", ".join(data.get("interests", ["Culture", "Food", "Sightseeing"]))
    accommodation_pref = data.get("accommodation_pref", "Boutique Hotel")
    transportation_pref = data.get("transportation_pref", "Public transit & walking")
    dietary_preferences = data.get("dietary_preferences", "No restrictions")
    accessibility_needs = data.get("accessibility_needs", "None")
    special_requests = data.get("special_requests", "None")
    feedback = data.get("custom_feedback", None)

    prompt = f"""Generate a comprehensive, personalized {days_count}-day travel itinerary for:
- Destination: {destination}
- Origin / Starting Point: {start_location}
- Dates: {start_date} to {end_date} ({days_count} days)
- Total Estimated Budget: {currency} {budget:,.2f} ({budget_tier} tier)
- Party: {travel_style} ({travelers_count} traveler(s))
- Pacing Preference: {travel_pace}
- Core Travel Interests: {interests}
- Accommodation Style: {accommodation_pref}
- Preferred Local Transport: {transportation_pref}
- Dietary Guidelines: {dietary_preferences}
- Accessibility Requirements: {accessibility_needs}
- Special Requests & Highlights: {special_requests}
"""
    if feedback:
        prompt += f"- User Custom Modification Feedback: {feedback}\n"

    prompt += f"""
Return a valid JSON object matching this exact schema:
{{
  "destination": "{destination}",
  "destination_overview": "Compelling 2-3 sentence overview highlighting what makes this trip special for this traveler profile.",
  "total_days": {days_count},
  "currency": "{currency}",
  "total_estimated_budget": {budget},
  "days": [
    {{
      "day_number": 1,
      "date": "Day 1",
      "title": "Inspiring thematic title for Day 1",
      "theme": "Core theme of this day",
      "summary": "1-2 sentence overview of the day's journey",
      "activities": [
        {{
          "id": "act-1-1",
          "time_slot": "09:00 AM - 11:30 AM",
          "period": "morning",
          "title": "Activity Title",
          "description": "Engaging description with specific sights and insider guidance.",
          "attraction_name": "Specific Landmark or Area",
          "estimated_cost": 15.0,
          "currency": "{currency}",
          "cost_label": "Approx. {currency} 15 / ticket",
          "duration_hours": 2.5,
          "location": "Neighborhood or street address",
          "transportation_tip": "Specific transit line, walking minutes, or taxi advice",
          "category": "Culture / Sightseeing / Food / Adventure"
        }}
      ],
      "dining": [
        {{
          "meal_type": "Breakfast / Lunch / Dinner",
          "name": "Specific restaurant name matching dietary preference",
          "cuisine": "Cuisine type",
          "estimated_cost": "{currency} 20 - 35 per person",
          "notes": "Signature dish recommendation or booking advice"
        }}
      ],
      "daily_estimated_cost": 85.0,
      "transport_summary": "Quick summary of best transit options for today's route",
      "daily_tip": "Insider local tip for maximizing this day"
    }}
  ],
  "accommodations": [
    {{
      "name": "Hotel / Stay Name",
      "area": "Neighborhood name",
      "tier": "{budget_tier}",
      "price_range_per_night": "{currency} 120 - 180 / night",
      "reason": "Why this area and property matches the traveler preferences"
    }}
  ],
  "budget_breakdown": {{
    "activities_total": 240.0,
    "food_total": 450.0,
    "transport_total": 110.0,
    "stay_estimate_total": 900.0,
    "grand_total": 1700.0,
    "currency": "{currency}",
    "budget_advisory": "Budget guidance note indicating healthy buffer or realistic expectations"
  }},
  "transportation_guide": [
    "Key transport tip 1 (e.g. Metro card / pass)",
    "Key transport tip 2 (e.g. Rideshare apps, airport links)"
  ],
  "packing_and_safety_tips": [
    "Practical seasonal clothing tip",
    "Local safety or cultural etiquette tip"
  ],
  "disclaimer": "All costs and hours are realistic estimates subject to seasonal variation and local holiday changes."
}}

Make sure every single day from Day 1 to Day {days_count} is fully detailed with morning, afternoon, and evening activities and matching dining recommendations.
"""
    return prompt

def build_regenerate_day_prompt(data: Dict[str, Any]) -> str:
    day_number = data.get("day_number", 1)
    destination = data.get("destination", "Tokyo, Japan")
    notes = data.get("regeneration_notes", "Provide fresh alternative attractions and local hidden gems.")
    travel_pace = data.get("travel_pace", "Balanced")
    interests = ", ".join(data.get("interests", ["Culture", "Food"]))
    dietary_preferences = data.get("dietary_preferences", "No restrictions")
    currency = data.get("currency", "USD")

    prompt = f"""Regenerate ONLY Day {day_number} of the itinerary for {destination}.
Requirements:
- Day Number: {day_number}
- Travel Pace: {travel_pace}
- Interests: {interests}
- Dietary: {dietary_preferences}
- Specific User Customization Request: {notes}

Return a valid JSON object matching this DayPlan schema for ONLY Day {day_number}:
{{
  "day_number": {day_number},
  "date": "Day {day_number}",
  "title": "Fresh Inspiring thematic title for Day {day_number}",
  "theme": "Core theme",
  "summary": "1-2 sentence overview of the newly curated day",
  "activities": [
    {{
      "id": "act-{day_number}-1",
      "time_slot": "09:00 AM - 11:30 AM",
      "period": "morning",
      "title": "Activity Title",
      "description": "Engaging description with specific sights and insider guidance.",
      "attraction_name": "Specific Landmark or Area",
      "estimated_cost": 20.0,
      "currency": "{currency}",
      "cost_label": "Approx. {currency} 20",
      "duration_hours": 2.5,
      "location": "Neighborhood",
      "transportation_tip": "Specific transit line or walking minutes",
      "category": "Culture"
    }}
  ],
  "dining": [
    {{
      "meal_type": "Lunch",
      "name": "Restaurant Name",
      "cuisine": "Cuisine",
      "estimated_cost": "{currency} 25 per person",
      "notes": "Signature dish recommendation"
    }}
  ],
  "daily_estimated_cost": 90.0,
  "transport_summary": "Best transit tips for today",
  "daily_tip": "Insider tip for this revised schedule"
}}
"""
    return prompt
