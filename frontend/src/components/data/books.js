export const books = [
    {
      id: 1,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      isbn: "9780061120084",
      genre: "Fiction",
      publicationYear: 1960,
      publisher: "HarperCollins",
      coverImage: "https://via.placeholder.com/150x200?text=To+Kill+a+Mockingbird",
      available: true,
      copies: 5,
      copiesAvailable: 3,
      description: "To Kill a Mockingbird is a novel by Harper Lee published in 1960. It was immediately successful, winning the Pulitzer Prize, and has become a classic of modern American literature."
    },
    {
      id: 2,
      title: "1984",
      author: "George Orwell",
      isbn: "9780451524935",
      genre: "Dystopian",
      publicationYear: 1949,
      publisher: "Penguin Books",
      coverImage: "https://via.placeholder.com/150x200?text=1984",
      available: true,
      copies: 3,
      copiesAvailable: 2,
      description: "1984 is a dystopian novel by George Orwell published in 1949. The novel is set in Airstrip One, a province of the superstate Oceania in a world of perpetual war, omnipresent government surveillance, and public manipulation."
    },
    {
      id: 3,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      isbn: "9780141439518",
      genre: "Classic",
      publicationYear: 1813,
      publisher: "Penguin Classics",
      coverImage: "https://via.placeholder.com/150x200?text=Pride+and+Prejudice",
      available: true,
      copies: 4,
      copiesAvailable: 4,
      description: "Pride and Prejudice is a romantic novel by Jane Austen, first published in 1813. The story follows the main character Elizabeth Bennet as she deals with issues of manners, upbringing, morality, education, and marriage."
    },
    {
      id: 4,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "9780743273565",
      genre: "Fiction",
      publicationYear: 1925,
      publisher: "Scribner",
      coverImage: "https://via.placeholder.com/150x200?text=The+Great+Gatsby",
      available: true,
      copies: 2,
      copiesAvailable: 0,
      description: "The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, the novel depicts first-person narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby."
    },
    {
      id: 5,
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      isbn: "9780316769488",
      genre: "Fiction",
      publicationYear: 1951,
      publisher: "Little, Brown and Company",
      coverImage: "https://via.placeholder.com/150x200?text=The+Catcher+in+the+Rye",
      available: true,
      copies: 3,
      copiesAvailable: 3,
      description: "The Catcher in the Rye is a novel by J. D. Salinger, partially published in serial form in 1945–1946 and as a novel in 1951. It was originally intended for adults but is often read by adolescents for its themes of angst, alienation, and as a critique on superficiality in society."
    },
    {
      id: 6,
      title: "One Hundred Years of Solitude",
      author: "Gabriel García Márquez",
      isbn: "9780060883287",
      genre: "Magical Realism",
      publicationYear: 1967,
      publisher: "Harper & Row",
      coverImage: "https://via.placeholder.com/150x200?text=One+Hundred+Years+of+Solitude",
      available: true,
      copies: 2,
      copiesAvailable: 1,
      description: "One Hundred Years of Solitude is a landmark 1967 novel by Colombian author Gabriel García Márquez that tells the multi-generational story of the Buendía family, whose patriarch, José Arcadio Buendía, founded the town of Macondo."
    },
    {
      id: 7,
      title: "Brave New World",
      author: "Aldous Huxley",
      isbn: "9780060850524",
      genre: "Dystopian",
      publicationYear: 1932,
      publisher: "Harper Perennial",
      coverImage: "https://via.placeholder.com/150x200?text=Brave+New+World",
      available: true,
      copies: 4,
      copiesAvailable: 2,
      description: "Brave New World is a dystopian novel by English author Aldous Huxley, written in 1931 and published in 1932. Largely set in a futuristic World State, inhabited by genetically modified citizens and an intelligence-based social hierarchy."
    },
    {
      id: 8,
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      isbn: "9780547928227",
      genre: "Fantasy",
      publicationYear: 1937,
      publisher: "Houghton Mifflin Harcourt",
      coverImage: "https://via.placeholder.com/150x200?text=The+Hobbit",
      available: true,
      copies: 5,
      copiesAvailable: 3,
      description: "The Hobbit, or There and Back Again is a children's fantasy novel by English author J. R. R. Tolkien. It was published on 21 September 1937 to wide critical acclaim, being nominated for the Carnegie Medal and awarded a prize from the New York Herald Tribune for best juvenile fiction."
    }
  ];
  
  // Simulate borrowed books
  export const borrowedBooks = [
    {
      id: 1,
      bookId: 2,
      userId: 2,
      borrowDate: new Date(2024, 2, 10),
      dueDate: new Date(2024, 3, 10),
      returnDate: null,
      status: "borrowed"
    },
    {
      id: 2,
      bookId: 4,
      userId: 2,
      borrowDate: new Date(2024, 2, 5),
      dueDate: new Date(2024, 3, 5),
      returnDate: null,
      status: "borrowed"
    },
    {
      id: 3,
      bookId: 4,
      userId: 3,
      borrowDate: new Date(2024, 1, 25),
      dueDate: new Date(2024, 2, 25),
      returnDate: null,
      status: "overdue"
    },
    {
      id: 4,
      bookId: 7,
      userId: 3,
      borrowDate: new Date(2024, 2, 1),
      dueDate: new Date(2024, 3, 1),
      returnDate: null,
      status: "borrowed"
    },
    {
      id: 5,
      bookId: 6,
      userId: 2,
      borrowDate: new Date(2024, 1, 15),
      dueDate: new Date(2024, 2, 15),
      returnDate: new Date(2024, 2, 14),
      status: "returned"
    }
  ];
  
  // Helper functions for book management
  export const getBookById = (bookId) => {
    return books.find(book => book.id === parseInt(bookId));
  };
  
  export const getBorrowedBooksByUser = (userId) => {
    return borrowedBooks
      .filter(item => item.userId === userId && item.returnDate === null)
      .map(item => {
        const book = getBookById(item.bookId);
        return {
          ...item,
          book
        };
      });
  };
  
  export const getBorrowHistory = (userId) => {
    return borrowedBooks
      .filter(item => item.userId === userId)
      .map(item => {
        const book = getBookById(item.bookId);
        return {
          ...item,
          book
        };
      });
  };