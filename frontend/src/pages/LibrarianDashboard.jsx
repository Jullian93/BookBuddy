import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Dashboard from '../components/librarian/Dashboard';
import BookManagement from '../components/librarian/BookManagement';
import UserManagement from '../components/librarian/UserManagement';
import { books, borrowedBooks } from '../data/books';
import { users } from '../data/users';

const LibrarianDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [localBooks, setLocalBooks] = useState([]);
  const [localUsers, setLocalUsers] = useState([]);
  const [localBorrowedBooks, setLocalBorrowedBooks] = useState([]);
  
  // Redirect if not logged in or not a librarian
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'librarian') {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  // Load data
  useEffect(() => {
    if (currentUser) {
      setLocalBooks(books);
      setLocalUsers(users);
      setLocalBorrowedBooks(borrowedBooks);
    }
  }, [currentUser]);
  
  // Handle add book
  const handleAddBook = (newBook) => {
    const bookToAdd = {
      ...newBook,
      id: localBooks.length + 1,
      coverImage: `https://via.placeholder.com/150x200?text=${encodeURIComponent(newBook.title)}`,
      available: true,
      copiesAvailable: parseInt(newBook.copies),
    };
    
    setLocalBooks([...localBooks, bookToAdd]);
    alert(`Book "${newBook.title}" has been added successfully.`);
  };
  
  // Handle edit book
  const handleEditBook = (bookId, updatedBook) => {
    const bookIndex = localBooks.findIndex(book => book.id === bookId);
    
    if (bookIndex !== -1) {
      const updatedBooks = [...localBooks];
      updatedBooks[bookIndex] = {
        ...updatedBooks[bookIndex],
        ...updatedBook,
        copiesAvailable: parseInt(updatedBook.copies) - (updatedBooks[bookIndex].copies - updatedBooks[bookIndex].copiesAvailable)
      };
      
      setLocalBooks(updatedBooks);
      alert(`Book "${updatedBook.title}" has been updated successfully.`);
    }
  };
  
  // Handle delete book
  const handleDeleteBook = (bookId) => {
    const bookToDelete = localBooks.find(book => book.id === bookId);
    
    if (bookToDelete) {
      // Check if book has active borrows
      const activeBorows = localBorrowedBooks.filter(
        borrow => borrow.bookId === bookId && !borrow.returnDate
      );
      
      if (activeBorows.length > 0) {
        alert(`Cannot delete book "${bookToDelete.title}" because it is currently borrowed by ${activeBorows.length} users.`);
        return;
      }
      
      // Remove book
      const updatedBooks = localBooks.filter(book => book.id !== bookId);
      setLocalBooks(updatedBooks);
      
      // Remove associated borrow records
      const updatedBorrows = localBorrowedBooks.filter(borrow => borrow.bookId !== bookId);
      setLocalBorrowedBooks(updatedBorrows);
      
      alert(`Book "${bookToDelete.title}" has been deleted successfully.`);
    }
  };
  
  // Handle add user
  const handleAddUser = (newUser) => {
    const userToAdd = {
      ...newUser,
      id: localUsers.length + 1,
      joinDate: new Date(),
      avatar: `https://via.placeholder.com/150?text=${encodeURIComponent(newUser.firstName[0])}`,
    };
    
    setLocalUsers([...localUsers, userToAdd]);
    alert(`User "${newUser.firstName} ${newUser.lastName}" has been added successfully.`);
  };
  
  // Handle edit user
  const handleEditUser = (userId, updatedUser) => {
    const userIndex = localUsers.findIndex(user => user.id === userId);
    
    if (userIndex !== -1) {
      const updatedUsers = [...localUsers];
      updatedUsers[userIndex] = {
        ...updatedUsers[userIndex],
        ...updatedUser,
        // Don't update password if it's empty
        password: updatedUser.password ? updatedUser.password : updatedUsers[userIndex].password,
      };
      
      setLocalUsers(updatedUsers);
      alert(`User "${updatedUser.firstName} ${updatedUser.lastName}" has been updated successfully.`);
    }
  };
  
  // Handle delete user
  const handleDeleteUser = (userId) => {
    const userToDelete = localUsers.find(user => user.id === userId);
    
    if (userToDelete) {
      // Check if user has active borrows
      const activeBorows = localBorrowedBooks.filter(
        borrow => borrow.userId === userId && !borrow.returnDate
      );
      
      if (activeBorows.length > 0) {
        alert(`Cannot delete user "${userToDelete.firstName} ${userToDelete.lastName}" because they have ${activeBorows.length} active borrows.`);
        return;
      }
      
      // Remove user
      const updatedUsers = localUsers.filter(user => user.id !== userId);
      setLocalUsers(updatedUsers);
      
      alert(`User "${userToDelete.firstName} ${userToDelete.lastName}" has been deleted successfully.`);
    }
  };
  
  if (!currentUser) {
    return null; // Or a loading indicator
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow container-custom py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-900">Librarian Dashboard</h1>
            <p className="text-gray-600">Welcome back, {currentUser.firstName}!</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('books')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'books'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Book Management
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Management
            </button>
          </nav>
        </div>
        
        {/* Content based on active tab */}
        {activeTab === 'dashboard' && (
          <Dashboard
            books={localBooks}
            users={localUsers}
            borrowedBooks={localBorrowedBooks}
          />
        )}
        
        {activeTab === 'books' && (
          <BookManagement
            books={localBooks}
            onAdd={handleAddBook}
            onEdit={handleEditBook}
            onDelete={handleDeleteBook}
          />
        )}
        
        {activeTab === 'users' && (
          <UserManagement
            users={localUsers}
            borrowedBooks={localBorrowedBooks}
            onAdd={handleAddUser}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default LibrarianDashboard;