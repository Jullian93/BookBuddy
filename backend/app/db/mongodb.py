"""
MongoDB database connection and utility functions
"""

import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# MongoDB Client instances
async_client: Optional[AsyncIOMotorClient] = None
db: Optional[AsyncIOMotorDatabase] = None


async def connect_to_mongo() -> None:
    """Create async database connection."""
    global async_client, db
    try:
        async_client = AsyncIOMotorClient(settings.MONGODB_URI)
        db_name = settings.MONGODB_URI.split("/")[-1]
        db = async_client[db_name]
        
        # Verify connection is working
        await async_client.admin.command('ping')
        logger.info("Connected to MongoDB")
    except ConnectionFailure as e:
        logger.error(f"MongoDB connection error: {e}")
        raise


async def close_mongo_connection() -> None:
    """Close database connection."""
    global async_client
    if async_client:
        async_client.close()
        logger.info("MongoDB connection closed")


def get_database() -> MongoClient:
    """
    Get a synchronous MongoDB database connection.
    Used by scripts that need to access the database directly.
    """
    client = MongoClient(settings.MONGODB_URI)
    db_name = settings.MONGODB_URI.split("/")[-1]
    return client[db_name]


async def get_async_database() -> AsyncIOMotorDatabase:
    """Get the async database instance."""
    if db is None:
        await connect_to_mongo()
    return db


# Create database indexes
async def create_indexes() -> None:
    """Create necessary database indexes."""
    db = await get_async_database()
    
    # Create indexes for books collection
    await db.books.create_index("title")
    await db.books.create_index("author")
    await db.books.create_index("genre")
    
    # Create indexes for users collection
    await db.users.create_index("email", unique=True)
    await db.users.create_index("role")
    
    # Create indexes for book_embeddings collection
    await db.book_embeddings.create_index("book_id", unique=True)
    
    # Create indexes for borrowed_books collection
    await db.borrowed_books.create_index("user_id")
    await db.borrowed_books.create_index("book_id")
    await db.borrowed_books.create_index("status")
    
    logger.info("MongoDB indexes created")