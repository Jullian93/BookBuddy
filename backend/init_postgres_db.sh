#!/bin/bash

# Initialize PostgreSQL database for Library Management System

# Variables
DB_NAME="library_system"
DB_USER="postgres"
DB_PASSWORD="postgres"

# Text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Initializing PostgreSQL database for Library Management System...${NC}"

# Check if PostgreSQL is running
if ! pg_isready > /dev/null 2>&1; then
    echo -e "${RED}PostgreSQL is not running. Please start PostgreSQL and try again.${NC}"
    exit 1
fi

# Check if psql command is available
if ! command -v psql > /dev/null 2>&1; then
    echo -e "${RED}psql command not found. Please install PostgreSQL client tools.${NC}"
    exit 1
fi

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${YELLOW}Database '$DB_NAME' already exists.${NC}"
    
    # Ask user if they want to drop and recreate the database
    read -p "Do you want to drop and recreate the database? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Dropping database '$DB_NAME'...${NC}"
        dropdb "$DB_NAME"
        if [ $? -ne 0 ]; then
            echo -e "${RED}Failed to drop database '$DB_NAME'.${NC}"
            exit 1
        fi
        echo -e "${GREEN}Database '$DB_NAME' dropped successfully.${NC}"
    else
        echo -e "${YELLOW}Using existing database '$DB_NAME'.${NC}"
        exit 0
    fi
fi

# Create database
echo -e "${YELLOW}Creating database '$DB_NAME'...${NC}"
createdb "$DB_NAME"
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create database '$DB_NAME'.${NC}"
    exit 1
fi

echo -e "${GREEN}Database '$DB_NAME' created successfully.${NC}"

# Run database migrations with Alembic
echo -e "${YELLOW}Running database migrations with Alembic...${NC}"
cd "$(dirname "$0")"
if [ -d "alembic" ]; then
    alembic upgrade head
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to run migrations.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Database migrations completed successfully.${NC}"
else
    echo -e "${YELLOW}Alembic directory not found. Creating tables using SQLAlchemy models...${NC}"
    python -c "
from app.db.database import Base, engine
from app.db.models import Book, User, BorrowedBook, BookEmbedding
Base.metadata.create_all(bind=engine)
print('Tables created successfully')
"
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to create database tables.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Database tables created successfully.${NC}"
fi

echo -e "${GREEN}PostgreSQL database initialization completed successfully!${NC}"
echo -e "${YELLOW}You can now seed the database with sample data using:${NC}"
echo -e "  python scripts/seed_data.py"