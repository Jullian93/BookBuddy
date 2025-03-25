# BookBuddy: AI-Powered Library Management System

BookBuddy is a comprehensive library management system with built-in AI-powered book recommendations. It helps librarians connect students with books they'll love, increasing reading adoption and enjoyment.

## 🌟 Features

### For Librarians
- Complete book inventory management
- User management for students and staff
- AI-powered book recommendation engine
- Reading history analytics
- Borrowing and returns tracking

### For Students
- Easy book browsing and discovery
- Personalized reading recommendations
- Borrowing history and tracking
- Simple book reservation system

## 🛠️ Technology Stack

### Frontend
- **React**: Modern, component-based UI
- **Tailwind CSS**: Utility-first styling
- **React Router**: Navigation and routing
- **Docker**: Containerization for easy deployment

### Backend
- **Python**: Core programming language
- **FastAPI**: High-performance API framework
- **SQLAlchemy**: ORM for database interactions
- **PostgreSQL**: Relational database
- **OpenAI API**: Embedding generation and LLM integration

## 🧠 AI Recommendation Engine

BookBuddy uses a sophisticated Retrieval Augmented Generation (RAG) architecture:

1. **Vector Embeddings**: Books are converted to high-dimensional vectors using OpenAI's text embedding model
2. **Similarity Search**: Student reading history is used to find books with similar themes and content
3. **LLM Refinement**: GPT-4o analyzes candidate books and selects the best recommendations
4. **Personalized Explanations**: Each recommendation includes context explaining why it was chosen

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Python 3.8+
- PostgreSQL
- Docker and Docker Compose (optional)

### Frontend Setup

#### Using Docker (Recommended)
```bash
# Production build
docker-compose up --build frontend

# OR Development mode with hot reloading
docker-compose -f docker-compose.dev.yml up --build frontend-dev
```

#### Manual Setup
```bash
cd frontend
npm install
npm start
```

### Backend Setup

#### Database Setup
```bash
# Create the database
createdb -U postgres library_system

# OR use the initialization script
cd backend
./init_postgres_db.sh
```

#### Python Environment
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment variables
cp .env.template .env
# Edit .env to add your OpenAI API key and database connection
```

#### Data Preparation
```bash
# Seed the database with sample data
python scripts/seed_data.py

# Generate embeddings for book recommendations
python scripts/generate_embeddings.py
```

#### Running the API
```bash
cd backend
uvicorn app.main:app --reload
```

## 📁 Project Structure

```
library-management-system/
├── frontend/                 # React application
│   ├── public/               # Static files
│   ├── src/                  # Source files
│   │   ├── components/       # React components
│   │   ├── contexts/         # React context providers
│   │   ├── data/             # Mock data
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   └── utils/            # Utility functions
│   ├── Dockerfile            # Production container config
│   └── Dockerfile.dev        # Development container config
│
├── backend/                  # FastAPI application
│   ├── alembic/              # Database migrations
│   ├── app/                  # API application
│   │   ├── api/              # API endpoints
│   │   ├── core/             # Core settings
│   │   ├── db/               # Database models and connection
│   │   ├── services/         # Business logic
│   │   └── main.py           # Application entry point
│   └── scripts/              # Utility scripts
│       ├── seed_data.py      # Database seeding
│       └── generate_embeddings.py  # Create book vectors
│
├── docker-compose.yml        # Production container orchestration
└── docker-compose.dev.yml    # Development container orchestration
```

## 🔄 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/test-token` - Validate token

### Books
- `GET /api/v1/books` - List all books
- `GET /api/v1/books/{book_id}` - Get book details
- `POST /api/v1/books` - Add new book
- `PUT /api/v1/books/{book_id}` - Update book
- `DELETE /api/v1/books/{book_id}` - Delete book

### Users
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/{user_id}` - Get user details
- `POST /api/v1/users` - Add new user
- `PUT /api/v1/users/{user_id}` - Update user
- `DELETE /api/v1/users/{user_id}` - Delete user

### Borrowed Books
- `GET /api/v1/users/{user_id}/borrowed-books` - Get user's borrowed books
- `POST /api/v1/borrowed-books` - Borrow a book
- `POST /api/v1/borrowed-books/{borrow_id}/return` - Return a book

### Recommendations
- `GET /api/v1/recommendations/users/{user_id}` - Get recommendations for user
- `GET /api/v1/recommendations/books/{book_id}/similar` - Find similar books

## 🔒 Authentication

BookBuddy uses JWT (JSON Web Tokens) for authentication. Different user roles (librarian, student) have different permissions in the system.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- OpenAI for providing the embedding and GPT models
- The FastAPI team for their excellent framework
- React team for the frontend library

---

For questions or support, please open an issue on the repository or contact the project maintainers.