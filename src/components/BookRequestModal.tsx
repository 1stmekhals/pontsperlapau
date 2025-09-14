import React, { useState, useEffect } from 'react';
import { X, Save, BookOpen, Calendar, MessageSquare } from 'lucide-react';
import { Book } from '../types/Library';

interface BookRequestModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onSave: (requestData: {
    bookId: string;
    requestedDueDate: string;
    notes?: string;
  }) => Promise<void>;
}

export default function BookRequestModal({ 
  isOpen, 
  book, 
  onClose, 
  onSave 
}: BookRequestModalProps) {
  const [loading, setLoading] = useState(false);
  const [requestedDueDate, setRequestedDueDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Set default due date to 14 days from today
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      setRequestedDueDate(dueDate.toISOString().split('T')[0]);
      
      // Reset notes
      setNotes('');
    }
  }, [isOpen]);

  if (!isOpen || !book) return null;

  const handleSave = async () => {
    if (!requestedDueDate) {
      alert('Please select a requested due date');
      return;
    }

    if (new Date(requestedDueDate) <= new Date()) {
      alert('Due date must be in the future');
      return;
    }
    
    setLoading(true);
    try {
      await onSave({
        bookId: book.id,
        requestedDueDate,
        notes
      });
      onClose();
    } catch (error) {
      console.error('Error creating book request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Request Book
              </h2>
              <p className="text-gray-600">Request to borrow "{book.title}"</p>
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
          {/* Book Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Book Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Title:</span>
                <p className="text-gray-900">{book.title}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Author:</span>
                <p className="text-gray-900">{book.author}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Available Copies:</span>
                <p className="text-gray-900">{book.availableCopies} of {book.totalCopies}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Genre:</span>
                <p className="text-gray-900">{book.genre}</p>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Requested Due Date *
            </label>
            <input
              type="date"
              value={requestedDueDate}
              onChange={(e) => setRequestedDueDate(e.target.value)}
              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Tomorrow
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Select when you would like to return the book
            </p>
          </div>

          {/* Loan Period Info */}
          {requestedDueDate && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Requested Loan Period</h4>
              <p className="text-sm text-blue-700">
                Duration: {Math.ceil((new Date(requestedDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
              <p className="text-sm text-blue-700">
                From today to {new Date(requestedDueDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes for your request..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !requestedDueDate || book.availableCopies <= 0}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Requesting...' : 'Send Request'}</span>
            </button>
          </div>

          {book.availableCopies <= 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">
                This book is currently not available for borrowing. All copies are already borrowed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}