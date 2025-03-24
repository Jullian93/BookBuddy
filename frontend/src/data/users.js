export const users = [
    {
      id: 1,
      firstName: "Admin",
      lastName: "User",
      email: "admin@library.com",
      password: "admin123",
      role: "librarian",
      joinDate: new Date(2022, 0, 10),
      avatar: "https://via.placeholder.com/150?text=Admin"
    },
    {
      id: 2,
      firstName: "John",
      lastName: "Smith",
      email: "john@example.com",
      password: "john123",
      role: "student",
      studentId: "ST-2023-001",
      department: "Computer Science",
      joinDate: new Date(2023, 8, 5),
      avatar: "https://via.placeholder.com/150?text=John"
    },
    {
      id: 3,
      firstName: "Emma",
      lastName: "Davis",
      email: "emma@example.com",
      password: "emma123",
      role: "student",
      studentId: "ST-2023-002",
      department: "Literature",
      joinDate: new Date(2023, 7, 20),
      avatar: "https://via.placeholder.com/150?text=Emma"
    },
    {
      id: 4,
      firstName: "Michael",
      lastName: "Johnson",
      email: "michael@example.com",
      password: "michael123",
      role: "student",
      studentId: "ST-2022-015",
      department: "Physics",
      joinDate: new Date(2022, 9, 12),
      avatar: "https://via.placeholder.com/150?text=Michael"
    },
    {
      id: 5,
      firstName: "Sarah",
      lastName: "Wilson",
      email: "sarah@library.com",
      password: "sarah123",
      role: "librarian",
      joinDate: new Date(2023, 2, 15),
      avatar: "https://via.placeholder.com/150?text=Sarah"
    }
  ];
  
  // Helper function to get all students
  export const getStudents = () => {
    return users.filter(user => user.role === 'student');
  };
  
  // Helper function to get all librarians
  export const getLibrarians = () => {
    return users.filter(user => user.role === 'librarian');
  };
  
  // Helper function to get user by ID
  export const getUserById = (userId) => {
    return users.find(user => user.id === parseInt(userId));
  };