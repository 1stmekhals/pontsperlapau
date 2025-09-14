import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import BookCard from '../../components/BookCard';
import ConfirmDialog from '../../components/ConfirmDialog';
import BookFormModal from '../../components/BookFormModal';
import BorrowBookModal from '../../components/BorrowBookModal';
import BorrowLogsModal from '../../components/BorrowLogsModal';
import BookDetailsModal from '../../components/BookDetailsModal';
import BookRequestsModal from '../../components/BookRequestsModal';
import { useLibrary } from '../../contexts/LibraryContext';
import { useBookRequests } from '../../contexts/BookRequestContext';
import { useToast } from '../../contexts/ToastContext';
import { BookOpen, Plus, Search, Filter, List, Users, History, MessageSquare } from 'lucide-react';
import { Book } from '../../types/Library';

export default function Library() {
  const { books, fetchBooks, deleteBook, addBook, updateBook, borrowBook, loading } = useLibrary();
  const { pendingRequests, fetchPendingRequests } = useBookRequests();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [showBookFormModal, setShowBookFormModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState<Book | null>(null);
  const [selectedBookForEdit, setSelectedBookForEdit] = useState<Book | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBookForDetails, setSelectedBookForDetails] = useState<Book | null>(null);
  const [showBorrowLogsModal, setShowBorrowLogsModal] = useState(false);
  const [showBookRequestsModal, setShowBookRequestsModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    bookId: string;
    bookTitle: string;
  }>({
    isOpen: false,
    bookId: '',
    bookTitle: ''
  });

  useEffect(() => {
    fetchBooks();
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const genres = [...new Set(books.map(book => book.genre))];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.genre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !selectedGenre || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const handleDelete = async (bookId: string) => {
    try {
      await deleteBook(bookId);
      showToast('Book deleted successfully!', 'success');
      setConfirmDialog({ isOpen: false, bookId: '', bookTitle: '' });
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete book', 'error');
    }
  };

  const openConfirmDialog = (bookId: string, bookTitle: string) => {
    setConfirmDialog({
      isOpen: true,
      bookId,
      bookTitle
    });
  };

  const handleAddBook = async (bookData: Partial<Book>) => {
    try {
      console.log('📚 Library.handleAddBook - Starting with data:', bookData);
      await addBook(bookData);
      showToast('Book added successfully!', 'success');
      setShowBookFormModal(false);
      setSelectedBookForEdit(null);
    } catch (error) {
      console.error('❌ Library.handleAddBook - Error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to add book', 'error');
      throw error;
    }
  };

  const handleUpdateBook = async (bookId: string, bookData: Partial<Book>) => {
    try {
      console.log('📚 Library.handleUpdateBook - Starting with data:', bookData);
      console.log('📚 Library.handleUpdateBook - Available copies value:', bookData.availableCopies, 'Type:', typeof bookData.availableCopies);
      await updateBook(bookId, bookData);
      showToast('Book updated successfully!', 'success');
      setShowBookFormModal(false);
      setSelectedBookForEdit(null);
      // Force refresh the book details if modal is open
      if (selectedBookForDetails && selectedBookForDetails.id === bookId) {
        // Update the selected book with the new data
        setSelectedBookForDetails(prev => prev ? { ...prev, ...bookData } : null);
      }
    } catch (error) {
      console.error('❌ Library.handleUpdateBook - Error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to update book', 'error');
      throw error;
    }
  };

  const handleBorrowBook = async (borrowData: {
    bookId: string;
    userId: string;
    borrowDate: string;
    dueDate: string;
    notes?: string;
  }) => {
    try {
      await borrowBook(borrowData.bookId, borrowData.userId, borrowData.borrowDate, borrowData.dueDate, borrowData.notes);
      showToast('Book lent successfully!', 'success');
      setShowBorrowModal(false);
      setSelectedBookForBorrow(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to lend book', 'error');
      throw error;
    }
  };

  const handleLendBook = (book: Book) => {
    setSelectedBookForBorrow(book);
    setShowBorrowModal(true);
  };

  const handleEditBook = (book: Book) => {
    console.log('📝 Library.handleEditBook - Editing book:', book);
    setSelectedBookForEdit(book);
    setShowBookFormModal(true);
  };

  const handleViewDetails = (book: Book) => {
    setSelectedBookForDetails(book);
    setShowDetailsModal(true);
  };

  return (
    <Layout title="Library Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Library Management</h1>
            <p className="text-gray-600">Manage books, borrowing, and library resources</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => {
                setSelectedBookForEdit(null);
                setShowBookFormModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Book</span>
            </button>
            <button 
              onClick={() => setShowBorrowLogsModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <History className="w-4 h-4" />
              <span>Borrow Logs</span>
            </button>
            <button 
              onClick={() => setShowBookRequestsModal(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Requests ({pendingRequests.length})</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Books</p>
                <p className="text-2xl font-bold text-gray-900">{books.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600 bg-blue-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {books.filter(b => b.availableCopies > 0).length}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-green-600 bg-green-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Borrowed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {books.reduce((sum, book) => {
                    // Get total copies (default to 1 if not set)
                    const totalCopies = book.totalCopies !== undefined ? book.totalCopies : (book.total_copies !== undefined ? book.total_copies : 1);
                    // Get available copies (should equal total if no books are borrowed)
                    const availableCopies = book.availableCopies !== undefined ? book.availableCopies : (book.available_copies !== undefined ? book.available_copies : totalCopies);
                    // Calculate borrowed (only if available is less than total)
                    const borrowed = availableCopies < totalCopies ? totalCopies - availableCopies : 0;
                    return sum + borrowed;
                  }, 0)}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-orange-600 bg-orange-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Genres</p>
                <p className="text-2xl font-bold text-gray-900">{genres.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600 bg-purple-100 rounded-lg p-2" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search books by title, author, or genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
            {filteredBooks.length} Books
          </div>
        </div>

        {/* Books Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Library Collection</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    showActions={true}
                    userRole="admin"
                    onViewDetails={handleViewDetails}
                    onBorrow={handleLendBook}
                    onBorrow={(book) => handleLendBook(book)}
                    onEdit={handleEditBook}
                    onDelete={(bookId) => {
                      const book = books.find(b => b.id === bookId);
                      if (book) {
                        openConfirmDialog(bookId, book.title);
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || selectedGenre ? 'No books found' : 'No books in library'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || selectedGenre 
                    ? 'Try adjusting your search criteria or filters.'
                    : 'Add books to get started with your library collection.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title="Delete Book"
          message={`Are you sure you want to delete "${confirmDialog.bookTitle}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          onConfirm={() => handleDelete(confirmDialog.bookId)}
          onCancel={() => setConfirmDialog({ isOpen: false, bookId: '', bookTitle: '' })}
        />

        {/* Add Book Modal */}
        <BookFormModal
          isOpen={showBookFormModal}
          onClose={() => {
            setShowBookFormModal(false);
            setSelectedBookForEdit(null);
          }}
          bookToEdit={selectedBookForEdit}
          onAdd={handleAddBook}
          onUpdate={handleUpdateBook}
        />

        {/* Borrow Book Modal */}
        <BorrowBookModal
          isOpen={showBorrowModal}
          book={selectedBookForBorrow}
          onClose={() => {
            setShowBorrowModal(false);
            setSelectedBookForBorrow(null);
          }}
          onSave={handleBorrowBook}
        />

        {/* Book Details Modal */}
        <BookDetailsModal
          isOpen={showDetailsModal}
          book={selectedBookForDetails}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBookForDetails(null);
          }}
        />

        {/* Borrow Logs Modal */}
        <BorrowLogsModal
          isOpen={showBorrowLogsModal}
          onClose={() => setShowBorrowLogsModal(false)}
        />

        {/* Book Requests Modal */}
        <BookRequestsModal
          isOpen={showBookRequestsModal}
          onClose={() => setShowBookRequestsModal(false)}
          userRole="admin"
        />
      </div>
    </Layout>
  );
}