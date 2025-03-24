#!/usr/bin/env python
"""
Script to generate and store embeddings for books in the database.
This script reads book data, generates embeddings using OpenAI's API,
and stores them in the MongoDB database.
"""

import os
import sys
import json
import logging
from pathlib import Path
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient
from openai import OpenAI

# Add the parent directory to sys.path to allow importing from the app
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import settings
from app.db.mongodb import get_database

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def create_book_embedding(client, book_data):
    """
    Generate embedding for a book's description using OpenAI's API.
    
    Args:
        client: OpenAI client instance
        book_data: Dict containing book information
    
    Returns:
        Tuple containing the book data and its embedding
    """
    # Create a rich text to generate embeddings for
    text_for_embedding = f"""
    Title: {book_data['title']}
    Author: {book_data['author']}
    Genre: {book_data['genre']}
    Description: {book_data['description']}
    Publication Year: {book_data['publicationYear']}
    """
    
    try:
        response = client.embeddings.create(
            input=text_for_embedding.strip(),
            model="text-embedding-3-small"  # Using the latest embedding model
        )
        embedding = response.data[0].embedding
        return book_data, embedding
    except Exception as e:
        logger.error(f"Error generating embedding for book {book_data['title']}: {e}")
        return book_data, None

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
    
    # Initialize MongoDB connection
    try:
        db = get_database()
        books_collection = db["books"]
        embeddings_collection = db["book_embeddings"]
        logger.info("MongoDB connection established")
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        sys.exit(1)
    
    # Get all books from the database
    books = list(books_collection.find({}))
    logger.info(f"Found {len(books)} books in the database")
    
    if not books:
        # If no books in DB, try to load from a JSON file
        try:
            books_path = Path(__file__).resolve().parent / "data" / "books.json"
            with open(books_path, "r") as f:
                books = json.load(f)
            logger.info(f"Loaded {len(books)} books from JSON file")
        except FileNotFoundError:
            logger.error("No books found in database or books.json")
            sys.exit(1)
    
    # Generate embeddings for each book
    for book in books:
        # Skip if embedding already exists
        if embeddings_collection.find_one({"book_id": book["id"]}):
            logger.info(f"Embedding already exists for book {book['title']}")
            continue
        
        logger.info(f"Generating embedding for book: {book['title']}")
        book_data, embedding = create_book_embedding(client, book)
        
        if embedding:
            # Store the embedding in the database
            embedding_doc = {
                "book_id": book["id"],
                "embedding": embedding,
                "title": book["title"],
                "created_at": pd.Timestamp.now()
            }
            embeddings_collection.insert_one(embedding_doc)
            logger.info(f"Stored embedding for book: {book['title']}")
        else:
            logger.warning(f"Failed to generate embedding for book: {book['title']}")
    
    logger.info("Embedding generation complete")

if __name__ == "__main__":
    main()