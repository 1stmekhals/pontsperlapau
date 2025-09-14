import React, { useState, useEffect } from 'react';
import { X, Save, BookOpen, User, Calendar } from 'lucide-react';
import { Book } from '../types/Library';
import { useUsers } from '../contexts/UserContext';

interface BorrowBookModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onSave: (borrowData: {
    bookId: string;
    userId: string;
    borrowDate: string;
    dueDate: string;
    notes?: string;
  }) => Promise<void>;
}

export default function BorrowBookModal({ 
  isOpen, 
  book, 
  onClose, 
  onSave 
}: BorrowBookModalProps) {
  const { users } = useUsers();
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [borrowDate, setBorrowDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Filter approved users who can borrow books
  const eligibleUsers = users.filter(user => 
    user.status === 'approved' && ['student', 'staff', 'visitor'].includes(user.role)
  );

  useEffect(() => {
    if (isOpen) {
      // Set default dates
      const today = new Date();
      setBorrowDate(today.toISOString().split('T')[0]);
      
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 14); // 2 weeks default
      setDueDate(defaultDueDate.toISOString().split('T')[0]);
      
      // Reset other fields
      setSelectedUserId('');
      setNotes('');
    }
  }, [isOpen]);

  if (!isOpen || !book) return null;

  const handleSave = async () => {
    if (!selectedUserId) {
      alert('Please select a user');
      return;
    }

    if (!borrowDate || !dueDate) {
      alert('Please select borrow and due dates');
      return;
    }

    if (new Date(dueDate) <= new Date(borrowDate)) {
      alert('Due date must be after borrow date');
      return;
    }
    
    setLoading(true);
    try {
      await onSave({
        bookId: book.id,
        userId: selectedUserId,
        borrowDate,
        dueDate,
        notes
      });
      onClose();
    } catch (error) {
      console.error('Error lending book:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = eligibleUsers.find(user => user.id === selectedUserId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Lend Book
              </h2>
              <p className="text-gray-600">Lend "{book.title}" to a user</p>
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

          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Select User *
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Choose a user...</option>
              {eligibleUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.lastName} ({user.role}) - {user.email}
                </option>
              ))}
            </select>
          </div>

          {/* Selected User Info */}
          {selectedUser && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Selected User</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-700">Name:</span>
                  <p className="text-blue-900">{selectedUser.name} {selectedUser.lastName}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Role:</span>
                  <p className="text-blue-900 capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Email:</span>
                  <p className="text-blue-900">{selectedUser.email}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Phone:</span>
                  <p className="text-blue-900">{selectedUser.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Borrow Date *
              </label>
              <input
                type="date"
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={borrowDate || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          {/* Loan Period Info */}
          {borrowDate && dueDate && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Loan Period</h4>
              <p className="text-sm text-green-700">
                Duration: {Math.ceil((new Date(dueDate).getTime() - new Date(borrowDate).getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
              <p className="text-sm text-green-700">
                From {new Date(borrowDate).toLocaleDateString()} to {new Date(dueDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this loan..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              disabled={loading || !selectedUserId || !borrowDate || !dueDate || book.availableCopies <= 0}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Processing...' : 'Lend Book'}</span>
            </button>
          </div>

          {book.availableCopies <= 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">
                This book is currently not available for lending. All copies are already borrowed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}