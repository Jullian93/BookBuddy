"""
Vector storage and similarity search for book recommendations
"""

import logging
import numpy as np
from typing import List, Dict, Any, Optional
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
import uuid

from app.db.models import Book, BookEmbedding
from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

class VectorStore:
    """
    A class for storing and searching embeddings.
    Uses PostgreSQL to store the embeddings and provides methods for similarity search.
    """
    
    @staticmethod
    async def find_similar_books(
        db: Session,
        query_embedding: List[float], 
        n: int = settings.NUM_SIMILAR_BOOKS,
        exclude_book_ids: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Find similar books based on embedding similarity.
        
        Args:
            db: Database session
            query_embedding: The embedding vector to compare against
            n: Number of similar books to return
            exclude_book_ids: List of book IDs to exclude from results
        
        Returns:
            List of book objects with similarity scores
        """
        # Get all book embeddings
        book_embeddings = db.query(BookEmbedding).all()
        
        if not book_embeddings:
            logger.warning("No embeddings found in the database")
            return []
        
        # Filter out excluded books if provided
        if exclude_book_ids:
            # Convert string IDs to UUID objects
            exclude_uuids = [uuid.UUID(id) for id in exclude_book_ids]
            book_embeddings = [e for e in book_embeddings if e.book_id not in exclude_uuids]
        
        # Extract embedding vectors
        embedding_vectors = np.array([e.embedding for e in book_embeddings])
        
        # Compute cosine similarity
        query_embedding_np = np.array(query_embedding).reshape(1, -1)
        similarities = cosine_similarity(query_embedding_np, embedding_vectors).flatten()
        
        # Sort by similarity score
        book_similarities = [(e, float(sim)) for e, sim in zip(book_embeddings, similarities)]
        book_similarities.sort(key=lambda x: x[1], reverse=True)
        
        # Get top n similar books
        top_similar = book_similarities[:n]
        
        # Get full book details for each similar book
        result = []
        for embedding_doc, similarity in top_similar:
            book = db.query(Book).filter(Book.id == embedding_doc.book_id).first()
            
            if book:
                # Add similarity score to book object
                book_dict = {
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
                    "similarity_score": similarity
                }
                result.append(book_dict)
        
        return result
    
    @staticmethod
    def get_book_embedding(db: Session, book_id: str) -> Optional[List[float]]:
        """
        Get the embedding for a specific book.
        
        Args:
            db: Database session
            book_id: The ID of the book
            
        Returns:
            The embedding vector or None if not found
        """
        try:
            book_uuid = uuid.UUID(book_id)
            embedding_doc = db.query(BookEmbedding).filter(BookEmbedding.book_id == book_uuid).first()
            
            if embedding_doc and embedding_doc.embedding:
                return embedding_doc.embedding
            
            return None
        except ValueError:
            logger.error(f"Invalid UUID format for book_id: {book_id}")
            return None
    
    @staticmethod
    def save_embedding(db: Session, book_id: str, embedding: List[float]) -> bool:
        """
        Save or update an embedding for a book.
        
        Args:
            db: Database session
            book_id: The ID of the book
            embedding: The embedding vector
            
        Returns:
            True if successful, False otherwise
        """
        try:
            book_uuid = uuid.UUID(book_id)
            
            # Check if embedding already exists
            existing_embedding = db.query(BookEmbedding).filter(BookEmbedding.book_id == book_uuid).first()
            
            if existing_embedding:
                # Update existing embedding
                existing_embedding.embedding = embedding
                existing_embedding.updated_at = db.func.now()
            else:
                # Create new embedding
                new_embedding = BookEmbedding(
                    book_id=book_uuid,
                    embedding=embedding
                )
                db.add(new_embedding)
            
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"Error saving embedding for book {book_id}: {e}")
            return False
    
    @staticmethod
    def combine_embeddings(embeddings: List[List[float]]) -> List[float]:
        """
        Combine multiple embeddings by averaging them.
        
        Args:
            embeddings: List of embedding vectors to combine
            
        Returns:
            Combined embedding vector
        """
        if not embeddings:
            raise ValueError("No embeddings provided to combine")
        
        # Convert to numpy array and compute mean
        embeddings_np = np.array(embeddings)
        combined = np.mean(embeddings_np, axis=0).tolist()
        
        return combined