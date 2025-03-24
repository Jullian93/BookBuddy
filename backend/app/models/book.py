"""
Models for book data
"""

from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class BookBase(BaseModel):
    """Base book model"""
    title: str = Field(..., description="Book title")
    author: str = Field(..., description="Book author")
    isbn: Optional[str] = Field(None, description="ISBN number")
    genre: str = Field(..., description="Book genre")
    publicationYear: int = Field(..., description="Year of publication")
    publisher: Optional[str] = Field(None, description="Book publisher")
    description: str = Field(..., description="Book description")

class BookCreate(BookBase):
    """Model for creating a new book"""
    copies: int = Field(1, description="Number of copies")

class BookUpdate(BaseModel):
    """Model for updating a book"""
    title: Optional[str] = Field(None, description="Book title")
    author: Optional[str] = Field(None, description="Book author")
    isbn: Optional[str] = Field(None, description="ISBN number")
    genre: Optional[str] = Field(None, description="Book genre")
    publicationYear: Optional[int] = Field(None, description="Year of publication")
    publisher: Optional[str] = Field(None, description="Book publisher")
    description: Optional[str] = Field(None, description="Book description")
    copies: Optional[int] = Field(None, description="Number of copies")
    coverImage: Optional[str] = Field(None, description="Cover image URL")

class Book(BookBase):
    """Model for returning a book"""
    id: str = Field(..., description="Book ID")
    copies: int = Field(..., description="Total number of copies")
    copiesAvailable: int = Field(..., description="Number of available copies")
    coverImage: Optional[str] = Field(None, description="Cover image URL")
    available: bool = Field(..., description="Whether the book is available")
    
    class Config:
        """Config for the model"""
        from_attributes = True

class BookWithRecommendationReason(Book):
    """Model for a book with a recommendation reason"""
    similarity_score: Optional[float] = Field(None, description="Similarity score")
    recommendation_reason: Optional[str] = Field(None, description="Reason for recommendation")

class BorrowedBookBase(BaseModel):
    """Base model for a borrowed book"""
    book_id: str = Field(..., description="Book ID")
    user_id: str = Field(..., description="User ID")

class BorrowedBookCreate(BorrowedBookBase):
    """Model for creating a borrowed book record"""
    pass

class BorrowedBook(BorrowedBookBase):
    """Model for returning a borrowed book"""
    id: str = Field(..., description="Borrow record ID")
    borrow_date: datetime = Field(..., description="Date the book was borrowed")
    due_date: datetime = Field(..., description="Date the book is due")
    return_date: Optional[datetime] = Field(None, description="Date the book was returned")
    status: str = Field(..., description="Status of the borrowed book (borrowed, returned, overdue)")
    
    class Config:
        """Config for the model"""
        from_attributes = True

class BorrowedBookWithDetails(BorrowedBook):
    """Borrowed book with book details"""
    book: Book = Field(..., description="Book details")
    
    class Config:
        """Config for the model"""
        from_attributes = True

class Recommendation(BaseModel):
    """Book recommendation"""
    recommendations: List[BookWithRecommendationReason] = Field(..., description="Recommended books")
    explanation: str = Field(..., description="Explanation for the recommendations")