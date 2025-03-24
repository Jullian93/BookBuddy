#!/usr/bin/env python
"""
Script to seed the database with initial data (books, users, borrowed books).
"""

import os
import sys
import json
import logging
from pathlib import Path
from datetime import datetime, timedelta
from bson import ObjectId
from pymongo import MongoClient
from passlib.context import CryptContext
from dotenv import load_dotenv

# Add the parent directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

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

# Setup password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password):
    """Hash a password for storing."""
    return pwd_context.hash(password)

def load_json_data(file_path):
    """Load data from a JSON file."""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error(f"File not found: {file_path}")
        return []
    except json.JSONDecodeError:
        logger.error(f"Invalid JSON in file: {file_path}")
        return []

def seed_books(db):
    """Seed the database with books."""
    books_collection = db["books"]
    
    # Check if books already exist
    if books_collection.count_documents({}) > 0:
        logger.info("Books already exist in the database, skipping seeding")
        return
    
    # Load books data from file
    data_path = Path(__file__).resolve().parent / "data" / "books.json"
    books = load_json_data(data_path)
    
    if not books:
        logger.warning("No books data to seed")
        return
    
    # Add more detailed descriptions to books for better embeddings
    enhanced_books = []
    for book in books:
        # Convert numeric string ID to ObjectId for MongoDB
        book["_id"] = ObjectId()
        
        # Ensure book has a detailed description
        if not book.get("description") or len(book.get("description", "")) < 100:
            book["description"] = generate_detailed_description(book)
        
        enhanced_books.append(book)
    
    # Insert books into database
    books_collection.insert_many(enhanced_books)
    logger.info(f"Seeded {len(enhanced_books)} books")

def seed_users(db):
    """Seed the database with users."""
    users_collection = db["users"]
    
    # Check if users already exist
    if users_collection.count_documents({}) > 0:
        logger.info("Users already exist in the database, skipping seeding")
        return
    
    # Load users data from file
    data_path = Path(__file__).resolve().parent / "data" / "users.json"
    users = load_json_data(data_path)
    
    if not users:
        logger.warning("No users data to seed")
        return
    
    # Hash passwords and prepare for DB
    prepared_users = []
    for user in users:
        user["_id"] = ObjectId()
        user["hashed_password"] = hash_password(user.pop("password"))
        user["created_at"] = datetime.now()
        prepared_users.append(user)
    
    # Insert users into database
    users_collection.insert_many(prepared_users)
    logger.info(f"Seeded {len(prepared_users)} users")

def seed_borrowed_books(db):
    """Seed the database with borrowed books."""
    borrowed_collection = db["borrowed_books"]
    
    # Check if borrowed books already exist
    if borrowed_collection.count_documents({}) > 0:
        logger.info("Borrowed books already exist in the database, skipping seeding")
        return
    
    # Load borrowed books data from file
    data_path = Path(__file__).resolve().parent / "data" / "borrowed_books.json"
    borrowed_books = load_json_data(data_path)
    
    if not borrowed_books:
        logger.warning("No borrowed books data to seed")
        return
    
    # Convert date strings to datetime objects
    prepared_borrowed = []
    for item in borrowed_books:
        item["_id"] = ObjectId()
        item["borrow_date"] = datetime.fromisoformat(item["borrow_date"]) if "borrow_date" in item else datetime.now()
        item["due_date"] = datetime.fromisoformat(item["due_date"]) if "due_date" in item else datetime.now() + timedelta(days=14)
        
        if "return_date" in item and item["return_date"]:
            item["return_date"] = datetime.fromisoformat(item["return_date"])
        
        prepared_borrowed.append(item)
    
    # Insert borrowed books into database
    borrowed_collection.insert_many(prepared_borrowed)
    logger.info(f"Seeded {len(prepared_borrowed)} borrowed books")

def generate_detailed_description(book):
    """Generate a more detailed description for a book if the existing one is too short."""
    title = book.get("title", "")
    author = book.get("author", "")
    genre = book.get("genre", "")
    year = book.get("publicationYear", "")
    
    # Default detailed descriptions for some known books
    descriptions = {
        "To Kill a Mockingbird": "Set in the racially charged Southern United States during the Great Depression, 'To Kill a Mockingbird' follows young Scout Finch and her brother Jem as their father, lawyer Atticus Finch, defends a Black man falsely accused of raping a white woman. Through Scout's innocent perspective, the novel explores themes of racial injustice, moral growth, compassion, and the loss of innocence. Harper Lee crafts a powerful narrative about standing up for what's right, even when faced with overwhelming opposition from society.",
        
        "1984": "Winston Smith lives in a dystopian super-state called Oceania, dominated by the Party and its leader Big Brother. The Party maintains absolute control through constant surveillance, manipulation of history, and the eradication of independent thought—'thoughtcrime.' When Winston begins a forbidden love affair with Julia and connects with what he believes is a resistance movement, he dreams of rebellion. George Orwell's nightmarish vision explores totalitarianism, mass surveillance, and the degradation of language as a tool for limiting freedom of thought.",
        
        "Pride and Prejudice": "In the Regency era English countryside, Elizabeth Bennet and her four sisters find their lives upended when wealthy bachelor Mr. Bingley and his friend, the aloof Mr. Darcy, arrive in their neighborhood. Elizabeth's initial dislike of the proud Mr. Darcy gradually transforms as she discovers his true character. Jane Austen's beloved novel delves into themes of marriage, social status, wealth, and reputation while showcasing her sharp wit and social commentary through memorable characters navigating the rigid social hierarchy of early 19th century England.",
        
        "The Great Gatsby": "Set in the Roaring Twenties on Long Island, the novel follows mysterious millionaire Jay Gatsby and his obsession with beautiful former debutante Daisy Buchanan. Narrated by Gatsby's neighbor Nick Carraway, the story unfolds as Gatsby tries to rekindle his romance with Daisy, now married to the brutish Tom Buchanan. F. Scott Fitzgerald's masterpiece is a critique of the American Dream, examining themes of decadence, idealism, social upheaval, and excess against the backdrop of the Jazz Age, ultimately revealing the hollow nature of materialism and the corruption of dreams."
    }
    
    if title in descriptions:
        return descriptions[title]
    
    # Generate a generic detailed description based on available information
    return f"""
    {title} is a notable {genre.lower()} book written by {author} and published in {year}. 
    The book explores themes common to {genre.lower()} literature while presenting a unique 
    narrative that has resonated with readers since its publication. The author's distinctive 
    style and approach to storytelling are evident throughout the work, making it a significant 
    contribution to literature. The characters are well-developed and the plot engages readers 
    from beginning to end, offering insights into human nature and society.
    """.strip()

def main():
    """Main function to seed the database."""
    try:
        # Initialize MongoDB connection
        db = get_database()
        logger.info("MongoDB connection established")
        
        # Seed the database
        seed_users(db)
        seed_books(db)
        seed_borrowed_books(db)
        
        logger.info("Database seeding complete")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()