"""
PostgreSQL database connection and session management
"""

import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Create SQLAlchemy engine
engine = create_engine(settings.DATABASE_URL)

# Create SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for declarative models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    """
    Get a database session.
    
    This is a dependency that will be used in FastAPI endpoints.
    It creates a new SQLAlchemy session for each request and
    ensures the session is closed when the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()