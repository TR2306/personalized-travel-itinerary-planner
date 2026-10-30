import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status, Response
from app.database import DBManager
from app.routes.auth import get_current_user
from app.schemas.user import UserResponse
from app.schemas.trip import TripCreate, TripUpdate, TripResponse
from app.utils.pdf_service import generate_itinerary_pdf

router = APIRouter(prefix="/trips", tags=["Trips"])

@router.get("", response_model=List[TripResponse])
async def list_trips(current_user: UserResponse = Depends(get_current_user)):
    """Retrieve authenticated user's saved trips."""
    trips = DBManager.get_trips(current_user.id)
    return [TripResponse(**t) for t in trips]

@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def create_trip(trip_in: TripCreate, current_user: UserResponse = Depends(get_current_user)):
    """Save a new trip."""
    trip_data = trip_in.model_dump()
    trip_data["user_id"] = current_user.id
    created = DBManager.create_trip(trip_data)
    return TripResponse(**created)

@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(trip_id: str, current_user: UserResponse = Depends(get_current_user)):
    """Retrieve a particular trip."""
    trip = DBManager.get_trip(trip_id, user_id=current_user.id)
    if not trip:
        # Check without user constraint for shared/public viewing or error
        trip = DBManager.get_trip(trip_id)
        if not trip:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return TripResponse(**trip)

@router.put("/{trip_id}", response_model=TripResponse)
async def update_trip(trip_id: str, trip_in: TripUpdate, current_user: UserResponse = Depends(get_current_user)):
    """Update trip information."""
    updates = trip_in.model_dump(exclude_unset=True)
    updated = DBManager.update_trip(trip_id, updates, user_id=current_user.id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found or update failed")
    return TripResponse(**updated)

@router.delete("/{trip_id}", status_code=status.HTTP_200_OK)
async def delete_trip(trip_id: str, current_user: UserResponse = Depends(get_current_user)):
    """Delete a trip."""
    success = DBManager.delete_trip(trip_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found or could not be deleted")
    return {"message": "Trip deleted successfully", "id": trip_id}

@router.post("/{trip_id}/duplicate", response_model=TripResponse)
async def duplicate_trip(trip_id: str, current_user: UserResponse = Depends(get_current_user)):
    """Duplicate an existing trip and its itinerary."""
    original = DBManager.get_trip(trip_id, user_id=current_user.id)
    if not original:
        original = DBManager.get_trip(trip_id)
        if not original:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Original trip not found")

    new_id = str(uuid.uuid4())
    dup_data = dict(original)
    dup_data["id"] = new_id
    dup_data["user_id"] = current_user.id
    dup_data["destination"] = f"{original['destination']} (Copy)"
    dup_data.pop("itinerary_id", None)
    itinerary_data = dup_data.pop("itinerary_data", None)

    created_trip = DBManager.create_trip(dup_data)
    if itinerary_data:
        DBManager.save_itinerary(
            trip_id=new_id,
            itinerary_data=itinerary_data,
            estimated_cost=itinerary_data.get("total_estimated_budget", original.get("budget", 0))
        )
        created_trip = DBManager.get_trip(new_id, current_user.id)

    return TripResponse(**created_trip)

@router.get("/{trip_id}/pdf")
async def export_trip_pdf(trip_id: str, current_user: UserResponse = Depends(get_current_user)):
    """Generate and return a beautifully formatted PDF of the trip itinerary."""
    trip = DBManager.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    
    itinerary_data = trip.get("itinerary_data")
    if not itinerary_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No itinerary generated for this trip yet")

    pdf_bytes = generate_itinerary_pdf(itinerary_data, trip_info=trip)
    
    clean_dest = "".join(c for c in trip.get("destination", "Trip") if c.isalnum() or c in (' ', '-', '_')).rstrip()
    filename = f"Itinerary_{clean_dest.replace(' ', '_')}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
