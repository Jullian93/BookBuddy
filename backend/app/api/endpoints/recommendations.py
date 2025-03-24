"""
API endpoints for book recommendations
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from starlette.status import HTTP_404_NOT_FOUND

from app.models.book import Recommendation, BookWithRecommendationReason
from app.models.user import User
from app.services.recommendation_service import RecommendationService
from app.core.security import get_current_active_user, get_current_librarian

router = APIRouter()

@router.get(
    "/users/{user_id}/reading-history",
    response_model=List[Dict[str, Any]],
    summary="Get a user's reading history",
    description="Retrieve the reading history for a specific user"
)
async def get_reading_history(
    user_id: str = Path(..., description="The ID of the user"),
    current_user: User = Depends(get_current_active_user),
    recommendation_service: RecommendationService = Depends()
):
    """Get a user's reading history"""
    # Check permissions - users can only see their own history, librarians can see any history
    if current_user.id != user_id and current_user.role != "librarian":
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view this user's reading history"
        )
    
    reading_history = await recommendation_service.get_reading_history(user_id)
    
    if not reading_history:
        return []
    
    return reading_history

@router.get(
    "/users/{user_id}/recommendations",
    response_model=Recommendation,
    summary="Get book recommendations for a user",
    description="Generate personalized book recommendations for a specific user"
)
async def get_recommendations(
    user_id: str = Path(..., description="The ID of the user"),
    num_recommendations: int = Query(3, description="Number of recommendations to generate", ge=1, le=10),
    current_user: User = Depends(get_current_librarian),  # Only librarians can access this endpoint
    recommendation_service: RecommendationService = Depends()
):
    """Get book recommendations for a user"""
    # Get recommendations
    recommendations = await recommendation_service.generate_recommendations(
        user_id, 
        num_recommendations=num_recommendations
    )
    
    return recommendations

@router.get(
    "/books/{book_id}/similar",
    response_model=List[BookWithRecommendationReason],
    summary="Get similar books",
    description="Find books similar to a specific book"
)
async def get_similar_books(
    book_id: str = Path(..., description="The ID of the book"),
    limit: int = Query(5, description="Number of similar books to return", ge=1, le=20),
    current_user: User = Depends(get_current_active_user),
    recommendation_service: RecommendationService = Depends()
):
    """Get books similar to a specific book"""
    from app.db.mongodb import get_async_database
    from app.db.vector_store import VectorStore
    
    # Get the book
    db = await get_async_database()
    book = await db.books.find_one({"id": book_id})
    
    if not book:
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND,
            detail=f"Book with ID {book_id} not found"
        )
    
    # Get the book's embedding
    vector_store = VectorStore()
    embedding = await vector_store.get_book_embedding(book_id)
    
    if not embedding:
        # Generate embedding if not found
        embedding_service = recommendation_service.embedding_service
        embedding = await embedding_service.create_embedding_for_book(book)
        
        if embedding:
            # Save for future use
            await vector_store.save_embedding(book_id, embedding)
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate embedding for the book"
            )
    
    # Find similar books
    similar_books = await vector_store.find_similar_books(
        embedding,
        n=limit,
        exclude_book_ids=[book_id]  # Exclude the source book
    )
    
    # Convert to BookWithRecommendationReason model
    result = []
    for book in similar_books:
        book_with_reason = BookWithRecommendationReason(
            **book,
            recommendation_reason=f"Similar to {book['title']}"
        )
        result.append(book_with_reason)
    
    return result