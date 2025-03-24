"""
Vector storage and similarity search for book recommendations
"""

import logging
import numpy as np
from typing import List, Dict, Any, Optional
from sklearn.metrics.pairwise import cosine_similarity

from app.db.mongodb import get_async_database
from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

class VectorStore:
    """
    A class for storing and searching embeddings.
    Uses MongoDB to store the embeddings and provides methods for similarity search.
    """
    
    @staticmethod
    async def find_similar_books(
        query_embedding: List[float], 
        n: int = settings.NUM_SIMILAR_BOOKS,
        exclude_book_ids: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Find similar books based on embedding similarity.
        
        Args:
            query_embedding: The embedding vector to compare against
            n: Number of similar books to return
            exclude_book_ids: List of book IDs to exclude from results
        
        Returns:
            List of book documents with similarity scores
        """
        db = await get_async_database()
        
        # Get all book embeddings
        embeddings = await db.book_embeddings.find().to_list(length=None)
        
        if not embeddings:
            logger.warning("No embeddings found in the database")
            return []
        
        # Filter out excluded books if provided
        if exclude_book_ids:
            embeddings = [e for e in embeddings if str(e["book_id"]) not in exclude_book_ids]
        
        # Extract embedding vectors and book IDs
        embedding_vectors = np.array([e["embedding"] for e in embeddings])
        
        # Compute cosine similarity
        query_embedding_np = np.array(query_embedding).reshape(1, -1)
        similarities = cosine_similarity(query_embedding_np, embedding_vectors).flatten()
        
        # Sort by similarity score
        book_similarities = [(e, float(sim)) for e, sim in zip(embeddings, similarities)]
        book_similarities.sort(key=lambda x: x[1], reverse=True)
        
        # Get top n similar books
        top_similar = book_similarities[:n]
        
        # Get full book details for each similar book
        result = []
        for embedding_doc, similarity in top_similar:
            book_id = embedding_doc["book_id"]
            book = await db.books.find_one({"id": book_id})
            
            if book:
                # Add similarity score to book document
                book_with_score = {**book, "similarity_score": similarity}
                result.append(book_with_score)
        
        return result
    
    @staticmethod
    async def get_book_embedding(book_id: str) -> Optional[List[float]]:
        """
        Get the embedding for a specific book.
        
        Args:
            book_id: The ID of the book
            
        Returns:
            The embedding vector or None if not found
        """
        db = await get_async_database()
        embedding_doc = await db.book_embeddings.find_one({"book_id": book_id})
        
        if embedding_doc and "embedding" in embedding_doc:
            return embedding_doc["embedding"]
        
        return None
    
    @staticmethod
    async def save_embedding(book_id: str, embedding: List[float]) -> bool:
        """
        Save or update an embedding for a book.
        
        Args:
            book_id: The ID of the book
            embedding: The embedding vector
            
        Returns:
            True if successful, False otherwise
        """
        db = await get_async_database()
        
        try:
            # Update if exists, insert if not
            await db.book_embeddings.update_one(
                {"book_id": book_id},
                {"$set": {"embedding": embedding}},
                upsert=True
            )
            return True
        except Exception as e:
            logger.error(f"Error saving embedding for book {book_id}: {e}")
            return False
    
    @staticmethod
    async def combine_embeddings(embeddings: List[List[float]]) -> List[float]:
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