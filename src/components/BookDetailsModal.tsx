import React from 'react';
import { X, BookOpen, Calendar, User, Hash, Building } from 'lucide-react';
import { Book } from '../types/Library';

interface BookDetailsModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
}

export default function BookDetailsModal({ isOpen, book, onClose }: BookDetailsModalProps) {
  if (!isOpen || !book) return null;

  const getStatusColor = () => {
    switch (book.status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              {book.coverImage ? (
                <img 
                  src={book.coverImage} 
                  alt={book.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <BookOpen className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {book.title}
              </h2>
              <p className="text-gray-600">by {book.author}</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor()}`}>
                {book.status.toUpperCase()}
              </span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Book Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-600">Author:</span>
                    <p className="text-gray-900">{book.author}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-600">Genre:</span>
                    <p className="text-gray-900">{book.genre}</p>
                  </div>
                </div>

                {book.isbn && (
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-sm font-medium text-gray-600">ISBN:</span>
                      <p className="text-gray-900 font-mono">{book.isbn}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {book.publisher && (
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-sm font-medium text-gray-600">Publisher:</span>
                      <p className="text-gray-900">{book.publisher}</p>
                    </div>
                  </div>
                )}

                {book.publishedYear && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-sm font-medium text-gray-600">Published Year:</span>
                      <p className="text-gray-900">{book.publishedYear}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-600">Copies:</span>
                    <p className="text-gray-900">{book.availableCopies} of {book.totalCopies} available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{book.description}</p>
            </div>
          )}

          {/* Availability Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Availability</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-2xl font-bold text-blue-600">{book.totalCopies}</div>
                <div className="text-sm text-gray-600">Total Copies</div>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <div className={`text-2xl font-bold ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {book.availableCopies}
                </div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Book ID:</span>
                <p className="text-gray-900 font-mono">{book.id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <p className="text-gray-900 capitalize">{book.status}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Added:</span>
                <p className="text-gray-900">{new Date(book.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Last Updated:</span>
                <p className="text-gray-900">{new Date(book.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}