import React from 'react';
import { BookOpen, Edit, Trash2, Eye, Users } from 'lucide-react';
import { Book } from '../types/Library';

interface BookCardProps {
  book: Book;
  showActions?: boolean;
  userRole: 'admin' | 'staff' | 'student' | 'visitor';
  onViewDetails?: (book: Book) => void;
  onBorrow?: (book: Book) => void;
  onEdit?: (book: Book) => void;
  onDelete?: (bookId: string) => void;
}

export default function BookCard({
  book,
  showActions = false,
  userRole,
  onViewDetails,
  onBorrow,
  onEdit,
  onDelete
}: BookCardProps) {
  const getAvailabilityColor = () => {
    if (book.availableCopies === 0) return 'bg-red-100 text-red-800';
    if (book.availableCopies <= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getAvailabilityText = () => {
    if (book.availableCopies === 0) return 'Not Available';
    if (book.availableCopies === 1) return '1 copy available';
    return `${book.availableCopies} copies available`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            {book.coverImage ? (
              <img 
                src={book.coverImage} 
                alt={book.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <BookOpen className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {book.title}
            </h3>
            <p className="text-sm text-gray-600">
              by {book.author}
            </p>
          </div>
        </div>
        
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor()}`}>
          {getAvailabilityText()}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Genre:</span>
          <span>{book.genre}</span>
        </div>
        
        {book.publisher && (
          <div className="flex items-center justify-between">
            <span className="font-medium">Publisher:</span>
            <span>{book.publisher}</span>
          </div>
        )}
        
        {book.publishedYear && (
          <div className="flex items-center justify-between">
            <span className="font-medium">Year:</span>
            <span>{book.publishedYear}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="font-medium">Total Copies:</span>
          <span>{book.totalCopies}</span>
        </div>
      </div>

      {book.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {book.description}
        </p>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex space-x-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(book)}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
            </button>
          )}
          
          {userRole === 'admin' && onBorrow && (
            <button
              onClick={() => onBorrow(book)}
              disabled={book.availableCopies <= 0}
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
            >
              <Users className="w-4 h-4" />
              <span>Lend</span>
            </button>
          )}
          
          {userRole === 'admin' && onEdit && (
            <button
              onClick={() => onEdit(book)}
              className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
          
          {userRole === 'admin' && onDelete && (
            <button
              onClick={() => onDelete(book.id)}
              className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}