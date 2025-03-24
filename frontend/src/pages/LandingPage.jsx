import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ books, users, borrowedBooks }) => {
  // Calculate stats
  const totalBooks = books.length;
  const totalAvailableBooks = books.reduce((acc, book) => acc + book.copiesAvailable, 0);
  const totalBorrowedBooks = borrowedBooks.filter(item => !item.returnDate).length;
  const totalUsers = users.length;
  const totalStudents = users.filter(user => user.role === 'student').length;
  const totalLibrarians = users.filter(user => user.role === 'librarian').length;
  const overdueBooks = borrowedBooks.filter(item => item.status === 'overdue').length;
  
  // Get recent activities (borrowing, returns)
  const recentActivities = [...borrowedBooks]
    .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate))
    .slice(0, 5)
    .map(item => {
      const book = books.find(book => book.id === item.bookId);
      const user = users.find(user => user.id === item.userId);
      return {
        ...item,
        book,
        user,
      };
    });
  
  // Stats cards data
  const stats = [
    {
      title: 'Total Books',
      value: totalBooks,
      icon: (
        <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      title: 'Books Borrowed',
      value: totalBorrowedBooks,
      icon: (
        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      title: 'Books Available',
      value: totalAvailableBooks,
      icon: (
        <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
    {
      title: 'Overdue Books',
      value: overdueBooks,
      icon: (
        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
    },
    {
      title: 'Total Users',
      value: totalUsers,
      icon: (
        <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
    },
    {
      title: 'Students',
      value: totalStudents,
      icon: (
        <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg px-5 py-6 sm:px-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Library Overview</h2>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bgColor} overflow-hidden rounded-lg shadow`}
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md p-3 bg-white">
                    {stat.icon}
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.title}
                      </dt>
                      <dd>
                        <div className={`text-xl font-semibold ${stat.textColor}`}>
                          {stat.value}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-5 py-6 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="bg-white overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {recentActivities.map((activity) => (
              <li key={activity.id}>
                <div className="px-5 py-5 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={activity.user.avatar || `https://via.placeholder.com/40?text=${encodeURIComponent(activity.user.firstName[0])}`}
                          alt={`${activity.user.firstName} ${activity.user.lastName}`}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {activity.user.firstName} {activity.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {activity.status === 'returned' ? 'Returned' : 'Borrowed'} <span className="font-medium">{activity.book.title}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        activity.status === 'overdue'
                          ? 'bg-red-100 text-red-800'
                          : activity.status === 'returned'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {activity.status === 'overdue'
                          ? 'Overdue'
                          : activity.status === 'returned'
                          ? 'Returned'
                          : 'Borrowed'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p>
                          {activity.status === 'returned'
                            ? `Returned on ${new Date(activity.returnDate).toLocaleDateString()}`
                            : `Borrowed on ${new Date(activity.borrowDate).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <svg
                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p>Due {new Date(activity.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            
            {recentActivities.length === 0 && (
              <li className="px-5 py-10 sm:px-6 text-center">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No recent activity
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No books have been borrowed or returned recently.
                </p>
              </li>
            )}
          </ul>
        </div>
      </div>
      
      {/* Quick Links */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-5 py-6 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="bg-white p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="px-4 py-5 sm:p-6 flex flex-col items-center text-center">
                <svg
                  className="h-8 w-8 text-primary-600 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <div className="mt-2">
                  <h3 className="text-lg font-medium text-gray-900">Add New Book</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add a new book to your library inventory.
                  </p>
                  <Link
                    to="/librarian/books"
                    className="inline-flex items-center px-4 py-2 mt-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Add Book
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="px-4 py-5 sm:p-6 flex flex-col items-center text-center">
                <svg
                  className="h-8 w-8 text-primary-600 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                <div className="mt-2">
                  <h3 className="text-lg font-medium text-gray-900">Add New User</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Register a new student or librarian.
                  </p>
                  <Link
                    to="/librarian/users"
                    className="inline-flex items-center px-4 py-2 mt-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Add User
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="px-4 py-5 sm:p-6 flex flex-col items-center text-center">
                <svg
                  className="h-8 w-8 text-primary-600 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div className="mt-2">
                  <h3 className="text-lg font-medium text-gray-900">Generate Reports</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    View and generate library activity reports.
                  </p>
                  <Link
                    to="/librarian/reports"
                    className="inline-flex items-center px-4 py-2 mt-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                  >
                    View Reports
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;