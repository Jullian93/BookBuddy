"""
Models for user data
"""

from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr = Field(..., description="User email")
    firstName: str = Field(..., description="User first name")
    lastName: str = Field(..., description="User last name")
    role: str = Field(..., description="User role (student or librarian)")

class UserCreate(UserBase):
    """Model for creating a new user"""
    password: str = Field(..., description="User password", min_length=6)
    studentId: Optional[str] = Field(None, description="Student ID (for students)")
    department: Optional[str] = Field(None, description="Department (for students)")

class UserUpdate(BaseModel):
    """Model for updating a user"""
    email: Optional[EmailStr] = Field(None, description="User email")
    firstName: Optional[str] = Field(None, description="User first name")
    lastName: Optional[str] = Field(None, description="User last name")
    password: Optional[str] = Field(None, description="User password", min_length=6)
    role: Optional[str] = Field(None, description="User role (student or librarian)")
    studentId: Optional[str] = Field(None, description="Student ID (for students)")
    department: Optional[str] = Field(None, description="Department (for students)")
    avatar: Optional[str] = Field(None, description="Avatar URL")

class User(UserBase):
    """Model for returning a user"""
    id: str = Field(..., description="User ID")
    studentId: Optional[str] = Field(None, description="Student ID (for students)")
    department: Optional[str] = Field(None, description="Department (for students)")
    avatar: Optional[str] = Field(None, description="Avatar URL")
    joinDate: datetime = Field(..., description="Date the user joined")
    
    class Config:
        """Config for the model"""
        from_attributes = True

class UserInDB(User):
    """Model for a user in the database"""
    hashed_password: str = Field(..., description="Hashed password")

class Token(BaseModel):
    """Access token model"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field("bearer", description="Token type")

class TokenPayload(BaseModel):
    """Model for JWT token payload"""
    sub: str = Field(..., description="Subject (user ID)")
    role: str = Field(..., description="User role")
    exp: int = Field(..., description="Expiration time")

class UserReadingHistory(BaseModel):
    """Model for a user's reading history"""
    user: User = Field(..., description="User details")
    reading_history: List = Field(..., description="Books the user has read")