import sys
from pathlib import Path
import asyncio
import uuid

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

print("Starting RoamAI full verification suite...", flush=True)

from app.schemas.trip import TripCreate, TripUpdate
from app.schemas.itinerary import (
    GenerateItineraryRequest, RegenerateItineraryRequest, RegenerateDayRequest
)
from app.services.itinerary_service import ItineraryService
from app.database import DBManager
from app.utils.pdf_service import generate_itinerary_pdf

async def run_tests():
    # 1. User Creation
    test_email = f"traveler_{uuid.uuid4().hex[:6]}@roamai.com"
    print(f"1. Testing DBManager.create_user with {test_email}...", flush=True)
    user = DBManager.create_user({
        "name": "Sarah Jenkins",
        "email": test_email,
        "travel_preferences": {"preferred_currency": "EUR", "default_pace": "Balanced"}
    })
    assert user["id"] is not None
    print(f"   [PASS] User created: {user['id']}", flush=True)

    # 2. Trip Creation
    print("2. Testing DBManager.create_trip...", flush=True)
    trip_data = {
        "user_id": user["id"],
        "destination": "Kyoto, Japan",
        "start_location": "Tokyo",
        "start_date": "2026-11-10",
        "end_date": "2026-11-14",
        "days_count": 4,
        "budget": 2400.0,
        "currency": "USD",
        "budget_tier": "Moderate",
        "travel_style": "Couple",
        "travelers_count": 2,
        "travel_pace": "Balanced",
        "interests": ["Culture", "Food", "History"],
        "dietary_preferences": "Vegetarian",
    }
    created_trip = DBManager.create_trip(trip_data)
    trip_id = created_trip["id"]
    assert trip_id is not None
    print(f"   [PASS] Trip record created: {trip_id}", flush=True)

    # 3. AI Itinerary Generation
    print("3. Testing ItineraryService.generate_itinerary...", flush=True)
    gen_req = GenerateItineraryRequest(
        destination="Kyoto, Japan",
        start_date="2026-11-10",
        end_date="2026-11-14",
        days_count=4,
        budget=2400.0,
        currency="USD",
        budget_tier="Moderate",
        travel_style="Couple",
        travelers_count=2,
        travel_pace="Balanced",
        interests=["Culture", "Food", "History"],
        dietary_preferences="Vegetarian",
        trip_id=trip_id
    )
    result = await ItineraryService.generate_itinerary(gen_req)
    itinerary_data = result["itinerary_data"]
    assert len(itinerary_data["days"]) == 4
    assert len(itinerary_data["accommodations"]) > 0
    assert "budget_breakdown" in itinerary_data
    print(f"   [PASS] Generated 4-day itinerary! Activities on Day 1: {len(itinerary_data['days'][0]['activities'])}", flush=True)

    # 4. Regenerate a Single Day (Day 2)
    print("4. Testing ItineraryService.regenerate_day (Day 2)...", flush=True)
    regen_day_req = RegenerateDayRequest(
        trip_id=trip_id,
        destination="Kyoto, Japan",
        day_number=2,
        total_days=4,
        regeneration_notes="Focus more on Arashiyama bamboo forest and quiet Zen gardens",
        dietary_preferences="Vegetarian"
    )
    regen_result = await ItineraryService.regenerate_day(regen_day_req)
    assert regen_result["day_plan"]["day_number"] == 2
    print(f"   [PASS] Day 2 regenerated: {regen_result['day_plan']['title']}", flush=True)

    # 5. Full Itinerary Regeneration with Custom Feedback
    print("5. Testing ItineraryService.regenerate_itinerary...", flush=True)
    regen_trip_req = RegenerateItineraryRequest(
        destination="Kyoto, Japan",
        start_date="2026-11-10",
        end_date="2026-11-14",
        days_count=4,
        budget=2400.0,
        currency="USD",
        budget_tier="Moderate",
        travel_style="Couple",
        travelers_count=2,
        travel_pace="Balanced",
        interests=["Culture", "Food", "History"],
        dietary_preferences="Vegetarian",
        trip_id=trip_id,
        custom_feedback="Include authentic matcha tasting experiences in Uji"
    )
    regen_trip_res = await ItineraryService.regenerate_itinerary(regen_trip_req)
    assert len(regen_trip_res["itinerary_data"]["days"]) == 4
    print("   [PASS] Full trip re-synthesized with user feedback incorporated!", flush=True)

    # 6. PDF Generation
    print("6. Testing generate_itinerary_pdf...", flush=True)
    pdf_bytes = generate_itinerary_pdf(regen_trip_res["itinerary_data"], trip_info=created_trip)
    assert len(pdf_bytes) > 1000
    print(f"   [PASS] PDF generated successfully ({len(pdf_bytes):,} bytes)", flush=True)

    # 7. Trip Retrieval & Update
    print("7. Testing DBManager.get_trips and DBManager.update_trip...", flush=True)
    trips = DBManager.get_trips(user["id"])
    assert len(trips) >= 1
    updated = DBManager.update_trip(trip_id, {"status": "completed"}, user_id=user["id"])
    assert updated["status"] == "completed"
    print("   [PASS] Trip status updated to 'completed'", flush=True)

    # 8. Trip Deletion
    print("8. Testing DBManager.delete_trip...", flush=True)
    deleted = DBManager.delete_trip(trip_id, user_id=user["id"])
    assert deleted is True
    print("   [PASS] Trip deleted cleanly", flush=True)

    print("\n=======================================================", flush=True)
    print(" SUCCESS: ALL 8 BACKEND INTEGRATION TESTS PASSED 100%!", flush=True)
    print("=======================================================", flush=True)

if __name__ == "__main__":
    asyncio.run(run_tests())
