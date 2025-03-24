"""
Main FastAPI application
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from backend.app.db.database import connect_to_mongo, close_mongo_connection, create_indexes

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
    """Connect to MongoDB on startup."""
    logger.info("Starting up...")
    await connect_to_mongo()
    await create_indexes()

@app.on_event("shutdown")
async def shutdown_event():
    """Close MongoDB connection on shutdown."""
    logger.info("Shutting down...")
    await close_mongo_connection()

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