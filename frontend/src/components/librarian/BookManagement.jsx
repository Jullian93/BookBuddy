import React, { useState } from 'react';
import Button from '../common/Button';
import { formatDate } from '../../utils/helpers';

const BookManagement = ({ books, onEdit, onDelete, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    publicationYear: '',
    publisher: '',
    copies: 1,
    description: '',
  });
  
  // Filter books based on search term
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.includes(searchTerm) ||
    book.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle book form change
  const handleBookFormChange = (e) => {
    const { name, value } = e.target;
    setNewBook(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle add book
  const handleAddBook = (e) => {
    e.preventDefault();
    onAdd(newBook);
    setNewBook({
      title: '',
      author: '',
      isbn: '',
      genre: '',
      publicationYear: '',
      publisher: '',
      copies: 1,
      description: '',
    });
    setIsAddModalOpen(false);
  };
  
  // Handle edit book
  const handleEditBook = (e) => {
    e.preventDefault();
    onEdit(selectedBook.id, newBook);
    setIsEditModalOpen(false);
    setSelectedBook(null);
  };
  
  // Open edit modal
  const openEditModal = (book) => {
    setSelectedBook(book);
    setNewBook({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre,
      publicationYear: book.publicationYear,
      publisher: book.publisher,
      copies: book.copies,
      description: book.description,
    });
    setIsEditModalOpen(true);
  };
  
  // Open delete modal
  const openDeleteModal = (book) => {
    setSelectedBook(book);
    setIsDeleteModalOpen(true);
  };
  
  // Confirm delete
  const confirmDelete = () => {
    onDelete(selectedBook.id);
    setIsDeleteModalOpen(false);
    setSelectedBook(null);
  };
  
  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header with search and add button */}
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Book Management</h3>
        <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:w-64 pl-3 pr-3 py-2 border-gray-300 rounded-md"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add New Book
          </Button>
        </div>
      </div>
      
      {/* Book table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title / Author
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ISBN
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Genre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Copies
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBooks.map((book) => (
              <tr key={book.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded object-cover"
                        src={book.coverImage || `https://via.placeholder.com/40?text=${encodeURIComponent(book.title[0])}`}
                        alt={book.title}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {book.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        by {book.author}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {book.isbn}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {book.genre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {book.publicationYear}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {book.copiesAvailable} / {book.copies}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="outline"
                    size="xs"
                    className="mr-2"
                    onClick={() => openEditModal(book)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="xs"
                    onClick={() => openDeleteModal(book)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* No books message */}
      {filteredBooks.length === 0 && (
        <div className="text-center py-10">
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No books found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "No books match your search criteria."
              : "You haven't added any books yet."}
          </p>
          {searchTerm ? (
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => setSearchTerm('')}
            >
              Clear Search
            </Button>
          ) : (
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Your First Book
            </Button>
          )}
        </div>
      )}
      
      {/* Add Book Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddBook}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Book</h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newBook.title}
                            onChange={handleBookFormChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                            Author
                          </label>
                          <input
                            type="text"
                            name="author"
                            id="author"
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newBook.author}
                            onChange={handleBookFormChange}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">
                              ISBN
                            </label>
                            <input
                              type="text"
                              name="isbn"
                              id="isbn"
                              required
                              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newBook.isbn}
                              onChange={handleBookFormChange}
                            />
                          </div>
                          <div>
                            <label htmlFor="publicationYear" className="block text-sm font-medium text-gray-700">
                              Publication Year
                            </label>
                            <input
                              type="number"
                              name="publicationYear"
                              id="publicationYear"
                              required
                              min="1000"
                              max={new Date().getFullYear()}
                              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newBook.publicationYear}
                              onChange={handleBookFormChange}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
                              Genre
                            </label>
                            <input
                              type="text"
                              name="genre"
                              id="genre"
                              required
                              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newBook.genre}
                              onChange={handleBookFormChange}
                            />
                          </div>
                          <div>
                            <label htmlFor="copies" className="block text-sm font-medium text-gray-700">
                              Number of Copies
                            </label>
                            <input
                              type="number"
                              name="copies"
                              id="copies"
                              required
                              min="1"
                              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newBook.copies}
                              onChange={handleBookFormChange}
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="publisher" className="block text-sm font-medium text-gray-700">
                            Publisher
                          </label>
                          <input
                            type="text"
                            name="publisher"
                            id="publisher"
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newBook.publisher}
                            onChange={handleBookFormChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            name="description"
                            id="description"
                            rows="3"
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newBook.description}
                            onChange={handleBookFormChange}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    type="submit"
                    variant="primary"
                    className="sm:ml-3"
                  >
                    Add Book
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 sm:mt-0"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Book Modal */}
      {isEditModalOpen && selectedBook && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleEditBook}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Edit Book</h3>
                      {/* Same form fields as Add Book Modal */}
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="edit-title"
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newBook.title}
                            onChange={handleBookFormChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-author" className="block text-sm font-medium text-gray-700">
                            Author
                          </label>
                          <input
                            type="text"
                            name="author"
                            id="edit-author"
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newBook.author}
                            onChange={handleBookFormChange}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="edit-isbn" className="block text-sm font-medium text-gray-700">
                              ISBN
                            </label>
                            <input
                              type="text"
                              name="isbn"
                              id="edit-isbn"
                              required
                              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newBook.isbn}
                              onChange={handleBookFormChange}
                            />
                          </div>
                          <div>
                            <label htmlFor="edit-publicationYear" className="block text-sm font-medium text-gray-700">
                              Publication Year
                            </label>
                            <input
                              type="number"
                              name="publicationYear"
                              id="edit-publicationYear"
                              required
                              min="1000"
                              max={new Date().getFullYear()}
                              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newBook.publicationYear}
                              onChange={handleBookFormChange}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="edit-genre" className="block text-sm font-medium text-gray-700">
                              Genre
                            </label>
                            <input
                              type="text"
                              name="genre"
                              id="edit-genre"
                              required
                              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newBook.genre}
                              onChange={handleBookFormChange}
                            />
                          </div>
                          <div>
                            <label htmlFor="edit-copies" className="block text-sm font-medium text-gray-700">
                              Number of Copies
                            </label>
                            <input
                              type="number"
                              name="copies"
                              id="edit-copies"
                              required
                              min="1"
                              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newBook.copies}
                              onChange={handleBookFormChange}
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="edit-publisher" className="block text-sm font-medium text-gray-700">
                            Publisher
                          </label>
                          <input
                            type="text"
                            name="publisher"
                            id="edit-publisher"
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newBook.publisher}
                            onChange={handleBookFormChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            name="description"
                            id="edit-description"
                            rows="3"
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newBook.description}
                            onChange={handleBookFormChange}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    type="submit"
                    variant="primary"
                    className="sm:ml-3"
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 sm:mt-0"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedBook && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Book</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete "{selectedBook.title}"? This action cannot be undone, and all records associated with this book will be permanently removed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  variant="danger"
                  className="sm:ml-3"
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  className="mt-3 sm:mt-0"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookManagement;