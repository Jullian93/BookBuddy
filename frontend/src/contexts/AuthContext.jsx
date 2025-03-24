import React, { createContext, useState, useContext, useEffect } from 'react';
import { users } from '../data/users';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in from local storage
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      // Simulate API call with timeout
      setTimeout(() => {
        const user = users.find(
          u => u.email === email && u.password === password
        );
        
        if (user) {
          // Remove password before storing
          const { password, ...userWithoutPassword } = user;
          setCurrentUser(userWithoutPassword);
          localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
          resolve(userWithoutPassword);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 500);
    });
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    currentUser,
    login,
    logout,
    isLibrarian: currentUser?.role === 'librarian',
    isStudent: currentUser?.role === 'student',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}