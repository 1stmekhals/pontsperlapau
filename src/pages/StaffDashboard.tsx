import React from 'react';
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useClass } from '../contexts/ClassContext';
import { useUsers } from '../contexts/UserContext';
import { useBookRequests } from '../contexts/BookRequestContext';
import { useFeedback } from '../contexts/FeedbackContext';
import { useToast } from '../contexts/ToastContext';
import { StudentFeedback } from '../types/Class';
import StudentFeedbackModal from '../components/StudentFeedbackModal';
import BookRequestModal from '../components/BookRequestModal';
import BookRequestsModal from '../components/BookRequestsModal';
import BookCard from '../components/BookCard';
import { Calendar, BookOpen, Users, Clock, Activity, User, GraduationCap } from 'lucide-react';
import { MessageSquare, Plus, Search } from 'lucide-react';
import { useLibrary } from '../contexts/LibraryContext';
import { Book } from '../types/Library';

function StaffProfile() {
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
              <h3 className="font-medium text-gray-900 mb-2">Professional Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Job Title:</span>
                  <span className="text-gray-900">{user?.jobTitle || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Join Date:</span>
                  <span className="text-gray-900">
                    {user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">National ID:</span>
                  <span className="text-gray-900">{user?.nationalId || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {user?.shortBio && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Bio</h3>
              <p className="text-sm text-gray-600">{user.shortBio}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function StaffClasses() {
  const { user } = useAuth();
  const { classes, fetchClasses } = useClass();
  const { studentUsers } = useUsers();
  const { feedbacks, fetchClassFeedbacks, addFeedback, updateFeedback } = useFeedback();
  const { showToast } = useToast();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedStudentForFeedback, setSelectedStudentForFeedback] = useState<{
    id: string;
    name: string;
    lastName: string;
    educationLevel?: string;
  } | null>(null);
  const [selectedClassForFeedback, setSelectedClassForFeedback] = useState<any>(null);
  const [existingFeedback, setExistingFeedback] = useState<StudentFeedback | null>(null);

  // Get classes where current user is the teacher
  const myClasses = classes.filter(cls => cls.teacherId === user?.id);

  React.useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleGiveFeedback = async (cls: any, student: any) => {
    // Check if feedback already exists
    await fetchClassFeedbacks(cls.id);
    const existing = feedbacks.find(f => f.studentId === student.id && f.classId === cls.id);
    
    setSelectedStudentForFeedback(student);
    setSelectedClassForFeedback(cls);
    setExistingFeedback(existing || null);
    setShowFeedbackModal(true);
  };

  const handleSaveFeedback = async (feedbackData: {
    classId: string;
    studentId: string;
    teacherId: string;
    score: 'basic' | 'intermediate' | 'advanced';
    feedback: string;
  }) => {
    try {
      await addFeedback(feedbackData);
      showToast('Feedback added successfully!', 'success');
      setShowFeedbackModal(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to add feedback', 'error');
      throw error;
    }
  };

  const handleUpdateFeedback = async (feedbackId: string, feedbackData: {
    score: 'basic' | 'intermediate' | 'advanced';
    feedback: string;
  }) => {
    try {
      await updateFeedback(feedbackId, feedbackData);
      showToast('Feedback updated successfully!', 'success');
      setShowFeedbackModal(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update feedback', 'error');
      throw error;
    }
  };

  return (
    <Layout title="My Classes">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
          <p className="text-gray-600">Manage your teaching classes and student feedback</p>
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
                    {cls.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Students:</span>
                    <span>{cls.currentStudents}/{cls.maxStudents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Start Date:</span>
                    <span>{new Date(cls.startDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Students List */}
                {cls.enrolledStudents && cls.enrolledStudents.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Students:</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {cls.enrolledStudents.map((studentId: string) => {
                        const student = studentUsers.find(s => s.id === studentId);
                        return student ? (
                          <div key={studentId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {student.name} {student.lastName}
                              </p>
                              <p className="text-xs text-gray-500">{student.educationLevel}</p>
                            </div>
                            <button
                              onClick={() => handleGiveFeedback(cls, student)}
                              className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors flex items-center space-x-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Feedback</span>
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-center py-8">
              <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Assigned</h3>
              <p className="text-gray-500">You haven't been assigned to teach any classes yet.</p>
            </div>
          </div>
        )}

        {/* Student Feedback Modal */}
        <StudentFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedStudentForFeedback(null);
            setSelectedClassForFeedback(null);
            setExistingFeedback(null);
          }}
          student={selectedStudentForFeedback}
          classInfo={selectedClassForFeedback ? {
            id: selectedClassForFeedback.id,
            name: selectedClassForFeedback.name,
            subject: selectedClassForFeedback.subject
          } : null}
          teacherId={user?.id || ''}
          existingFeedback={existingFeedback}
          onSave={handleSaveFeedback}
          onUpdate={handleUpdateFeedback}
        />
      </div>
    </Layout>
  );
}

function StaffLibrary() {
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
          userRole="staff"
        />
      </div>
    </Layout>
  );
}

function StaffDashboardHome() {
  const { user } = useAuth();
  const { classes, fetchClasses } = useClass();

  // Get classes where current user is the teacher
  const myClasses = classes.filter(cls => cls.teacherId === user?.id);
  
  // Calculate total students across all my classes
  const totalStudents = myClasses.reduce((sum, cls) => sum + cls.currentStudents, 0);
  
  // Get today's classes
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const todaysClasses = myClasses.filter(cls => 
    cls.schedule.some(schedule => schedule.dayOfWeek === today)
  );

  React.useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return (
    <Layout title="Staff Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-blue-100">
            {user?.jobTitle && `${user.jobTitle} • `}
            Ready to manage your classes and responsibilities.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Classes Teaching</p>
                <p className="text-2xl font-bold text-gray-900">{myClasses.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 bg-blue-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-green-600 bg-green-100 rounded-lg p-2" />
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
                <p className="text-2xl font-bold text-gray-900">{todaysClasses.length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600 bg-orange-100 rounded-lg p-2" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Today's Schedule
            </h2>
            {todaysClasses.length > 0 ? (
              <div className="space-y-3">
                {todaysClasses.map((cls) => (
                  <div key={cls.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900">{cls.name}</h4>
                    <p className="text-sm text-blue-700">{cls.subject} • {cls.currentStudents} students</p>
                    <div className="mt-2 space-y-1">
                      {cls.schedule
                        .filter(schedule => schedule.dayOfWeek === today)
                        .map((schedule, index) => (
                          <p key={index} className="text-xs text-blue-600">
                            {schedule.startTime} - {schedule.endTime}
                          </p>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No classes scheduled for today</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity</p>
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
              <h3 className="font-medium text-gray-900 mb-2">Professional Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Job Title:</span>
                  <span className="text-gray-900">{user?.jobTitle || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Join Date:</span>
                  <span className="text-gray-900">
                    {user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">National ID:</span>
                  <span className="text-gray-900">{user?.nationalId || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {user?.shortBio && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Bio</h3>
              <p className="text-sm text-gray-600">{user.shortBio}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default function StaffDashboard() {
  return (
    <Routes>
      <Route index element={<StaffDashboardHome />} />
      <Route path="profile" element={<StaffProfile />} />
      <Route path="classes" element={<StaffClasses />} />
      <Route path="library" element={<StaffLibrary />} />
      <Route path="*" element={<Navigate to="/staff" replace />} />
    </Routes>
  );
}