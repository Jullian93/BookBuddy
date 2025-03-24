import React, { useState } from 'react';
import BookCard from '../common/BookCard';
import Button from '../common/Button';

const BookList = ({ books, onBorrow, onReturn, onViewDetails, isBorrowedList = false }) => {
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 8;

  // Sort books
  const sortedBooks = [...books].sort((a, b) => {
    let valueA = a[sortBy];
    let valueB = b[sortBy];
    
    // Handle string comparison
    if (typeof valueA === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }
    
    // Compare the values
    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = sortedBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(books.length / booksPerPage);

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Pagination controls
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <div>
      {books.length > 0 ? (
        <>
          <div className="mb-4 flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-serif font-bold mb-4 md:mb-0">
              {isBorrowedList ? 'Your Borrowed Books' : 'Available Books'}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({books.length} {books.length === 1 ? 'book' : 'books'})
              </span>
            </h2>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="text-sm rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="publicationYear">Year</option>
                <option value="genre">Genre</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
              >
                {sortOrder === 'asc' ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Book Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onBorrow={onBorrow}
                onReturn={onReturn}
                onViewDetails={onViewDetails}
                isBorrowed={isBorrowedList}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 bg-white p-4 rounded-lg shadow">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstBook + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastBook, books.length)}
                    </span>{' '}
                    of <span className="font-medium">{books.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === number
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                    
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No books found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {isBorrowedList
              ? "You don't have any borrowed books at the moment."
              : "We couldn't find any books matching your search criteria."}
          </p>
        </div>
      )}
    </div>
  );
};

export default BookList;