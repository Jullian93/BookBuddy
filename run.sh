#!/bin/bash

# Library Management System Startup Script
# This script starts both the frontend and backend services

# Text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Print banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║             Library Management System Startup              ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check if python is installed
if ! command_exists python3; then
  echo -e "${RED}Error: Python 3 is not installed.${NC}"
  echo "Please install Python 3 and try again."
  exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
  echo -e "${RED}Error: npm is not installed.${NC}"
  echo "Please install Node.js and npm, then try again."
  exit 1
fi

# Check if PostgreSQL is installed and running
if ! command_exists psql; then
  echo -e "${RED}Error: PostgreSQL is not installed.${NC}"
  echo "Please install PostgreSQL and try again."
  exit 1
fi

if ! pg_isready > /dev/null 2>&1; then
  echo -e "${RED}Error: PostgreSQL is not running.${NC}"
  echo "Please start PostgreSQL and try again."
  exit 1
fi

# Check if required directories exist
if [ ! -d "backend" ]; then
  echo -e "${RED}Error: 'backend' directory not found.${NC}"
  echo "Please make sure you're running this script from the correct directory."
  exit 1
fi

if [ ! -d "library-management-system" ] && [ ! -d "frontend" ]; then
  echo -e "${YELLOW}Frontend directory not found. Creating a new React app...${NC}"
  npx create-react-app library-management-system
  # Rename to 'frontend' to match our naming
  mv library-management-system frontend
fi

# Function to setup the backend
setup_backend() {
  echo -e "${YELLOW}Setting up backend...${NC}"
  
  # Create virtual environment if it doesn't exist
  if [ ! -d "backend/venv" ]; then
    echo "Creating virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
  fi
  
  # Activate virtual environment
  echo "Activating virtual environment..."
  source backend/venv/bin/activate
  
  # Install dependencies
  echo "Installing Python dependencies..."
  pip install -r backend/requirements.txt
  
  # Check if .env file exists
  if [ ! -f "backend/.env" ]; then
    echo "Creating .env file from template..."
    cp backend/.env.template backend/.env
    echo -e "${YELLOW}Please edit backend/.env to add your OpenAI API key and other settings.${NC}"
  fi
  
  # Create data directory for scripts if it doesn't exist
  if [ ! -d "backend/scripts/data" ]; then
    echo "Creating data directory for scripts..."
    mkdir -p backend/scripts/data
  fi
  
  # Copy sample data files
  echo "Preparing sample data files..."
  mkdir -p backend/scripts/data
  
  # Create sample JSON data files from the frontend JS data files if they don't exist
  if [ ! -f "backend/scripts/data/books.json" ]; then
    echo "Creating books.json from frontend data..."
    cat frontend/src/data/books.js | sed -n '/export const books/,/];/p' | sed 's/export const books = //' > backend/scripts/data/books.json
  fi
  
  if [ ! -f "backend/scripts/data/users.json" ]; then
    echo "Creating users.json from frontend data..."
    cat frontend/src/data/users.js | sed -n '/export const users/,/];/p' | sed 's/export const users = //' > backend/scripts/data/users.json
  fi
  
  if [ ! -f "backend/scripts/data/borrowed_books.json" ]; then
    echo "Creating borrowed_books.json from frontend data..."
    cat frontend/src/data/books.js | sed -n '/export const borrowedBooks/,/];/p' | sed 's/export const borrowedBooks = //' > backend/scripts/data/borrowed_books.json
  fi
  
  # Initialize PostgreSQL database
  echo "Initializing PostgreSQL database..."
  backend/init_postgres_db.sh
  
  # Deactivate virtual environment
  deactivate
  
  echo -e "${GREEN}Backend setup complete!${NC}"
}

# Function to setup the frontend
setup_frontend() {
  echo -e "${YELLOW}Setting up frontend...${NC}"
  
  cd frontend
  
  # Install dependencies
  echo "Installing npm dependencies..."
  npm install react-router-dom@latest
  npm install @headlessui/react @heroicons/react
  npm install -D tailwindcss postcss autoprefixer
  
  # Initialize Tailwind CSS if not already initialized
  if [ ! -f "tailwind.config.js" ]; then
    echo "Initializing Tailwind CSS..."
    npx tailwindcss init -p
  fi
  
  # Create .env file if it doesn't exist
  if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    echo "REACT_APP_API_URL=http://localhost:8000/api/v1" > .env
  fi
  
  cd ..
  
  echo -e "${GREEN}Frontend setup complete!${NC}"
}

# Function to start the backend
start_backend() {
  echo -e "${YELLOW}Starting backend server...${NC}"
  
  # Activate virtual environment
  source backend/venv/bin/activate
  
  # Run database seeding script 
  echo "Seeding the database..."
  python backend/scripts/seed_data.py
  
  # Generate embeddings
  echo "Generating embeddings..."
  python backend/scripts/generate_embeddings.py
  
  # Start the FastAPI server
  echo "Starting FastAPI server..."
  cd backend
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
  BACKEND_PID=$!
  cd ..
  
  echo -e "${GREEN}Backend server started with PID: ${BACKEND_PID}${NC}"
}

# Function to start the frontend
start_frontend() {
  echo -e "${YELLOW}Starting frontend server...${NC}"
  
  cd frontend
  
  # Start the React development server
  npm start &
  FRONTEND_PID=$!
  
  cd ..
  
  echo -e "${GREEN}Frontend server started with PID: ${FRONTEND_PID}${NC}"
}

# Function to handle cleanup on exit
cleanup() {
  echo -e "${YELLOW}Shutting down servers...${NC}"
  
  # Kill the backend process if it exists
  if [ ! -z "${BACKEND_PID}" ]; then
    kill ${BACKEND_PID} 2>/dev/null
    echo "Backend server stopped."
  fi
  
  # Kill the frontend process if it exists
  if [ ! -z "${FRONTEND_PID}" ]; then
    kill ${FRONTEND_PID} 2>/dev/null
    echo "Frontend server stopped."
  fi
  
  echo -e "${GREEN}Cleanup complete.${NC}"
  exit 0
}

# Register the cleanup function for script termination
trap cleanup EXIT INT TERM

# Setup backend and frontend
setup_backend
setup_frontend

# Start backend and frontend servers
start_backend
start_frontend

# Print information
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║             Library Management System is running           ║"
echo "║                                                            ║"
echo "║  Backend: http://localhost:8000                           ║"
echo "║  API Docs: http://localhost:8000/docs                     ║"
echo "║  Frontend: http://localhost:3000                          ║"
echo "║                                                            ║"
echo "║  Press Ctrl+C to stop all servers                         ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Keep the script running
wait