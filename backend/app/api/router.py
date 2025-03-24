"""
Main API router
"""

from fastapi import APIRouter

from app.api.endpoints import auth, books, users, recommendations

# Create main API router
api_router = APIRouter()

# Include routes from endpoint modules
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(books.router, prefix="/books", tags=["books"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])