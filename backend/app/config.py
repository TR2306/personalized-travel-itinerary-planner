import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from backend root
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME: str = "RoamAI Personalized Travel Planner"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # AI Config
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Supabase Config
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # Security & Fallback Auth
    JWT_SECRET: str = os.getenv("JWT_SECRET", "roamai-super-secure-travel-jwt-secret-key-32chars")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ]

settings = Settings()
