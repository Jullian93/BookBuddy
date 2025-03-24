#!/usr/bin/env python
"""
Script to generate and store embeddings for books in the database.
This script reads book data, generates embeddings using OpenAI's API,
and stores them in the PostgreSQL database.
"""

import os
import sys
import logging
from pathlib import Path
import numpy as np
from dotenv import load_dotenv
from openai import OpenAI

# Add the parent directory to sys.path to allow importing from the app
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import settings
from app.db.database import SessionLocal
from app.db.models import Book, BookEmbedding

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def create_book_embedding(client, book):
    """
    Generate embedding for a book's description using OpenAI's API.
    
    Args:
        client: OpenAI client instance
        book: Book object
    
    Returns:
        Tuple containing the book and its embedding
    """
    # Create a rich text to generate embeddings for
    text_for_embedding = f"""
    Title: {book.title}
    Author: {book.author}
    Genre: {book.genre}
    Description: {book.description}
    Publication Year: {book.publication_year}
    """
    
    try:
        response = client.embeddings.create(
            input=text_for_embedding.strip(),
            model="text-embedding-3-small"  # Using the latest embedding model
        )
        embedding = response.data[0].embedding
        return book, embedding
    except Exception as e:
        logger.error(f"Error generating embedding for book {book.title}: {e}")
        return book, None

def main():
    """
    Main function to generate and store embeddings for all books.
    """
    # Initialize OpenAI client
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        logger.error("OpenAI API key not found. Please set OPENAI_API_KEY in your environment.")
        sys.exit(1)
    
    client = OpenAI(api_key=openai_api_key)
    logger.info("OpenAI client initialized")
    
    # Initialize database session
    db = SessionLocal()
    
    try:
        # Get all books from the database
        books = db.query(Book).all()
        logger.info(f"Found {len(books)} books in the database")
        
        if not books:
            logger.error("No books found in database")
            sys.exit(1)
        
        # Generate embeddings for each book
        for book in books:
            # Skip if embedding already exists
            existing_embedding = db.query(BookEmbedding).filter(BookEmbedding.book_id == book.id).first()
            if existing_embedding:
                logger.info(f"Embedding already exists for book {book.title}")
                continue
            
            logger.info(f"Generating embedding for book: {book.title}")
            book_obj, embedding = create_book_embedding(client, book)
            
            if embedding:
                # Store the embedding in the database
                new_embedding = BookEmbedding(
                    book_id=book.id,
                    embedding=embedding
                )
                db.add(new_embedding)
                db.commit()
                logger.info(f"Stored embedding for book: {book.title}")
            else:
                logger.warning(f"Failed to generate embedding for book: {book.title}")
        
        logger.info("Embedding generation complete")
    finally:
        db.close()

if __name__ == "__main__":
    main()