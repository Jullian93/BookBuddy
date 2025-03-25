# Library Management System Backend

This directory contains the backend API and recommendation engine for the Library Management System.

## Directory Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── auth.py
│   │   │   ├── books.py - under construction
│   │   │   ├── users.py - under construction
│   │   │   └── recommendations.py
│   │   ├── dependencies.py
│   │   └── router.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── errors.py
│   ├── db/
│   │   ├── mongodb.py
│   │   └── vector_store.py
│   ├── models/
│   │   ├── book.py
│   │   ├── user.py
│   │   └── recommendation.py
│   ├── services/
│   │   ├── recommendation_service.py
│   │   ├── embedding_service.py
│   │   ├── book_service.py - under construction
│   │   └── user_service.py - under construction
│   └── main.py
├── scripts/
│   ├── generate_embeddings.py
│   └── seed_data.py
└── tests/
    ├── test_api.py
    └── test_recommendation.py
```

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy `.env.template` to `.env` and fill in your environment variables:
```bash
cp .env.template .env
```

4. Generate embeddings for the book data:
```bash
python scripts/generate_embeddings.py
```

5. Run the server:
```bash
uvicorn app.main:app --reload
```

## API Documentation

When the server is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc