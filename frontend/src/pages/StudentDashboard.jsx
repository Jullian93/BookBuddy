import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SearchBar from '../components/student/SearchBar';
import BookList from '../components/student/BookList';
import BorrowedBooks from '../components/student/BorrowedBooks';
import { books, borrowedBooks, getBorrowedBooksByUser, getBookById } from '../components/data/books';
import { filterBooks } from '../utils/helpers';

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [availableBooks, setAvailableBooks] = useState([]);
  const [userBorrowedBooks, setUserBorrowedBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchParams, setSearchParams] = useState({ searchTerm: '', filter: 'all' });
  const [activeTab, setActiveTab] = useState('browse');
  
  // Redirect if not logged in or not a student
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'student') {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  // Load books
  useEffect(() => {
    if (currentUser) {
      // Get available books
      setAvailableBooks(books.filter(book => book.copiesAvailable > 0));
      
      // Get user's borrowed books
      const userBooks = getBorrowedBooksByUser(currentUser.id);
      setUserBorrowedBooks(userBooks);
      
      // Initialize filtered books
      setFilteredBooks(books.filter(book => book.copiesAvailable > 0));
    }
  }, [currentUser]);
  
  // Handle search
  const handleSearch = (params) => {
    setSearchParams(params);
    
    let results = [...books];
    
    // Filter by availability if selected
    if (params.filter === 'available') {
      results = results.filter(book => book.copiesAvailable > 0);
    }
    
    // Filter by search term
    if (params.searchTerm) {
      results = filterBooks(results, params.searchTerm);
    }
    
    setFilteredBooks(results);
  };
  
  // Handle borrow book
  const handleBorrowBook = (bookId) => {
    // In a real app, this would be an API call
    const book = getBookById(bookId);
    
    if (book && book.copiesAvailable > 0) {
      // Create a new borrowed record
      const newBorrow = {
        id: borrowedBooks.length + 1,
        bookId: bookId,
        userId: currentUser.id,
        borrowDate: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 14)), // 2 weeks from now
        returnDate: null,
        status: 'borrowed',
      };
      
      // Update the book's available copies
      const updatedBook = { ...book, copiesAvailable: book.copiesAvailable - 1 };
      
      // In a real app, this would update the database
      // For this demo, we'll just update our local state
      // borrowedBooks.push(newBorrow);
      setUserBorrowedBooks([...userBorrowedBooks, { ...newBorrow, book: updatedBook }]);
      
      // Update available books
      const updatedAvailableBooks = availableBooks.map(b => 
        b.id === bookId ? updatedBook : b
      );
      setAvailableBooks(updatedAvailableBooks);
      
      // Update filtered books
      const updatedFilteredBooks = filteredBooks.map(b => 
        b.id === bookId ? updatedBook : b
      );
      setFilteredBooks(updatedFilteredBooks);
      
      alert(`You have successfully borrowed "${book.title}". It is due back on ${newBorrow.dueDate.toLocaleDateString()}.`);
    }
  };
  
  // Handle return book
  const handleReturnBook = (borrowId) => {
    // Find the borrowed record
    const borrowRecord = userBorrowedBooks.find(item => item.id === borrowId);
    
    if (borrowRecord) {
      // Update the borrow record
      const updatedRecord = {
        ...borrowRecord,
        returnDate: new Date(),
        status: 'returned',
      };
      
      // Get the book
      const book = getBookById(borrowRecord.bookId);
      
      // Update the book's available copies
      const updatedBook = { ...book, copiesAvailable: book.copiesAvailable + 1 };
      
      // Update user's borrowed books
      const updatedUserBorrowedBooks = userBorrowedBooks.map(item => 
        item.id === borrowId ? { ...updatedRecord, book: updatedBook } : item
      );
      setUserBorrowedBooks(updatedUserBorrowedBooks);
      
      // Update available books
      const updatedAvailableBooks = availableBooks.map(b => 
        b.id === borrowRecord.bookId ? updatedBook : b
      );
      setAvailableBooks(updatedAvailableBooks);
      
      // Update filtered books
      const updatedFilteredBooks = filteredBooks.map(b => 
        b.id === borrowRecord.bookId ? updatedBook : b
      );
      setFilteredBooks(updatedFilteredBooks);
      
      alert(`You have successfully returned "${borrowRecord.book.title}".`);
    }
  };
  
  // Handle renew book
  const handleRenewBook = (borrowId) => {
    // Find the borrowed record
    const borrowRecord = userBorrowedBooks.find(item => item.id === borrowId);
    
    if (borrowRecord) {
      // Update the borrow record with a new due date (2 more weeks)
      const newDueDate = new Date(new Date().setDate(new Date().getDate() + 14));
      const updatedRecord = {
        ...borrowRecord,
        dueDate: newDueDate,
        status: 'borrowed', // Reset status if it was overdue
      };
      
      // Update user's borrowed books
      const updatedUserBorrowedBooks = userBorrowedBooks.map(item => 
        item.id === borrowId ? updatedRecord : item
      );
      setUserBorrowedBooks(updatedUserBorrowedBooks);
      
      alert(`You have successfully renewed "${borrowRecord.book.title}". It is now due back on ${newDueDate.toLocaleDateString()}.`);
    }
  };
  
  // View book details
  const handleViewBookDetails = (bookId) => {
    // In a real app, this would navigate to a book details page
    alert(`View details for book ID: ${bookId}`);
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
            <h1 className="text-2xl font-serif font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-600">Welcome back, {currentUser.firstName}!</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('browse')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'browse'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Browse Books
            </button>
            <button
              onClick={() => setActiveTab('borrowed')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'borrowed'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Borrowed Books
              {userBorrowedBooks.filter(item => !item.returnDate).length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                  {userBorrowedBooks.filter(item => !item.returnDate).length}
                </span>
              )}
            </button>
          </nav>
        </div>
        
        {/* Content based on active tab */}
        {activeTab === 'browse' && (
          <>
            <SearchBar onSearch={handleSearch} />
            <div className="mt-6">
              <BookList
                books={filteredBooks}
                onBorrow={handleBorrowBook}
                onViewDetails={handleViewBookDetails}
              />
            </div>
          </>
        )}
        
        {activeTab === 'borrowed' && (
          <>
            <BorrowedBooks
              borrowedBooks={userBorrowedBooks.filter(item => !item.returnDate)}
              onReturn={handleReturnBook}
              onRenew={handleRenewBook}
            />
            
            {/* Borrowing History */}
            <div className="mt-8">
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-4">Borrowing History</h2>
              {userBorrowedBooks.filter(item => item.returnDate).length > 0 ? (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Book
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Borrowed Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Returned Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userBorrowedBooks
                        .filter(item => item.returnDate)
                        .sort((a, b) => new Date(b.returnDate) - new Date(a.returnDate))
                        .map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img
                                    className="h-10 w-10 rounded object-cover"
                                    src={item.book.coverImage || `https://via.placeholder.com/40?text=${encodeURIComponent(item.book.title[0])}`}
                                    alt={item.book.title}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.book.title}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    by {item.book.author}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(item.borrowDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(item.returnDate).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow text-center">
                  <p className="text-gray-500">You don't have any return history yet.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default StudentDashboard;