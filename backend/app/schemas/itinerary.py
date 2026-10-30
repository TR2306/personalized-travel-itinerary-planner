from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ActivityItem(BaseModel):
    id: str = Field(..., example="act-1-1")
    time_slot: str = Field(..., example="09:00 AM - 11:30 AM")
    period: str = Field(..., example="morning") # morning, afternoon, evening
    title: str = Field(..., example="Explore Fushimi Inari Taisha")
    description: str = Field(..., example="Walk through the thousands of vermilion torii gates along sacred Mount Inari.")
    attraction_name: Optional[str] = Field(None, example="Fushimi Inari Shrine")
    estimated_cost: float = Field(default=0.0, example=0.0)
    currency: str = Field(default="USD", example="USD")
    cost_label: str = Field(default="Free admission", example="Free admission")
    duration_hours: float = Field(default=2.5, example=2.5)
    location: str = Field(..., example="Fushimi Ward, Kyoto")
    transportation_tip: Optional[str] = Field(None, example="JR Nara Line from Kyoto Station to Inari Station (5 mins)")
    category: str = Field(default="Culture", example="Culture")

class MealRecommendation(BaseModel):
    meal_type: str = Field(..., example="Lunch") # Breakfast, Lunch, Dinner
    name: str = Field(..., example="Nishiki Warai")
    cuisine: str = Field(..., example="Kyoto-style Okonomiyaki & Yakisoba")
    estimated_cost: str = Field(..., example="$15 - $25 per person")
    notes: Optional[str] = Field(None, example="Try their specialty green onion and pork savory pancake.")

class DayPlan(BaseModel):
    day_number: int = Field(..., example=1)
    date: Optional[str] = Field(None, example="Day 1 - Nov 10")
    title: str = Field(..., example="Spiritual Kyoto & Torii Gates")
    theme: str = Field(..., example="Ancient shrines and heritage pathways")
    summary: str = Field(..., example="Begin your journey with Kyoto's iconic shrine before savoring traditional street cuisine.")
    activities: List[ActivityItem] = Field(default_factory=list)
    dining: List[MealRecommendation] = Field(default_factory=list)
    daily_estimated_cost: float = Field(default=0.0)
    transport_summary: str = Field(..., example="Use Kyoto City Bus One-Day pass or IC card for subways.")
    daily_tip: str = Field(..., example="Wear comfortable walking shoes; the shrine mountain trail has stone steps.")

class AccommodationSuggestion(BaseModel):
    name: str = Field(..., example="Hotel The Celestine Kyoto Gion")
    area: str = Field(..., example="Gion / Higashiyama")
    tier: str = Field(..., example="Boutique / Upper Moderate")
    price_range_per_night: str = Field(..., example="$180 - $240 / night")
    reason: str = Field(..., example="Walking distance to evening dining and geisha district, tranquil traditional design.")

class BudgetBreakdown(BaseModel):
    activities_total: float = Field(default=0.0)
    food_total: float = Field(default=0.0)
    transport_total: float = Field(default=0.0)
    stay_estimate_total: float = Field(default=0.0)
    grand_total: float = Field(default=0.0)
    currency: str = Field(default="USD")
    budget_advisory: str = Field(..., example="Estimated cost is within your specified target budget.")

class ItineraryData(BaseModel):
    destination: str
    destination_overview: str
    total_days: int
    currency: str = "USD"
    total_estimated_budget: float
    days: List[DayPlan]
    accommodations: List[AccommodationSuggestion] = Field(default_factory=list)
    budget_breakdown: BudgetBreakdown
    transportation_guide: List[str] = Field(default_factory=list)
    packing_and_safety_tips: List[str] = Field(default_factory=list)
    disclaimer: str = Field(
        default="All costs and hours are realistic estimates subject to seasonal variation and local holiday changes."
    )

# Request Models
class GenerateItineraryRequest(BaseModel):
    destination: str
    start_location: Optional[str] = None
    start_date: str
    end_date: str
    days_count: int
    budget: float
    currency: str = "USD"
    budget_tier: str = "Moderate"
    travel_style: str = "Couple"
    travelers_count: int = 2
    travel_pace: str = "Balanced"
    interests: List[str] = Field(default_factory=list)
    accommodation_pref: Optional[str] = None
    transportation_pref: Optional[str] = None
    dietary_preferences: Optional[str] = None
    accessibility_needs: Optional[str] = None
    special_requests: Optional[str] = None
    trip_id: Optional[str] = None
    custom_gemini_key: Optional[str] = None

class RegenerateItineraryRequest(GenerateItineraryRequest):
    custom_feedback: Optional[str] = None

class RegenerateDayRequest(BaseModel):
    trip_id: Optional[str] = None
    destination: str
    day_number: int
    total_days: int
    current_day_plan: Optional[DayPlan] = None
    full_itinerary_summary: Optional[str] = None
    travel_pace: str = "Balanced"
    interests: List[str] = Field(default_factory=list)
    budget_tier: str = "Moderate"
    currency: str = "USD"
    dietary_preferences: Optional[str] = None
    special_requests: Optional[str] = None
    regeneration_notes: Optional[str] = None
    custom_gemini_key: Optional[str] = None

class SaveItineraryRequest(BaseModel):
    trip_id: str
    itinerary_data: Dict[str, Any]
    estimated_cost: float

class ItineraryResponse(BaseModel):
    id: str
    trip_id: str
    itinerary_data: ItineraryData
    estimated_cost: float
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
