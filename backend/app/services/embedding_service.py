"""
Service for creating and managing text embeddings
"""

import logging
from typing import List, Dict, Any, Optional
from openai import OpenAI

from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

class EmbeddingService:
    """Service for generating and managing text embeddings"""
    
    def __init__(self):
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.EMBEDDING_MODEL
    
    async def create_embedding(self, text: str) -> Optional[List[float]]:
        """
        Create an embedding for the given text.
        
        Args:
            text: The text to embed
            
        Returns:
            The embedding vector or None if an error occurs
        """
        try:
            response = self.openai_client.embeddings.create(
                input=text,
                model=self.model
            )
            
            # Extract the embedding from the response
            embedding = response.data[0].embedding
            return embedding
        except Exception as e:
            logger.error(f"Error creating embedding: {e}")
            return None
    
    async def create_embedding_for_book(self, book: Dict[str, Any]) -> Optional[List[float]]:
        """
        Create an embedding for a book.
        
        Args:
            book: Book data dictionary
            
        Returns:
            The embedding vector or None if an error occurs
        """
        # Create a rich text representation of the book
        book_text = f"""
        Title: {book.get('title', '')}
        Author: {book.get('author', '')}
        Genre: {book.get('genre', '')}
        Publication Year: {book.get('publicationYear', '')}
        Description: {book.get('description', '')}
        """
        
        return await self.create_embedding(book_text.strip())
    
    async def create_embedding_for_user_preferences(
        self, 
        reading_history: List[Dict[str, Any]]
    ) -> Optional[List[float]]:
        """
        Create an embedding representing a user's reading preferences.
        
        Args:
            reading_history: List of books the user has read
            
        Returns:
            The embedding vector or None if an error occurs
        """
        if not reading_history:
            return None
        
        # Create a text representation of the user's reading preferences
        preferences_text = "This user enjoys reading books such as:\n\n"
        
        for book in reading_history:
            preferences_text += f"""
            - "{book.get('title', '')}" by {book.get('author', '')}, a {book.get('genre', '')} book.
            """
        
        return await self.create_embedding(preferences_text.strip())