import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import BookCard from '../common/BookCard';

const RecommendationModal = ({ 
  isOpen, 
  onClose, 
  user,
  onGetRecommendations,
  recommendations,
  isLoading
}) => {
  if (!isOpen) return null;
  
  const { recommendations: recommendedBooks = [], explanation = '' } = recommendations || {};
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Book Recommendations</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={user.avatar || `https://via.placeholder.com/40?text=${encodeURIComponent(user.firstName[0])}`}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Recommendations for {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.role === 'student' ? `${user.department} Department` : 'Library Staff'}
                      </div>
                    </div>
                  </div>
                  
                  {!recommendations && !isLoading && (
                    <div className="text-center mb-6">
                      <Button
                        variant="primary"
                        onClick={() => onGetRecommendations(user.id)}
                        isLoading={isLoading}
                      >
                        Generate Recommendations
                      </Button>
                    </div>
                  )}
                  
                  {isLoading && (
                    <div className="flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                      <p className="ml-3 text-gray-700">Generating personalized recommendations...</p>
                    </div>
                  )}
                  
                  {recommendations && !isLoading && (
                    <div className="mt-2">
                      <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <p className="text-blue-700">{explanation}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {recommendedBooks.map((book) => (
                          <div key={book.id} className="flex flex-col h-full">
                            <BookCard
                              book={book}
                              onViewDetails={() => {}}
                              showActions={false}
                            />
                            <div className="mt-4 bg-gray-50 p-3 rounded text-sm text-gray-700">
                              <strong>Why recommended:</strong> {book.recommendation_reason}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 text-center">
                        <Button
                          variant="outline"
                          onClick={() => onGetRecommendations(user.id)}
                          isLoading={isLoading}
                        >
                          Regenerate Recommendations
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationModal;