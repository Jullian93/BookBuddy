"""
SQLAlchemy database models
"""

import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, Table, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base

class Book(Base):
    """Book model"""
    __tablename__ = "books"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False, index=True)
    author = Column(String(255), nullable=False, index=True)
    isbn = Column(String(20), unique=True, nullable=True)
    genre = Column(String(100), nullable=False, index=True)
    publication_year = Column(Integer, nullable=False)
    publisher = Column(String(255), nullable=True)
    description = Column(Text, nullable=False)
    copies = Column(Integer, nullable=False, default=1)
    copies_available = Column(Integer, nullable=False, default=1)
    cover_image = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    borrowed_records = relationship("BorrowedBook", back_populates="book")
    embedding = relationship("BookEmbedding", uselist=False, back_populates="book")

class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, index=True)  # 'student' or 'librarian'
    student_id = Column(String(50), nullable=True)
    department = Column(String(100), nullable=True)
    avatar = Column(String(255), nullable=True)
    join_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    borrowed_records = relationship("BorrowedBook", back_populates="user")

class BorrowedBook(Base):
    """Borrowed book record model"""
    __tablename__ = "borrowed_books"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    borrow_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    due_date = Column(DateTime, nullable=False)
    return_date = Column(DateTime, nullable=True)
    status = Column(String(20), nullable=False, default="borrowed")  # 'borrowed', 'returned', 'overdue'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    book = relationship("Book", back_populates="borrowed_records")
    user = relationship("User", back_populates="borrowed_records")

class BookEmbedding(Base):
    """Book embedding model for similarity search"""
    __tablename__ = "book_embeddings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id"), unique=True, nullable=False)
    embedding = Column(ARRAY(Float), nullable=False)  # Vector storage for embeddings
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    book = relationship("Book", back_populates="embedding")