import React, { useState, useEffect } from 'react';
import { Book } from '../types/Library';
import { X, Save, BookOpen } from 'lucide-react';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookToEdit?: Book | null;
  onAdd?: (bookData: Partial<Book>) => Promise<void>;
  onUpdate?: (bookId: string, bookData: Partial<Book>) => Promise<void>;
}

export default function BookFormModal({ 
  isOpen, 
  onClose, 
  bookToEdit,
  onAdd,
  onUpdate
}: BookFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Book>>({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    publisher: '',
    publishedYear: undefined,
    totalCopies: 1,
    availableCopies: 1,
    description: '',
    coverImage: '',
    status: 'available'
  });

  const isEditing = !!bookToEdit;

  // Initialize form data when modal opens or bookToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (bookToEdit) {
        // Editing existing book
        setFormData({
          title: bookToEdit.title || '',
          author: bookToEdit.author || '',
          isbn: bookToEdit.isbn || '',
          genre: bookToEdit.genre || '',
          publisher: bookToEdit.publisher || '',
          publishedYear: bookToEdit.publishedYear,
          totalCopies: bookToEdit.totalCopies || 1,
          availableCopies: bookToEdit.availableCopies || 1,
          description: bookToEdit.description || '',
          coverImage: bookToEdit.coverImage || '',
          status: bookToEdit.status || 'available'
        });
      } else {
        // Adding new book
        setFormData({
          title: '',
          author: '',
          isbn: '',
          genre: '',
          publisher: '',
          publishedYear: undefined,
          totalCopies: 1,
          availableCopies: 1,
          description: '',
          coverImage: '',
          status: 'available'
        });
      }
    }
  }, [isOpen, bookToEdit]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!formData.title || !formData.author || !formData.genre) {
      alert('Please fill in required fields: Title, Author, and Genre');
      return;
    }
    
    console.log('💾 BookFormModal.handleSave - Form data before save:', formData);
    
    setLoading(true);
    try {
      if (isEditing && bookToEdit && onUpdate) {
        console.log('📚 BookFormModal.handleSave - Updating book:', formData);
        await onUpdate(bookToEdit.id, formData);
        console.log('✅ BookFormModal.handleSave - Book updated successfully');
      } else if (!isEditing && onAdd) {
        console.log('📚 BookFormModal.handleSave - Adding book:', formData);
        await onAdd(formData);
        console.log('✅ BookFormModal.handleSave - Book added successfully');
      }
      onClose();
    } catch (error) {
      console.error('❌ BookFormModal.handleSave - Error:', error);
      // Don't close modal on error, let user try again
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
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
                {isEditing ? 'Edit Book' : 'Add New Book'}
              </h2>
              <p className="text-gray-600">
                {isEditing ? 'Update book information' : 'Add a new book to the library'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCancel}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Book Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author *
                </label>
                <input
                  type="text"
                  required
                  value={formData.author || ''}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Genre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.genre || ''}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  placeholder="e.g., Fiction, Science, History"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  value={formData.isbn || ''}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publisher
                </label>
                <input
                  type="text"
                  value={formData.publisher || ''}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Published Year
                </label>
                <input
                  type="number"
                  min="1000"
                  max={new Date().getFullYear()}
                  value={formData.publishedYear || ''}
                  onChange={(e) => setFormData({ ...formData, publishedYear: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Copies
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalCopies || ''}
                  onChange={(e) => {
                    const newTotal = e.target.value === '' ? 1 : parseInt(e.target.value) || 1;
                    setFormData({ 
                      ...formData, 
                      totalCopies: newTotal,
                      availableCopies: isEditing ? Math.min(formData.availableCopies || 0, newTotal) : newTotal
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Copies
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.totalCopies || 1}
                    value={formData.availableCopies || ''}
                    onChange={(e) => {
                      const newAvailable = e.target.value === '' ? 0 : Math.min(formData.totalCopies || 1, Math.max(0, parseInt(e.target.value) || 0));
                      setFormData({ ...formData, availableCopies: newAvailable });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status || 'available'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image URL
              </label>
              <input
                type="url"
                value={formData.coverImage || ''}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                placeholder="https://example.com/book-cover.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the book..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}