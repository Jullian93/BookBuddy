import React, { useState } from 'react';
import Button from '../common/Button';
import { formatDate } from '../../utils/helpers';
import RecommendationModal from './RecommendationModal';

const UserManagement = ({ users, onEdit, onDelete, onAdd, borrowedBooks }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
    studentId: '',
    department: '',
  });
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.studentId && user.studentId.includes(searchTerm)) ||
    (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Handle user form change
  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle add user
  const handleAddUser = (e) => {
    e.preventDefault();
    onAdd(newUser);
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'student',
      studentId: '',
      department: '',
    });
    setIsAddModalOpen(false);
  };
  
  // Handle edit user
  const handleEditUser = (e) => {
    e.preventDefault();
    onEdit(selectedUser.id, newUser);
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };
  
  // Open edit modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setNewUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
      studentId: user.studentId || '',
      department: user.department || '',
    });
    setIsEditModalOpen(true);
  };
  
  // Open delete modal
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };
  
  // Confirm delete
  const confirmDelete = () => {
    onDelete(selectedUser.id);
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };
  
  // Open user details modal
  const openDetailsModal = (user) => {
    setSelectedUser(user);
    setIsViewDetailsModalOpen(true);
  };
  
  // Get borrowed books by user
  const getUserBorrowedBooks = (userId) => {
    return borrowedBooks.filter(book => book.userId === userId);
  };

  // Handle getting recommendations
  const handleGetRecommendations = async (userId) => {
    setIsLoadingRecommendations(true);
    setRecommendations(null);
    
    // In a real app, this would be an API call
    // For this demo, we'll simulate an API call with a timeout
    setTimeout(() => {
      // Simulate API response
      const mockRecommendations = {
        recommendations: [
          {
            id: 3,
            title: "Pride and Prejudice",
            author: "Jane Austen",
            genre: "Classic",
            publicationYear: 1813,
            publisher: "Penguin Classics",
            coverImage: "https://via.placeholder.com/150x200?text=Pride+and+Prejudice",
            recommendation_reason: "This classic romance has themes of social class and personal growth that would appeal to a reader who enjoyed 'To Kill a Mockingbird' and its exploration of social justice."
          },
          {
            id: 6,
            title: "One Hundred Years of Solitude",
            author: "Gabriel García Márquez",
            genre: "Magical Realism",
            publicationYear: 1967,
            publisher: "Harper & Row",
            coverImage: "https://via.placeholder.com/150x200?text=One+Hundred+Years+of+Solitude",
            recommendation_reason: "Like '1984', this novel uses unconventional narrative techniques to explore deep social and political themes, but through the lens of magical realism."
          },
          {
            id: 8,
            title: "The Hobbit",
            author: "J.R.R. Tolkien",
            genre: "Fantasy",
            publicationYear: 1937,
            publisher: "Houghton Mifflin Harcourt",
            coverImage: "https://via.placeholder.com/150x200?text=The+Hobbit",
            recommendation_reason: "Based on the student's interest in complex narratives like '1984', this fantasy classic offers a similarly immersive world with rich character development and themes of courage and personal growth."
          }
        ],
        explanation: "These recommendations are based on the student's recent reading history, which shows an interest in both classic literature with strong character development and books that explore social themes. I've selected books that continue these themes while introducing some literary variety."
      };
      
      setRecommendations(mockRecommendations);
      setIsLoadingRecommendations(false);
    }, 2000);
  };
  
  // Open recommendation modal
  const openRecommendationModal = (user) => {
    setSelectedUser(user);
    setRecommendations(null);
    setIsRecommendationModalOpen(true);
  };
  
  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header with search and add button */}
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg leading-6 font-medium text-gray-900">User Management</h3>
        <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:w-64 pl-3 pr-3 py-2 border-gray-300 rounded-md"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add New User
          </Button>
        </div>
      </div>
      
      {/* User table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Join Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Active Borrows
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => {
              const userBorrowedBooks = getUserBorrowedBooks(user.id);
              const activeBorrows = userBorrowedBooks.filter(item => !item.returnDate).length;
              
              return (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={user.avatar || `https://via.placeholder.com/40?text=${encodeURIComponent(user.firstName[0])}`}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'librarian' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.role === 'student' ? (
                      <>
                        <div>ID: {user.studentId}</div>
                        <div>Dept: {user.department}</div>
                      </>
                    ) : (
                      <div>Staff Member</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.joinDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activeBorrows > 0 ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {activeBorrows}
                      </span>
                    ) : (
                      <span>0</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {user.role === 'student' && (
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => openRecommendationModal(user)}
                        >
                          Suggest Books
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => openDetailsModal(user)}
                      >
                        Details
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => openEditModal(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="xs"
                        onClick={() => openDeleteModal(user)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* No users message */}
      {filteredUsers.length === 0 && (
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "No users match your search criteria."
              : "You haven't added any users yet."}
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
              Add Your First User
            </Button>
          )}
        </div>
      )}
      
      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddUser}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New User</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                              First Name
                            </label>
                            <input
                              type="text"
                              name="firstName"
                              id="firstName"
                              required
                              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newUser.firstName}
                              onChange={handleUserFormChange}
                            />
                          </div>
                          <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                              Last Name
                            </label>
                            <input
                              type="text"
                              name="lastName"
                              id="lastName"
                              required
                              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newUser.lastName}
                              onChange={handleUserFormChange}
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newUser.email}
                            onChange={handleUserFormChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                          </label>
                          <input
                            type="password"
                            name="password"
                            id="password"
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newUser.password}
                            onChange={handleUserFormChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Role
                          </label>
                          <select
                            id="role"
                            name="role"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={newUser.role}
                            onChange={handleUserFormChange}
                          >
                            <option value="student">Student</option>
                            <option value="librarian">Librarian</option>
                          </select>
                        </div>
                        
                        {newUser.role === 'student' && (
                          <>
                            <div>
                              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                                Student ID
                              </label>
                              <input
                                type="text"
                                name="studentId"
                                id="studentId"
                                required
                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={newUser.studentId}
                                onChange={handleUserFormChange}
                              />
                            </div>
                            <div>
                              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                Department
                              </label>
                              <input
                                type="text"
                                name="department"
                                id="department"
                                required
                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={newUser.department}
                                onChange={handleUserFormChange}
                              />
                            </div>
                          </>
                        )}
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
                    Add User
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
      
      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleEditUser}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Edit User</h3>
                      {/* Same form fields as Add User Modal */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="edit-firstName" className="block text-sm font-medium text-gray-700">
                              First Name
                            </label>
                            <input
                              type="text"
                              name="firstName"
                              id="edit-firstName"
                              required
                              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newUser.firstName}
                              onChange={handleUserFormChange}
                            />
                          </div>
                          <div>
                            <label htmlFor="edit-lastName" className="block text-sm font-medium text-gray-700">
                              Last Name
                            </label>
                            <input
                              type="text"
                              name="lastName"
                              id="edit-lastName"
                              required
                              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newUser.lastName}
                              onChange={handleUserFormChange}
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="edit-email"
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newUser.email}
                            onChange={handleUserFormChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700">
                            Password (leave blank to keep current)
                          </label>
                          <input
                            type="password"
                            name="password"
                            id="edit-password"
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newUser.password}
                            onChange={handleUserFormChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700">
                            Role
                          </label>
                          <select
                            id="edit-role"
                            name="role"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={newUser.role}
                            onChange={handleUserFormChange}
                          >
                            <option value="student">Student</option>
                            <option value="librarian">Librarian</option>
                          </select>
                        </div>
                        
                        {newUser.role === 'student' && (
                          <>
                            <div>
                              <label htmlFor="edit-studentId" className="block text-sm font-medium text-gray-700">
                                Student ID
                              </label>
                              <input
                                type="text"
                                name="studentId"
                                id="edit-studentId"
                                required
                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={newUser.studentId}
                                onChange={handleUserFormChange}
                              />
                            </div>
                            <div>
                              <label htmlFor="edit-department" className="block text-sm font-medium text-gray-700">
                                Department
                              </label>
                              <input
                                type="text"
                                name="department"
                                id="edit-department"
                                required
                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={newUser.department}
                                onChange={handleUserFormChange}
                              />
                            </div>
                          </>
                        )}
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
      {isDeleteModalOpen && selectedUser && (
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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete User</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the user "{selectedUser.firstName} {selectedUser.lastName}"? This action cannot be undone, and all records associated with this user will be permanently removed.
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
      
      {/* User Details Modal */}
      {isViewDetailsModalOpen && selectedUser && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">User Details</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsViewDetailsModalOpen(false)}
                      >
                        Close
                      </Button>
                    </div>
                    
                    <div className="flex items-center mb-6">
                      <div className="flex-shrink-0 h-20 w-20">
                        <img
                          className="h-20 w-20 rounded-full object-cover"
                          src={selectedUser.avatar || `https://via.placeholder.com/80?text=${encodeURIComponent(selectedUser.firstName[0])}`}
                          alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                        />
                      </div>
                      <div className="ml-6">
                        <div className="text-xl font-bold text-gray-900">
                          {selectedUser.firstName} {selectedUser.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {selectedUser.email}
                        </div>
                        <div className="mt-1">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            selectedUser.role === 'librarian' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-6">
                        <div className="col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Join Date</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.joinDate)}</dd>
                        </div>
                        {selectedUser.role === 'student' && (
                          <>
                            <div className="col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Student ID</dt>
                              <dd className="mt-1 text-sm text-gray-900">{selectedUser.studentId}</dd>
                            </div>
                            <div className="col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Department</dt>
                              <dd className="mt-1 text-sm text-gray-900">{selectedUser.department}</dd>
                            </div>
                          </>
                        )}
                      </dl>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="text-base font-medium text-gray-900 mb-3">Borrowed Books</h4>
                      {getUserBorrowedBooks(selectedUser.id).length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                          {getUserBorrowedBooks(selectedUser.id).map((item) => (
                            <li key={item.id} className="py-3">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img
                                    className="h-10 w-10 rounded object-cover"
                                    src={item.book.coverImage || `https://via.placeholder.com/40?text=${encodeURIComponent(item.book.title[0])}`}
                                    alt={item.book.title}
                                  />
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">{item.book.title}</p>
                                  <div className="flex space-x-3 text-xs text-gray-500">
                                    <span>Borrowed: {formatDate(item.borrowDate)}</span>
                                    <span>Due: {formatDate(item.dueDate)}</span>
                                    {item.returnDate ? (
                                      <span className="text-green-600">Returned: {formatDate(item.returnDate)}</span>
                                    ) : (
                                      <span className={item.status === 'overdue' ? 'text-red-600' : 'text-blue-600'}>
                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">This user has no borrowing history.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Recommendation Modal */}
      {isRecommendationModalOpen && selectedUser && (
        <RecommendationModal
          isOpen={isRecommendationModalOpen}
          onClose={() => setIsRecommendationModalOpen(false)}
          user={selectedUser}
          onGetRecommendations={handleGetRecommendations}
          recommendations={recommendations}
          isLoading={isLoadingRecommendations}
        />
      )}
    </div>
  );
};

export default UserManagement;