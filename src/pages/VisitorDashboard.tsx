import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useLibrary } from '../contexts/LibraryContext';
import { useBookRequests } from '../contexts/BookRequestContext';
import { useToast } from '../contexts/ToastContext';
import BookRequestModal from '../components/BookRequestModal';
import BookRequestsModal from '../components/BookRequestsModal';
import { BookOpen, Calendar, User, Clock, Plus, Search, MessageSquare } from 'lucide-react';
import { Book } from '../types/Library';

function VisitorLibrary() {
  const { books, fetchBooks, loading } = useLibrary();
  const { createBookRequest } = useBookRequests();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [selectedBookForRequest, setSelectedBookForRequest] = useState<Book | null>(null);

  React.useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRequestBook = (book: Book) => {
    setSelectedBookForRequest(book);
    setShowRequestModal(true);
  };

  const handleSaveRequest = async (requestData: {
    bookId: string;
    requestedDueDate: string;
    notes?: string;
  }) => {
    try {
      await createBookRequest(requestData);
      showToast('Book request sent successfully! Wait for admin approval.', 'success');
      setShowRequestModal(false);
      setSelectedBookForRequest(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to send book request', 'error');
      throw error;
    }
  };

  return (
    <Layout title="Library">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Library</h1>
            <p className="text-gray-600">Browse books and request to borrow</p>
          </div>
          <button 
            onClick={() => setShowRequestsModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>My Requests</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search books by title, author, or genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg text-sm font-medium">
            {filteredBooks.length} Books
          </div>
        </div>

        {/* Books Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Available Books</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : filteredBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <div key={book.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
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
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        book.availableCopies === 0 ? 'bg-red-100 text-red-800' :
                        book.availableCopies <= 2 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {book.availableCopies === 0 ? 'Not Available' :
                         book.availableCopies === 1 ? '1 copy available' :
                         `${book.availableCopies} copies available`}
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
                    </div>

                    {book.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {book.description}
                      </p>
                    )}

                    {/* Request Button */}
                    <button
                      onClick={() => handleRequestBook(book)}
                      disabled={book.availableCopies <= 0}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Request to Borrow</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No books found' : 'No books available'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Try adjusting your search criteria.'
                    : 'No books are currently available in the library.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Book Request Modal */}
        <BookRequestModal
          isOpen={showRequestModal}
          book={selectedBookForRequest}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedBookForRequest(null);
          }}
          onSave={handleSaveRequest}
        />

        {/* Book Requests Modal */}
        <BookRequestsModal
          isOpen={showRequestsModal}
          onClose={() => setShowRequestsModal(false)}
          userRole="visitor"
        />
      </div>
    </Layout>
  );
}

function VisitorDashboardHome() {
  const { user } = useAuth();

  return (
    <Layout title="Visitor Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-purple-100">
            Access our library resources and manage your borrowing activities.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Books Borrowed</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600 bg-purple-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Books Returned</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-600 bg-green-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Membership Status</p>
                <p className="text-lg font-bold text-green-600">Active</p>
              </div>
              <User className="w-8 h-8 text-blue-600 bg-blue-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Days Until Return</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600 bg-orange-100 rounded-lg p-2" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Currently Borrowed Books */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Currently Borrowed Books
            </h2>
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No books currently borrowed</p>
            </div>
          </div>

          {/* Reading History */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Reading History
            </h2>
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reading history available</p>
            </div>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Personal Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Full Name:</span>
                  <span className="text-gray-900">{user?.name} {user?.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Father's Name:</span>
                  <span className="text-gray-900">{user?.fatherName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-gray-900">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="text-gray-900">{user?.phone || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Membership Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Member ID:</span>
                  <span className="text-gray-900">{user?.nationalId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Membership Type:</span>
                  <span className="text-gray-900">Basic</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Join Date:</span>
                  <span className="text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Library Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Library Activity Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Total Books Borrowed</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Books Returned</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Overdue Books</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">-</div>
              <div className="text-sm text-gray-600">No Activity</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function VisitorDashboard() {
  return (
    <Routes>
      <Route index element={<VisitorDashboardHome />} />
      <Route path="library" element={<VisitorLibrary />} />
      <Route path="*" element={<Navigate to="/visitor" replace />} />
    </Routes>
  );
}