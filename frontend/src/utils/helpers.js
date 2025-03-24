// Format date to readable string
export const formatDate = (date) => {
    if (!date) return 'N/A';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };
  
  // Check if date is in the past
  export const isOverdue = (date) => {
    if (!date) return false;
    const today = new Date();
    return new Date(date) < today;
  };
  
  // Calculate days remaining or overdue
  export const calculateDaysRemaining = (dueDate) => {
    if (!dueDate) return 0;
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Format book status with color
  export const getStatusDisplay = (status) => {
    switch (status) {
      case 'borrowed':
        return { text: 'Borrowed', color: 'bg-blue-100 text-blue-800' };
      case 'overdue':
        return { text: 'Overdue', color: 'bg-red-100 text-red-800' };
      case 'reserved':
        return { text: 'Reserved', color: 'bg-yellow-100 text-yellow-800' };
      case 'returned':
        return { text: 'Returned', color: 'bg-green-100 text-green-800' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };
  
  // Filter books by search term (title, author, genre)
  export const filterBooks = (books, searchTerm) => {
    if (!searchTerm) return books;
    
    const term = searchTerm.toLowerCase();
    return books.filter(book => 
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term) ||
      book.genre.toLowerCase().includes(term) ||
      book.isbn.includes(term)
    );
  };
  
  // Sort books by field
  export const sortBooks = (books, field, direction = 'asc') => {
    const sortedBooks = [...books];
    
    sortedBooks.sort((a, b) => {
      let valueA = a[field];
      let valueB = b[field];
      
      // Handle string comparison
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      // Compare the values
      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sortedBooks;
  };
  
  // Format currency
  export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };