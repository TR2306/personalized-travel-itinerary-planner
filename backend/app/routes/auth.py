import uuid
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings
from app.database import DBManager, supabase_client
from app.schemas.user import UserRegister, UserLogin, UserResponse, UserUpdate, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> UserResponse:
    if not credentials:
        # Default anonymous test user for zero-friction exploration
        user = DBManager.get_user_by_email("wanderer@roamai.com")
        if not user:
            user = DBManager.create_user({
                "id": "demo-traveler-001",
                "name": "Alex Mercer",
                "email": "wanderer@roamai.com",
                "travel_preferences": {
                    "preferred_currency": "USD",
                    "default_pace": "Balanced",
                    "top_interests": ["Culture", "Food", "Sightseeing"]
                }
            })
        return UserResponse(**user)
    
    token = credentials.credentials
    # 1. Try Supabase token verification if Supabase is active
    if supabase_client:
        try:
            user_resp = supabase_client.auth.get_user(token)
            if user_resp and user_resp.user:
                sb_user = user_resp.user
                db_u = DBManager.get_user_by_id(sb_user.id)
                if not db_u:
                    db_u = DBManager.create_user({
                        "id": sb_user.id,
                        "name": sb_user.user_metadata.get("name", "Traveler"),
                        "email": sb_user.email,
                        "travel_preferences": {}
                    })
                return UserResponse(**db_u)
        except Exception:
            pass

    # 2. Try JWT fallback verification
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user = DBManager.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return UserResponse(**user)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

@router.post("/register", response_model=TokenResponse)
async def register(user_in: UserRegister):
    existing = DBManager.get_user_by_email(user_in.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An account with this email already exists")

    user_id = str(uuid.uuid4())
    password_hash = pwd_context.hash(user_in.password)

    # Supabase registration attempt if configured
    if supabase_client:
        try:
            res = supabase_client.auth.sign_up({
                "email": user_in.email,
                "password": user_in.password,
                "options": {"data": {"name": user_in.name}}
            })
            if res.user:
                user_id = res.user.id
        except Exception as e:
            print(f"Supabase auth sign_up notice: {e}")

    new_user = DBManager.create_user({
        "id": user_id,
        "name": user_in.name,
        "email": user_in.email,
        "password_hash": password_hash,
        "travel_preferences": {
            "preferred_currency": "USD",
            "default_pace": "Balanced"
        }
    })

    token = create_access_token({"sub": user_id, "email": user_in.email})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**new_user)
    )

@router.post("/login", response_model=TokenResponse)
async def login(user_in: UserLogin):
    user = DBManager.get_user_by_email(user_in.email)
    
    # Supabase Auth sign-in if configured
    if supabase_client:
        try:
            res = supabase_client.auth.sign_in_with_password({
                "email": user_in.email,
                "password": user_in.password
            })
            if res.user and res.session:
                if not user:
                    user = DBManager.create_user({
                        "id": res.user.id,
                        "name": res.user.user_metadata.get("name", "Traveler"),
                        "email": res.user.email,
                        "travel_preferences": {}
                    })
                return TokenResponse(
                    access_token=res.session.access_token,
                    token_type="bearer",
                    user=UserResponse(**user)
                )
        except Exception as e:
            print(f"Supabase auth sign_in notice: {e}")

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if user.get("password_hash") and not pwd_context.verify(user_in.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token({"sub": user["id"], "email": user["email"]})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**user)
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_profile(updates: UserUpdate, current_user: UserResponse = Depends(get_current_user)):
    up_dict = updates.model_dump(exclude_unset=True)
    updated = DBManager.update_user(current_user.id, up_dict)
    if not updated:
        raise HTTPException(status_code=400, detail="Update failed")
    return UserResponse(**updated)
