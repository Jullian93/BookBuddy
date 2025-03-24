"""
Service for generating book recommendations
"""

import logging
import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
import uuid
from openai import OpenAI

from app.core.config import settings
from app.db.vector_store import VectorStore
from app.services.embedding_service import EmbeddingService
from app.db.models import Book, User, BorrowedBook, BookEmbedding

# Configure logging
logger = logging.getLogger(__name__)

class RecommendationService:
    """Service for generating personalized book recommendations"""
    
    def __init__(self):
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.embedding_service = EmbeddingService()
        self.vector_store = VectorStore()
    
    def get_reading_history(self, db: Session, user_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Get a user's reading history.
        
        Args:
            db: Database session
            user_id: The user ID
            limit: Maximum number of books to return
            
        Returns:
            List of books the user has borrowed, sorted by most recent first
        """
        try:
            user_uuid = uuid.UUID(user_id)
            
            # Get the most recent borrowed books
            borrowed_records = (
                db.query(BorrowedBook)
                .filter(BorrowedBook.user_id == user_uuid)
                .order_by(BorrowedBook.borrow_date.desc())
                .limit(limit)
                .all()
            )
            
            # Get the complete book details for each borrowed book
            result = []
            for borrow in borrowed_records:
                book = db.query(Book).filter(Book.id == borrow.book_id).first()
                if book:
                    # Add borrow information to book
                    book_with_borrow = {
                        "id": str(book.id),
                        "title": book.title,
                        "author": book.author,
                        "isbn": book.isbn,
                        "genre": book.genre,
                        "publicationYear": book.publication_year,
                        "publisher": book.publisher,
                        "description": book.description,
                        "copies": book.copies,
                        "copiesAvailable": book.copies_available,
                        "coverImage": book.cover_image,
                        "borrowDate": borrow.borrow_date,
                        "returnDate": borrow.return_date,
                        "status": borrow.status
                    }
                    result.append(book_with_borrow)
            
            return result
        except ValueError:
            logger.error(f"Invalid UUID format for user_id: {user_id}")
            return []
    
    async def generate_recommendations(
        self, 
        db: Session,
        user_id: str, 
        num_recommendations: int = settings.NUM_RECOMMENDATIONS
    ) -> Dict[str, Any]:
        """
        Generate book recommendations for a user based on their reading history.
        
        Args:
            db: Database session
            user_id: The user ID
            num_recommendations: Number of recommendations to generate
            
        Returns:
            Dictionary containing recommendations and explanation
        """
        # Get the user's reading history
        reading_history = self.get_reading_history(db, user_id, limit=5)
        
        if not reading_history:
            logger.warning(f"No reading history found for user {user_id}")
            return {
                "recommendations": [],
                "explanation": "Unable to generate recommendations as the student has no reading history."
            }
        
        # Get the most recent two books
        recent_books = reading_history[:2] if len(reading_history) >= 2 else reading_history
        
        # Get embeddings for the recent books
        book_embeddings = []
        for book in recent_books:
            # First try to get existing embedding
            embedding = self.vector_store.get_book_embedding(db, book["id"])
            
            # If not found, generate a new one
            if not embedding:
                embedding = await self.embedding_service.create_embedding_for_book(book)
                # Save the embedding for future use
                if embedding:
                    self.vector_store.save_embedding(db, book["id"], embedding)
            
            if embedding:
                book_embeddings.append(embedding)
        
        # If we couldn't get any embeddings, return empty recommendations
        if not book_embeddings:
            logger.warning(f"Could not generate embeddings for books read by user {user_id}")
            return {
                "recommendations": [],
                "explanation": "Unable to generate recommendations due to a technical issue."
            }
        
        # Combine embeddings from recent books to create a preference vector
        preference_embedding = self.vector_store.combine_embeddings(book_embeddings)
        
        # Get similar books based on the preference embedding
        exclude_ids = [book["id"] for book in reading_history]  # Exclude books the user has already read
        similar_books = await self.vector_store.find_similar_books(
            db,
            preference_embedding, 
            n=settings.NUM_SIMILAR_BOOKS,
            exclude_book_ids=exclude_ids
        )
        
        # If no similar books found, return empty recommendations
        if not similar_books:
            logger.warning(f"No similar books found for user {user_id}")
            return {
                "recommendations": [],
                "explanation": "No suitable recommendations found based on the student's reading history."
            }
        
        # Use GPT to refine the recommendations and provide an explanation
        return await self.refine_recommendations_with_gpt(recent_books, similar_books, num_recommendations)
    
    async def refine_recommendations_with_gpt(
        self, 
        recent_books: List[Dict[str, Any]], 
        similar_books: List[Dict[str, Any]], 
        num_recommendations: int
    ) -> Dict[str, Any]:
        """
        Use GPT to refine book recommendations and provide an explanation.
        
        Args:
            recent_books: Books recently read by the user
            similar_books: Similar books found by embedding search
            num_recommendations: Number of recommendations to return
            
        Returns:
            Dictionary with refined recommendations and explanation
        """
        try:
            # Prepare the data for GPT
            recent_books_json = json.dumps([{
                "id": book["id"],
                "title": book["title"],
                "author": book["author"],
                "genre": book["genre"],
                "description": book["description"]
            } for book in recent_books], indent=2)
            
            similar_books_json = json.dumps([{
                "id": book["id"],
                "title": book["title"],
                "author": book["author"],
                "genre": book["genre"],
                "description": book["description"],
                "similarity_score": book.get("similarity_score", 0)
            } for book in similar_books], indent=2)
            
            # Create the prompt for GPT
            prompt = f"""
            You are a skilled librarian helping a student find their next book to read.
            
            The student has recently read these books:
            {recent_books_json}
            
            Based on similarity search, these books might be of interest:
            {similar_books_json}
            
            Your task:
            1. Select exactly {num_recommendations} books from the similar books list that would be most appealing to someone who enjoyed the recently read books.
            2. Consider diversity of authors, themes within the genre, and reading level.
            3. Write a personalized explanation of why you selected these books, mentioning connections to what the student previously read.
            
            Respond with a JSON object in this format:
            {{
                "recommendations": [
                    {{
                        "id": "book_id",
                        "title": "Book Title",
                        "author": "Author Name",
                        "reason": "A personalized reason why this specific book is recommended"
                    }},
                    ...
                ],
                "explanation": "An overall explanation of your recommendation strategy"
            }}
            
            Only include the JSON in your response, nothing else.
            """
            
            # Call GPT to get recommendations
            response = self.openai_client.chat.completions.create(
                model=settings.CHAT_MODEL,
                messages=[
                    {"role": "system", "content": "You are a helpful librarian assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            # Parse the response
            result = json.loads(response.choices[0].message.content)
            
            # Add full book details to recommendations
            enhanced_recommendations = []
            for rec in result.get("recommendations", []):
                # Find the full book details
                book_id = rec.get("id")
                book_details = next((book for book in similar_books if str(book["id"]) == str(book_id)), None)
                
                if book_details:
                    # Combine the recommendation reason with full book details
                    enhanced_rec = {
                        **book_details,
                        "recommendation_reason": rec.get("reason", "")
                    }
                    enhanced_recommendations.append(enhanced_rec)
            
            return {
                "recommendations": enhanced_recommendations,
                "explanation": result.get("explanation", "")
            }
            
        except Exception as e:
            logger.error(f"Error refining recommendations with GPT: {e}")
            # Return a subset of the similar books as a fallback
            return {
                "recommendations": similar_books[:num_recommendations],
                "explanation": "Recommendations based on books with similar themes and styles to your recent reads."
            }