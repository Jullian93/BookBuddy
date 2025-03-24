"""
Application configuration settings loaded from environment variables
"""

import os
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseModel):
    """
    Application settings
    """
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Library Management System API"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # MongoDB settings
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/library_system")
    
    # JWT settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-secret-key")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    
    # OpenAI settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    CHAT_MODEL: str = "gpt-4o"
    
    # Recommendation settings
    NUM_SIMILAR_BOOKS: int = 10  # Number of similar books to retrieve
    NUM_RECOMMENDATIONS: int = 3  # Number of final recommendations to provide
    
    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))

    class Config:
        case_sensitive = True


# Create global settings object
settings = Settings()