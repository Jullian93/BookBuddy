import React, { useState } from 'react';
import Button from '../common/Button';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({ searchTerm, filter });
  };

  return (
    <div className="bg-white p-4 shadow rounded-lg">
      <form onSubmit={handleSearch}>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-grow">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-3 py-2 border-gray-300 rounded-md"
                placeholder="Search books by title, author, genre, or ISBN"
              />
            </div>
          </div>
          
          <div className="flex-shrink-0 w-full md:w-auto">
            <label htmlFor="filter" className="sr-only">
              Filter
            </label>
            <select
              id="filter"
              name="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="focus:ring-primary-500 focus:border-primary-500 block w-full py-2 pl-3 pr-10 border-gray-300 rounded-md"
            >
              <option value="all">All Categories</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="genre">Genre</option>
              <option value="isbn">ISBN</option>
              <option value="available">Available Only</option>
            </select>
          </div>
          
          <Button type="submit" variant="primary" className="md:w-auto w-full">
            Search
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;