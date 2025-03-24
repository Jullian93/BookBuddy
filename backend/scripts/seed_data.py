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
import uuid
from passlib.context import CryptContext
from dotenv import load_dotenv
from sqlalchemy.orm import Session

# Add the parent directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.database import SessionLocal, engine, Base
from app.db.models import Book, User, BorrowedBook
from app.core.config import settings

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

def seed_books(db: Session):
    """Seed the database with books."""
    # Check if books already exist
    if db.query(Book).count() > 0:
        logger.info("Books already exist in the database, skipping seeding")
        return
    
    # Load books data from file
    data_path = Path(__file__).resolve().parent / "data" / "books.json"
    books = load_json_data(data_path)
    
    if not books:
        logger.warning("No books data to seed")
        return
    
    # Add more detailed descriptions to books for better embeddings
    for book in books:
        # Ensure book has a detailed description
        if not book.get("description") or len(book.get("description", "")) < 100:
            book["description"] = generate_detailed_description(book)
        
        # Create Book object
        db_book = Book(
            id=uuid.uuid4(),
            title=book.get("title"),
            author=book.get("author"),
            isbn=book.get("isbn"),
            genre=book.get("genre"),
            publication_year=book.get("publicationYear"),
            publisher=book.get("publisher"),
            description=book.get("description"),
            copies=book.get("copies", 1),
            copies_available=book.get("copiesAvailable", book.get("copies", 1)),
            cover_image=book.get("coverImage")
        )
        db.add(db_book)
    
    db.commit()
    logger.info(f"Seeded {len(books)} books")

def seed_users(db: Session):
    """Seed the database with users."""
    # Check if users already exist
    if db.query(User).count() > 0:
        logger.info("Users already exist in the database, skipping seeding")
        return
    
    # Load users data from file
    data_path = Path(__file__).resolve().parent / "data" / "users.json"
    users = load_json_data(data_path)
    
    if not users:
        logger.warning("No users data to seed")
        return
    
    # Hash passwords and prepare for DB
    for user in users:
        # Create User object
        db_user = User(
            id=uuid.uuid4(),
            email=user.get("email"),
            first_name=user.get("firstName"),
            last_name=user.get("lastName"),
            hashed_password=hash_password(user.get("password")),
            role=user.get("role"),
            student_id=user.get("studentId"),
            department=user.get("department"),
            avatar=user.get("avatar"),
            join_date=user.get("joinDate", datetime.utcnow())
        )
        db.add(db_user)
    
    db.commit()
    logger.info(f"Seeded {len(users)} users")

def seed_borrowed_books(db: Session):
    """Seed the database with borrowed books."""
    # Check if borrowed books already exist
    if db.query(BorrowedBook).count() > 0:
        logger.info("Borrowed books already exist in the database, skipping seeding")
        return
    
    # Load borrowed books data from file
    data_path = Path(__file__).resolve().parent / "data" / "borrowed_books.json"
    borrowed_books = load_json_data(data_path)
    
    if not borrowed_books:
        logger.warning("No borrowed books data to seed")
        return
    
    # Get all books and users for reference
    books = {str(b.id): b for b in db.query(Book).all()}
    users = {str(u.id): u for u in db.query(User).all()}
    
    # Convert date strings to datetime objects
    for item in borrowed_books:
        # Find the corresponding book and user
        book = books.get(str(item.get("book_id")))
        user = users.get(str(item.get("user_id")))
        
        if not book or not user:
            logger.warning(f"Skipping record with invalid book_id or user_id: {item}")
            continue
        
        # Parse dates
        borrow_date = datetime.fromisoformat(item.get("borrow_date")) if item.get("borrow_date") else datetime.utcnow()
        due_date = datetime.fromisoformat(item.get("due_date")) if item.get("due_date") else (borrow_date + timedelta(days=14))
        return_date = datetime.fromisoformat(item.get("return_date")) if item.get("return_date") else None
        
        # Create BorrowedBook object
        db_borrow = BorrowedBook(
            id=uuid.uuid4(),
            book_id=book.id,
            user_id=user.id,
            borrow_date=borrow_date,
            due_date=due_date,
            return_date=return_date,
            status=item.get("status", "borrowed")
        )
        db.add(db_borrow)
    
    db.commit()
    logger.info(f"Seeded borrowed books successfully")

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

def create_tables():
    """Create database tables."""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)

def main():
    """Main function to seed the database."""
    try:
        # Create tables if they don't exist
        create_tables()
        
        # Create a database session
        db = SessionLocal()
        
        try:
            # Seed the database
            seed_users(db)
            seed_books(db)
            seed_borrowed_books(db)
            
            logger.info("Database seeding complete")
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()