"""
Main FastAPI application
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.db.database import Base, engine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] - %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

# Event handlers for startup and shutdown
@app.on_event("startup")
async def startup_event():
    """Create tables on startup if they don't exist."""
    logger.info("Starting up...")
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified")

# No shutdown handler needed for SQLAlchemy as it's handled automatically

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to the Library Management System API",
        "documentation": f"{settings.API_V1_STR}/docs",
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}