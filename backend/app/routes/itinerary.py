from fastapi import APIRouter, HTTPException, Depends, Header, status, Response
from typing import Dict, Any, Optional
from app.services.itinerary_service import ItineraryService
from app.database import DBManager
from app.routes.auth import get_current_user
from app.schemas.user import UserResponse
from app.schemas.itinerary import (
    GenerateItineraryRequest, RegenerateItineraryRequest,
    RegenerateDayRequest, SaveItineraryRequest, ItineraryData
)
from app.utils.pdf_service import generate_itinerary_pdf

router = APIRouter(prefix="/itinerary", tags=["AI Itinerary Engine"])

@router.post("/generate")
async def generate_itinerary(
    req: GenerateItineraryRequest,
    current_user: UserResponse = Depends(get_current_user),
    x_gemini_key: Optional[str] = Header(None, alias="X-Gemini-Key")
):
    """
    Generate a personalized, day-by-day travel itinerary using Generative AI.
    Considers destination, dates, budget, travel style, interests, pace, and dietary preferences.
    """
    try:
        if not req.custom_gemini_key and x_gemini_key:
            req.custom_gemini_key = x_gemini_key
        result = await ItineraryService.generate_itinerary(req)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate itinerary: {str(e)}"
        )

@router.post("/regenerate")
async def regenerate_itinerary(
    req: RegenerateItineraryRequest,
    current_user: UserResponse = Depends(get_current_user),
    x_gemini_key: Optional[str] = Header(None, alias="X-Gemini-Key")
):
    """
    Regenerate the complete itinerary incorporating custom user feedback or revised preferences.
    """
    try:
        if not req.custom_gemini_key and x_gemini_key:
            req.custom_gemini_key = x_gemini_key
        result = await ItineraryService.regenerate_itinerary(req)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to regenerate itinerary: {str(e)}"
        )

@router.post("/regenerate-day")
async def regenerate_day(
    req: RegenerateDayRequest,
    current_user: UserResponse = Depends(get_current_user),
    x_gemini_key: Optional[str] = Header(None, alias="X-Gemini-Key")
):
    """
    Regenerate a single selected day, preserving all other days in the trip.
    """
    try:
        if not req.custom_gemini_key and x_gemini_key:
            req.custom_gemini_key = x_gemini_key
        result = await ItineraryService.regenerate_day(req)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to regenerate day: {str(e)}"
        )

@router.post("/save")
async def save_itinerary(
    req: SaveItineraryRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Explicitly save or update the itinerary JSON and estimated cost for a given trip.
    """
    # Verify trip ownership
    trip = DBManager.get_trip(req.trip_id, user_id=current_user.id)
    if not trip:
        # Check without user filter in case created in guest/demo mode
        trip = DBManager.get_trip(req.trip_id)
        if not trip:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    saved = DBManager.save_itinerary(
        trip_id=req.trip_id,
        itinerary_data=req.itinerary_data,
        estimated_cost=req.estimated_cost
    )
    return saved

@router.post("/export-pdf")
async def export_raw_itinerary_pdf(itinerary_payload: Dict[str, Any]):
    """
    Export any valid ItineraryData directly to a styled PDF.
    """
    try:
        pdf_bytes = generate_itinerary_pdf(itinerary_payload)
        dest = itinerary_payload.get("destination", "Itinerary")
        clean_name = "".join(c for c in dest if c.isalnum() or c in (' ', '-', '_')).rstrip()
        filename = f"Itinerary_{clean_name.replace(' ', '_')}.pdf"
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile PDF: {str(e)}"
        )
