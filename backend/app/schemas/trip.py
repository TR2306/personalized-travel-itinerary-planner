from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class TripBase(BaseModel):
    destination: str = Field(..., example="Kyoto, Japan")
    start_location: Optional[str] = Field(None, example="Tokyo")
    start_date: str = Field(..., example="2026-11-10")
    end_date: str = Field(..., example="2026-11-15")
    days_count: int = Field(..., ge=1, le=30, example=5)
    budget: float = Field(..., ge=1, example=2500)
    currency: str = Field(default="USD", example="USD")
    budget_tier: str = Field(default="Moderate", example="Moderate")
    travel_style: str = Field(default="Couple", example="Couple")
    travelers_count: int = Field(default=2, ge=1, example=2)
    travel_pace: str = Field(default="Balanced", example="Balanced")
    interests: List[str] = Field(default_factory=list, example=["Culture", "Food", "History"])
    accommodation_pref: Optional[str] = Field(default="Boutique Hotel", example="Boutique Hotel")
    transportation_pref: Optional[str] = Field(default="Public Transit & Cabs", example="Public Transit")
    dietary_preferences: Optional[str] = Field(default="No restrictions", example="Vegetarian")
    accessibility_needs: Optional[str] = Field(default="None", example="Step-free access")
    special_requests: Optional[str] = Field(default=None, example="Must visit Fushimi Inari at sunrise")

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    destination: Optional[str] = None
    start_location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    days_count: Optional[int] = None
    budget: Optional[float] = None
    currency: Optional[str] = None
    budget_tier: Optional[str] = None
    travel_style: Optional[str] = None
    travelers_count: Optional[int] = None
    travel_pace: Optional[str] = None
    interests: Optional[List[str]] = None
    accommodation_pref: Optional[str] = None
    transportation_pref: Optional[str] = None
    dietary_preferences: Optional[str] = None
    accessibility_needs: Optional[str] = None
    special_requests: Optional[str] = None
    status: Optional[str] = None

class TripResponse(TripBase):
    id: str
    user_id: str
    status: str = "planned"
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    itinerary_id: Optional[str] = None
    itinerary_data: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
