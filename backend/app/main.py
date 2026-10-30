from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.routes.auth import router as auth_router
from app.routes.trips import router as trips_router
from app.routes.itinerary import router as itinerary_router
from app.database import is_supabase_configured

app = FastAPI(
    title="RoamAI - Personalized Travel Itinerary Planner API",
    description="Full-stack AI-Powered Travel Itinerary Engine using React, FastAPI, Supabase, and Gemini AI.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route registrations
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(trips_router, prefix=settings.API_PREFIX)
app.include_router(itinerary_router, prefix=settings.API_PREFIX)

@app.get("/")
async def root():
    return {
        "app": "RoamAI API",
        "version": settings.VERSION,
        "docs": "/docs",
        "status": "online"
    }

@app.get(f"{settings.API_PREFIX}/health")
async def health_check():
    gemini_ready = bool(settings.GEMINI_API_KEY and "your_gemini" not in settings.GEMINI_API_KEY)
    return {
        "status": "healthy",
        "database": "supabase_cloud" if is_supabase_configured else "embedded_sqlite_ready",
        "supabase_connected": is_supabase_configured,
        "gemini_ai_configured": gemini_ready,
        "environment": "development"
    }

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "detail": str(exc)}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
