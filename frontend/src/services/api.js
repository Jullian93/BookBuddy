/**
 * API service for communicating with the backend.
 * Uses the Fetch API to make requests to the backend API.
 */

// API configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Helper to check if we're in development mode to use mock data
const isDevelopment = process.env.NODE_ENV === 'development';

// Helper to handle authentication
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Generic fetch wrapper with error handling
const fetchApi = async (endpoint, options = {}) => {
  // Add auth header if available
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };
  
  // Prepare request options
  const requestOptions = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, requestOptions);
    
    // Handle non-success responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API error: ${response.status}`);
    }
    
    // Check if response is empty
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authentication API
export const authApi = {
  login: async (email, password) => {
    // For development, provide mock login
    if (isDevelopment) {
      // Return fake token based on role
      const mockUsers = {
        'admin@library.com': { role: 'librarian', id: 1 },
        'john@example.com': { role: 'student', id: 2 },
      };
      
      const user = mockUsers[email];
      if (user) {
        // Store in localStorage to simulate real auth flow
        const token = `fake_token_${user.role}_${user.id}`;
        localStorage.setItem('accessToken', token);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userId', user.id);
        
        return { access_token: token, token_type: 'bearer' };
      }
      
      throw new Error('Invalid email or password');
    }
    
    // Real API call
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    return fetchApi('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
  },
  
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  },
  
  getCurrentUser: async () => {
    // For development, return mock user based on stored userId
    if (isDevelopment) {
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');
      
      if (userId && userRole) {
        // Mock user data
        if (userRole === 'librarian') {
          return {
            id: 1,
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@library.com',
            role: 'librarian',
            joinDate: new Date(2022, 0, 10),
            avatar: 'https://via.placeholder.com/150?text=Admin',
          };
        } else {
          return {
            id: 2,
            firstName: 'John',
            lastName: 'Smith',
            email: 'john@example.com',
            role: 'student',
            studentId: 'ST-2023-001',
            department: 'Computer Science',
            joinDate: new Date(2023, 8, 5),
            avatar: 'https://via.placeholder.com/150?text=John',
          };
        }
      }
      
      throw new Error('Not authenticated');
    }
    
    // Real API call
    return fetchApi('/auth/test-token');
  },
};

// Books API
export const booksApi = {
  getAll: async () => {
    // For development, return mock data
    if (isDevelopment) {
      // Return mock books from data file
      return import('../data/books').then(module => module.books);
    }
    
    // Real API call
    return fetchApi('/books');
  },
  
  getById: async (id) => {
    if (isDevelopment) {
      return import('../data/books').then(module => {
        const book = module.getBookById(id);
        if (!book) throw new Error('Book not found');
        return book;
      });
    }
    
    return fetchApi(`/books/${id}`);
  },
  
  getBorrowedByUser: async (userId) => {
    if (isDevelopment) {
      return import('../data/books').then(module => {
        return module.getBorrowedBooksByUser(userId);
      });
    }
    
    return fetchApi(`/users/${userId}/borrowed-books`);
  },
  
  addBook: async (bookData) => {
    if (isDevelopment) {
      console.log('Adding book (mock):', bookData);
      return { ...bookData, id: Date.now() };
    }
    
    return fetchApi('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  },
  
  updateBook: async (id, bookData) => {
    if (isDevelopment) {
      console.log('Updating book (mock):', id, bookData);
      return { id, ...bookData };
    }
    
    return fetchApi(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    });
  },
  
  deleteBook: async (id) => {
    if (isDevelopment) {
      console.log('Deleting book (mock):', id);
      return { success: true };
    }
    
    return fetchApi(`/books/${id}`, {
      method: 'DELETE',
    });
  },
  
  borrowBook: async (bookId, userId) => {
    if (isDevelopment) {
      console.log('Borrowing book (mock):', bookId, userId);
      return {
        id: Date.now(),
        bookId,
        userId,
        borrowDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        status: 'borrowed',
      };
    }
    
    return fetchApi('/borrowed-books', {
      method: 'POST',
      body: JSON.stringify({ bookId, userId }),
    });
  },
  
  returnBook: async (borrowId) => {
    if (isDevelopment) {
      console.log('Returning book (mock):', borrowId);
      return { success: true };
    }
    
    return fetchApi(`/borrowed-books/${borrowId}/return`, {
      method: 'POST',
    });
  },
};

// Users API
export const usersApi = {
  getAll: async () => {
    if (isDevelopment) {
      return import('../data/users').then(module => module.users);
    }
    
    return fetchApi('/users');
  },
  
  getById: async (id) => {
    if (isDevelopment) {
      return import('../data/users').then(module => {
        const user = module.getUserById(id);
        if (!user) throw new Error('User not found');
        return user;
      });
    }
    
    return fetchApi(`/users/${id}`);
  },
  
  addUser: async (userData) => {
    if (isDevelopment) {
      console.log('Adding user (mock):', userData);
      return { ...userData, id: Date.now() };
    }
    
    return fetchApi('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  updateUser: async (id, userData) => {
    if (isDevelopment) {
      console.log('Updating user (mock):', id, userData);
      return { id, ...userData };
    }
    
    return fetchApi(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
  
  deleteUser: async (id) => {
    if (isDevelopment) {
      console.log('Deleting user (mock):', id);
      return { success: true };
    }
    
    return fetchApi(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// Recommendations API
export const recommendationsApi = {
  getForUser: async (userId) => {
    if (isDevelopment) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock recommendation response
      return {
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
    }
    
    return fetchApi(`/recommendations/users/${userId}`);
  },
  
  getSimilarBooks: async (bookId, limit = 5) => {
    if (isDevelopment) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock similar books
      const mockBooks = await import('../data/books').then(module => module.books);
      
      // Exclude the source book
      const filteredBooks = mockBooks.filter(book => book.id !== parseInt(bookId));
      
      // Take random subset
      const shuffled = filteredBooks.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, limit).map(book => ({
        ...book,
        similarity_score: Math.random().toFixed(2),
      }));
    }
    
    return fetchApi(`/recommendations/books/${bookId}/similar?limit=${limit}`);
  },
};

// Export default object with all APIs
export default {
  auth: authApi,
  books: booksApi,
  users: usersApi,
  recommendations: recommendationsApi,
};