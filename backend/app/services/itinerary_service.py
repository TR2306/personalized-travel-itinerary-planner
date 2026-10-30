from typing import Dict, Any, Optional
from app.services.ai_service import AIService
from app.database import DBManager
from app.schemas.itinerary import (
    GenerateItineraryRequest, RegenerateItineraryRequest,
    RegenerateDayRequest, ItineraryData, DayPlan
)

class ItineraryService:
    @staticmethod
    async def generate_itinerary(req: GenerateItineraryRequest) -> Dict[str, Any]:
        params = req.model_dump()
        itinerary_data: ItineraryData = await AIService.generate_itinerary(params)
        
        # If a trip_id was provided, save directly to DB
        saved_record = None
        if req.trip_id:
            saved_record = DBManager.save_itinerary(
                trip_id=req.trip_id,
                itinerary_data=itinerary_data.model_dump(),
                estimated_cost=itinerary_data.total_estimated_budget
            )
        
        return {
            "itinerary_data": itinerary_data.model_dump(),
            "trip_id": req.trip_id,
            "itinerary_id": saved_record["id"] if saved_record else None,
            "estimated_cost": itinerary_data.total_estimated_budget
        }

    @staticmethod
    async def regenerate_itinerary(req: RegenerateItineraryRequest) -> Dict[str, Any]:
        params = req.model_dump()
        itinerary_data: ItineraryData = await AIService.generate_itinerary(params)
        
        saved_record = None
        if req.trip_id:
            saved_record = DBManager.save_itinerary(
                trip_id=req.trip_id,
                itinerary_data=itinerary_data.model_dump(),
                estimated_cost=itinerary_data.total_estimated_budget
            )

        return {
            "itinerary_data": itinerary_data.model_dump(),
            "trip_id": req.trip_id,
            "itinerary_id": saved_record["id"] if saved_record else None,
            "estimated_cost": itinerary_data.total_estimated_budget
        }

    @staticmethod
    async def regenerate_day(req: RegenerateDayRequest) -> Dict[str, Any]:
        params = req.model_dump()
        new_day: DayPlan = await AIService.regenerate_single_day(params)

        # If trip_id is present, update the day in the existing trip's itinerary without losing other days!
        if req.trip_id:
            trip = DBManager.get_trip(req.trip_id)
            if trip and trip.get("itinerary_data"):
                it_dict = trip["itinerary_data"]
                days = it_dict.get("days", [])
                
                # Replace the target day
                updated_days = []
                found = False
                for d in days:
                    if d.get("day_number") == req.day_number:
                        updated_days.append(new_day.model_dump())
                        found = True
                    else:
                        updated_days.append(d)
                
                if not found:
                    updated_days.append(new_day.model_dump())
                
                # Re-sort by day_number
                updated_days.sort(key=lambda x: x.get("day_number", 1))
                it_dict["days"] = updated_days

                # Recalculate totals
                act_total = sum(
                    sum(a.get("estimated_cost", 0) for a in day.get("activities", []))
                    for day in updated_days
                )
                if "budget_breakdown" in it_dict:
                    it_dict["budget_breakdown"]["activities_total"] = act_total
                    b = it_dict["budget_breakdown"]
                    b["grand_total"] = round(
                        act_total + b.get("food_total", 0) + b.get("transport_total", 0) + b.get("stay_estimate_total", 0), 2
                    )
                    it_dict["total_estimated_budget"] = b["grand_total"]

                DBManager.save_itinerary(
                    trip_id=req.trip_id,
                    itinerary_data=it_dict,
                    estimated_cost=it_dict.get("total_estimated_budget", 0)
                )

                return {
                    "day_plan": new_day.model_dump(),
                    "full_itinerary": it_dict,
                    "trip_id": req.trip_id
                }

        return {
            "day_plan": new_day.model_dump(),
            "trip_id": req.trip_id
        }
