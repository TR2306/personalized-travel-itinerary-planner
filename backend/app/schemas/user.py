from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: str
    name: str

class UserRegister(BaseModel):
    email: str
    password: str = Field(..., min_length=6)
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    travel_preferences: Optional[Dict[str, Any]] = None

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    travel_preferences: Optional[Dict[str, Any]] = {}
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
