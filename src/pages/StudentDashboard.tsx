import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useClass } from '../contexts/ClassContext';
import { useLibrary } from '../contexts/LibraryContext';
import { useBookRequests } from '../contexts/BookRequestContext';
import { useToast } from '../contexts/ToastContext';
import BookRequestModal from '../components/BookRequestModal';
import BookRequestsModal from '../components/BookRequestsModal';
import { BookOpen, Calendar, GraduationCap, Clock, Plus, Search, MessageSquare, User } from 'lucide-react';
import { Book } from '../types/Library';

function StudentProfile() {
  const { user } = useAuth();

  return (
    <Layout title="My Profile">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
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
              <h3 className="font-medium text-gray-900 mb-2">Academic Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Education Level:</span>
                  <span className="text-gray-900">{user?.educationLevel || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Student ID:</span>
                  <span className="text-gray-900">{user?.nationalId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Parent Contact:</span>
                  <span className="text-gray-900">{user?.parentContact || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date of Birth:</span>
                  <span className="text-gray-900">
                    {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="text-gray-900">{user?.address || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gender:</span>
                <span className="text-gray-900 capitalize">{user?.gender || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StudentClasses() {
  const { user } = useAuth();
  const { classes, fetchClasses, loading } = useClass();
  const { createEnrollmentRequest } = useClassEnrollment();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [selectedClassForEnrollment, setSelectedClassForEnrollment] = useState<Class | null>(null);

  // Get classes where current user is enrolled
  const myClasses = classes.filter(cls => 
    cls.enrolledStudents && cls.enrolledStudents.includes(user?.id || '')
  );

  // Get available classes (not enrolled and active)
  const availableClasses = classes.filter(cls => 
    cls.status === 'active' && 
    (!cls.enrolledStudents || !cls.enrolledStudents.includes(user?.id || ''))
  );

  const filteredAvailableClasses = availableClasses.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cls.teacher && cls.teacher.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cls.teacher && cls.teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  React.useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const handleRequestEnrollment = (cls: Class) => {
    setSelectedClassForEnrollment(cls);
    setShowEnrollmentModal(true);
  };

  const handleSaveEnrollmentRequest = async (requestData: {
    classId: string;
    notes?: string;
  }) => {
    try {
      await createEnrollmentRequest(requestData);
      showToast('Enrollment request sent successfully! Wait for admin approval.', 'success');
      setShowEnrollmentModal(false);
      setSelectedClassForEnrollment(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to send enrollment request', 'error');
      throw error;
    }
  };

  return (
    <Layout title="My Classes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
            <p className="text-gray-600">View your enrolled classes and request to join new ones</p>
          </div>
          <button 
            onClick={() => setShowRequestsModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>My Requests</span>
          </button>
        </div>

        {/* My Enrolled Classes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Enrolled Classes</h2>
          </div>
          <div className="p-6">
            {myClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myClasses.map((cls) => (
                  <div key={cls.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                        <p className="text-sm text-gray-600">{cls.subject} • {cls.level}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Enrolled
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Teacher:</span>
                        <span>{cls.teacher ? `${cls.teacher.name} ${cls.teacher.lastName}` : 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Students:</span>
                        <span>{cls.currentStudents}/{cls.maxStudents}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Start Date:</span>
                        <span>{new Date(cls.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Schedule:</h4>
                      <div className="space-y-1">
                        {cls.schedule.map((schedule, index) => (
                          <div key={index} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                            {getDayName(schedule.dayOfWeek)} {schedule.startTime} - {schedule.endTime}
                          </div>
                        ))}
                      </div>
                    </div>

                    {cls.description && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">{cls.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Enrolled</h3>
                <p className="text-gray-500">You are not enrolled in any classes yet. Browse available classes below to request enrollment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Available Classes to Join */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Available Classes</h2>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {filteredAvailableClasses.length} Available
            </div>
          </div>
          
          {/* Search */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search classes by name, subject, or teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : filteredAvailableClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAvailableClasses.map((cls) => (
                  <div key={cls.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                        <p className="text-sm text-gray-600">{cls.subject} • {cls.level}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cls.currentStudents >= cls.maxStudents 
                          ? 'bg-red-100 text-red-800' 
                          : cls.currentStudents >= cls.maxStudents * 0.8 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {cls.currentStudents >= cls.maxStudents 
                          ? 'Full' 
                          : `${cls.maxStudents - cls.currentStudents} spots left`
                        }
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Teacher:</span>
                        <span>{cls.teacher ? `${cls.teacher.name} ${cls.teacher.lastName}` : 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Students:</span>
                        <span>{cls.currentStudents}/{cls.maxStudents}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Start Date:</span>
                        <span>{new Date(cls.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Schedule:</h4>
                      <div className="space-y-1">
                        {cls.schedule.map((schedule, index) => (
                          <div key={index} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                            {getDayName(schedule.dayOfWeek)} {schedule.startTime} - {schedule.endTime}
                          </div>
                        ))}
                      </div>
                    </div>

                    {cls.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {cls.description}
                      </p>
                    )}

                    {/* Request Enrollment Button */}
                    <button
                      onClick={() => handleRequestEnrollment(cls)}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Request to Join</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No classes found' : 'No available classes'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Try adjusting your search criteria.'
                    : 'No classes are currently available for enrollment.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Class Enrollment Modal */}
        <ClassEnrollmentModal
          isOpen={showEnrollmentModal}
          class={selectedClassForEnrollment}
          onClose={() => {
            setShowEnrollmentModal(false);
            setSelectedClassForEnrollment(null);
          }}
          onSave={handleSaveEnrollmentRequest}
        />

        {/* Enrollment Requests Modal */}
        <ClassEnrollmentRequestsModal
          isOpen={showRequestsModal}
          onClose={() => setShowRequestsModal(false)}
          userRole="student"
        />
      </div>
    </Layout>
  );
}

function StudentClasses_Old() {
  const { user } = useAuth();
  const { classes, fetchClasses } = useClasses();

  // Get classes where current user is enrolled
  const myClasses = classes.filter(cls => 
    cls.enrolledStudents && cls.enrolledStudents.includes(user?.id || '')
  );

  React.useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  return (
    <Layout title="My Classes">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
          <p className="text-gray-600">View your enrolled classes and schedules</p>
        </div>

        {/* Classes */}
        {myClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myClasses.map((cls) => (
              <div key={cls.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                    <p className="text-sm text-gray-600">{cls.subject} • {cls.level}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Enrolled
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Teacher:</span>
                    <span>{cls.teacher ? `${cls.teacher.name} ${cls.teacher.lastName}` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Students:</span>
                    <span>{cls.currentStudents}/{cls.maxStudents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Start Date:</span>
                    <span>{new Date(cls.startDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Schedule */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Schedule:</h4>
                  <div className="space-y-1">
                    {cls.schedule.map((schedule, index) => (
                      <div key={index} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                        {getDayName(schedule.dayOfWeek)} {schedule.startTime} - {schedule.endTime}
                      </div>
                    ))}
                  </div>
                </div>

                {cls.description && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">{cls.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-center py-8">
              <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Enrolled</h3>
              <p className="text-gray-500">You are not enrolled in any classes yet.</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function StudentLibrary() {
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
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium">
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
          userRole="student"
        />
      </div>
    </Layout>
  );
}

function StudentDashboardHome() {
  const { user } = useAuth();

  return (
    <Layout title="Student Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-green-100">
            {user?.educationLevel && `${user.educationLevel} Student • `}
            Keep up the great work in your studies.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enrolled Classes</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <GraduationCap className="w-8 h-8 text-green-600 bg-green-100 rounded-lg p-2" />
            </div>
          </div>

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
                <p className="text-sm font-medium text-gray-600">Today's Classes</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600 bg-blue-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assignments Due</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600 bg-orange-100 rounded-lg p-2" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Today's Classes
            </h2>
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No classes scheduled for today</p>
            </div>
          </div>

          {/* Borrowed Books */}
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
              <h3 className="font-medium text-gray-900 mb-2">Academic Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Education Level:</span>
                  <span className="text-gray-900">{user?.educationLevel || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Student ID:</span>
                  <span className="text-gray-900">{user?.nationalId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Parent Contact:</span>
                  <span className="text-gray-900">{user?.parentContact || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date of Birth:</span>
                  <span className="text-gray-900">
                    {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Assignments</h2>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No upcoming assignments</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function StudentDashboard() {
  return (
    <Routes>
      <Route index element={<StudentDashboardHome />} />
      <Route path="profile" element={<StudentProfile />} />
      <Route path="classes" element={<StudentClasses />} />
      <Route path="library" element={<StudentLibrary />} />
      <Route path="*" element={<Navigate to="/student" replace />} />
    </Routes>
  );
}