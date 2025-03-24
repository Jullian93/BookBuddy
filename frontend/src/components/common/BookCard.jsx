import React from 'react';
import Button from './Button';

const BookCard = ({ book, onBorrow, onReturn, onViewDetails, isBorrowed = false, showActions = true }) => {
  const { id, title, author, coverImage, genre, publicationYear, copiesAvailable, copies } = book;

  const isAvailable = copiesAvailable > 0;
  
  return (
    <div className="card h-full flex flex-col transition-transform duration-300 hover:shadow-lg transform hover:-translate-y-1">
      <div className="relative pb-3/4 h-64 overflow-hidden rounded-t-lg">
        <img
          src={coverImage || `https://via.placeholder.com/300x400?text=${encodeURIComponent(title)}`}
          alt={title}
          className="absolute h-full w-full object-cover"
        />
      </div>
      <div className="flex-1 p-4 flex flex-col">
        <h3 className="font-serif text-lg font-bold mb-1 line-clamp-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-2">by {author}</p>
        
        <div className="text-xs text-gray-500 mb-4 flex-grow">
          <div className="flex items-center mb-1">
            <span className="font-medium mr-2">Genre:</span> {genre}
          </div>
          <div className="flex items-center mb-1">
            <span className="font-medium mr-2">Year:</span> {publicationYear}
          </div>
          {copies && (
            <div className="flex items-center">
              <span className="font-medium mr-2">Status:</span>
              {isAvailable ? (
                <span className="text-green-600">{copiesAvailable} of {copies} available</span>
              ) : (
                <span className="text-red-600">Currently unavailable</span>
              )}
            </div>
          )}
        </div>
        
        {showActions && (
          <div className="mt-auto space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onViewDetails(id)}
            >
              View Details
            </Button>
            
            {!isBorrowed && (
              <Button
                variant={isAvailable ? 'primary' : 'outline'}
                size="sm"
                className="w-full"
                disabled={!isAvailable}
                onClick={() => onBorrow(id)}
              >
                {isAvailable ? 'Borrow' : 'Unavailable'}
              </Button>
            )}
            
            {isBorrowed && (
              <Button
                variant="success"
                size="sm"
                className="w-full"
                onClick={() => onReturn(id)}
              >
                Return Book
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCard;