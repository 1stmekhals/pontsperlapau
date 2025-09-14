import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import UserDetailsModal from '../components/UserDetailsModal';
import ConfirmDialog from '../components/ConfirmDialog';
import BookFormModal from '../components/BookFormModal';
import ClassFormModal from '../components/ClassFormModal';
import BorrowBookModal from '../components/BorrowBookModal';
import BorrowLogsModal from '../components/BorrowLogsModal';
import BookDetailsModal from '../components/BookDetailsModal';
import BookRequestsModal from '../components/BookRequestsModal';
import ClassEnrollmentRequestsModal from '../components/ClassEnrollmentRequestsModal';
import StudentFeedbackModal from '../components/StudentFeedbackModal';
import BookCard from '../components/BookCard';
import { useUsers } from '../contexts/UserContext';
import { useLibrary } from '../contexts/LibraryContext';
import { useClass } from '../contexts/ClassContext';
import { useBookRequests } from '../contexts/BookRequestContext';
import { useClassEnrollment } from '../contexts/ClassEnrollmentContext';
import { useFeedback } from '../contexts/FeedbackContext';
import { useActivity } from '../contexts/ActivityContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Activity, 
  Plus, 
  Search, 
  Filter,
  Settings,
  Calendar,
  Clock,
  History,
  MessageSquare,
  UserCheck,
  UserX,
  Shield,
  Trash2,
  Edit,
  Eye,
  List
} from 'lucide-react';
import { User } from '../types/User';
import { Book } from '../types/Library';
import { Class } from '../types/Class';
import { StudentFeedback } from '../types/Class';

// Admin Dashboard Home
function AdminDashboardHome() {
  const { users, pendingUsers, fetchUsers, fetchPendingUsers } = useUsers();
  const { books, fetchBooks } = useLibrary();
  const { classes, fetchClasses } = useClass();
  const { activities, fetchActivities } = useActivity();

  useEffect(() => {
    fetchUsers();
    fetchPendingUsers();
    fetchBooks();
    fetchClasses();
    fetchActivities();
  }, []);

  const totalStudents = classes.reduce((sum, cls) => sum + cls.currentStudents, 0);
  const borrowedBooks = books.reduce((sum, book) => {
    const totalCopies = book.totalCopies || 1;
    const availableCopies = book.availableCopies || totalCopies;
    return sum + (totalCopies - availableCopies);
  }, 0);

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Admin Dashboard
          </h1>
          <p className="text-blue-100">
            Manage users, library, classes, and system activities
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 bg-blue-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
              </div>
              <UserCheck className="w-8 h-8 text-orange-600 bg-orange-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Books</p>
                <p className="text-2xl font-bold text-gray-900">{books.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-600 bg-green-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Classes</p>
                <p className="text-2xl font-bold text-gray-900">{classes.filter(c => c.status === 'active').length}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-purple-600 bg-purple-100 rounded-lg p-2" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Users */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending User Approvals</h2>
            {pendingUsers.length > 0 ? (
              <div className="space-y-3">
                {pendingUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{user.name} {user.lastName}</p>
                      <p className="text-sm text-gray-600">{user.email} • {user.role}</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      Pending
                    </span>
                  </div>
                ))}
                {pendingUsers.length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{pendingUsers.length - 5} more pending users
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No pending approvals</p>
            )}
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Recently'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activities</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Admin Users Management
function AdminUsers() {
  const { 
    users, 
    pendingUsers, 
    staffUsers, 
    studentUsers, 
    visitorUsers, 
    adminUsers,
    fetchUsers, 
    fetchPendingUsers,
    approveUser, 
    rejectUser, 
    updateUser, 
    deleteUser, 
    promoteToAdmin,
    addUser,
    loading 
  } = useUsers();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
    action: 'approve' | 'reject' | 'delete' | 'promote';
  }>({
    isOpen: false,
    userId: '',
    userName: '',
    action: 'approve'
  });

  useEffect(() => {
    fetchUsers();
    fetchPendingUsers();
  }, []);

  const allUsers = [...users, ...pendingUsers];
  
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleApprove = async (userId: string) => {
    try {
      await approveUser(userId);
      showToast('User approved successfully!', 'success');
      setConfirmDialog({ isOpen: false, userId: '', userName: '', action: 'approve' });
    } catch (error) {
      showToast('Failed to approve user', 'error');
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await rejectUser(userId);
      showToast('User rejected successfully!', 'success');
      setConfirmDialog({ isOpen: false, userId: '', userName: '', action: 'reject' });
    } catch (error) {
      showToast('Failed to reject user', 'error');
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId);
      showToast('User deleted successfully!', 'success');
      setConfirmDialog({ isOpen: false, userId: '', userName: '', action: 'delete' });
    } catch (error) {
      showToast('Failed to delete user', 'error');
    }
  };

  const handlePromote = async (userId: string) => {
    try {
      await promoteToAdmin(userId);
      showToast('User promoted to admin successfully!', 'success');
      setConfirmDialog({ isOpen: false, userId: '', userName: '', action: 'promote' });
    } catch (error) {
      showToast('Failed to promote user', 'error');
    }
  };

  const handleSaveUser = async (userId: string, userData: Partial<User>) => {
    try {
      await updateUser(userId, userData);
      showToast('User updated successfully!', 'success');
      setShowUserModal(false);
      setSelectedUser(null);
    } catch (error) {
      showToast('Failed to update user', 'error');
    }
  };

  const handleAddUser = async (userData: Partial<User>) => {
    try {
      await addUser(userData);
      showToast('User added successfully!', 'success');
      setShowAddUserModal(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to add user', 'error');
      throw error;
    }
  };

  const openConfirmDialog = (userId: string, userName: string, action: 'approve' | 'reject' | 'delete' | 'promote') => {
    setConfirmDialog({
      isOpen: true,
      userId,
      userName,
      action
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'staff': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      case 'visitor': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout title="User Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage user accounts, approvals, and permissions</p>
          </div>
          <button 
            onClick={() => setShowAddUserModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{allUsers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 bg-blue-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
              </div>
              <UserCheck className="w-8 h-8 text-orange-600 bg-orange-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'student').length}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-green-600 bg-green-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Staff</p>
                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'staff').length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 bg-blue-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'admin').length}</p>
              </div>
              <Shield className="w-8 h-8 text-red-600 bg-red-100 rounded-lg p-2" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="student">Student</option>
            <option value="visitor">Visitor</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
            {filteredUsers.length} Users
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Users</h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                          {user.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {user.status === 'pending' && (
                            <>
                              <button
                                onClick={() => openConfirmDialog(user.id, `${user.name} ${user.lastName}`, 'approve')}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Approve User"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openConfirmDialog(user.id, `${user.name} ${user.lastName}`, 'reject')}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Reject User"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                          {user.status === 'approved' && user.role !== 'admin' && (
                            <button
                              onClick={() => openConfirmDialog(user.id, `${user.name} ${user.lastName}`, 'promote')}
                              className="text-purple-600 hover:text-purple-900 p-1"
                              title="Promote to Admin"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => openConfirmDialog(user.id, `${user.name} ${user.lastName}`, 'delete')}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || selectedRole !== 'all' || selectedStatus !== 'all' ? 'No users found' : 'No users'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || selectedRole !== 'all' || selectedStatus !== 'all'
                    ? 'Try adjusting your search criteria or filters.'
                    : 'Add users to get started.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={
            confirmDialog.action === 'approve' ? 'Approve User' :
            confirmDialog.action === 'reject' ? 'Reject User' :
            confirmDialog.action === 'promote' ? 'Promote to Admin' :
            'Delete User'
          }
          message={
            confirmDialog.action === 'approve' ? `Are you sure you want to approve "${confirmDialog.userName}"?` :
            confirmDialog.action === 'reject' ? `Are you sure you want to reject "${confirmDialog.userName}"?` :
            confirmDialog.action === 'promote' ? `Are you sure you want to promote "${confirmDialog.userName}" to admin?` :
            `Are you sure you want to delete "${confirmDialog.userName}"? This action cannot be undone.`
          }
          confirmText={
            confirmDialog.action === 'approve' ? 'Approve' :
            confirmDialog.action === 'reject' ? 'Reject' :
            confirmDialog.action === 'promote' ? 'Promote' :
            'Delete'
          }
          cancelText="Cancel"
          type={confirmDialog.action === 'delete' ? 'danger' : 'default'}
          onConfirm={() => {
            switch (confirmDialog.action) {
              case 'approve': handleApprove(confirmDialog.userId); break;
              case 'reject': handleReject(confirmDialog.userId); break;
              case 'promote': handlePromote(confirmDialog.userId); break;
              case 'delete': handleDelete(confirmDialog.userId); break;
            }
          }}
          onCancel={() => setConfirmDialog({ isOpen: false, userId: '', userName: '', action: 'approve' })}
        />

        {/* User Details Modal */}
        <UserDetailsModal
          isOpen={showUserModal}
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          onSave={handleSaveUser}
          currentUserRole="admin"
        />
      </div>
    </Layout>
  );
}

// Admin Library Management
function AdminLibrary() {
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
  }, []);

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
      await addBook(bookData);
      showToast('Book added successfully!', 'success');
      setShowBookFormModal(false);
      setSelectedBookForEdit(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to add book', 'error');
      throw error;
    }
  };

  const handleUpdateBook = async (bookId: string, bookData: Partial<Book>) => {
    try {
      await updateBook(bookId, bookData);
      showToast('Book updated successfully!', 'success');
      setShowBookFormModal(false);
      setSelectedBookForEdit(null);
      if (selectedBookForDetails && selectedBookForDetails.id === bookId) {
        setSelectedBookForDetails(prev => prev ? { ...prev, ...bookData } : null);
      }
    } catch (error) {
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
                    const totalCopies = book.totalCopies || 1;
                    const availableCopies = book.availableCopies || totalCopies;
                    return sum + (totalCopies - availableCopies);
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

        {/* Modals */}
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

        <BorrowBookModal
          isOpen={showBorrowModal}
          book={selectedBookForBorrow}
          onClose={() => {
            setShowBorrowModal(false);
            setSelectedBookForBorrow(null);
          }}
          onSave={handleBorrowBook}
        />

        <BookDetailsModal
          isOpen={showDetailsModal}
          book={selectedBookForDetails}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBookForDetails(null);
          }}
        />

        <BorrowLogsModal
          isOpen={showBorrowLogsModal}
          onClose={() => setShowBorrowLogsModal(false)}
        />

        <BookRequestsModal
          isOpen={showBookRequestsModal}
          onClose={() => setShowBookRequestsModal(false)}
          userRole="admin"
        />
      </div>
    </Layout>
  );
}

// Admin Classes Management  
function AdminClasses() {
  const { classes, fetchClasses, createClass, updateClass, deleteClass, enrollStudent, unenrollStudent, loading } = useClass();
  const { studentUsers } = useUsers();
  const { pendingRequests, fetchPendingRequests } = useClassEnrollment();
  const { feedbacks, fetchClassFeedbacks, addFeedback, updateFeedback } = useFeedback();
  const { user: authUser } = useAuth();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showClassFormModal, setShowClassFormModal] = useState(false);
  const [selectedClassForEdit, setSelectedClassForEdit] = useState<Class | null>(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<Class | null>(null);
  const [showEnrollmentRequestsModal, setShowEnrollmentRequestsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedStudentForFeedback, setSelectedStudentForFeedback] = useState<any>(null);
  const [selectedClassForFeedback, setSelectedClassForFeedback] = useState<Class | null>(null);
  const [existingFeedback, setExistingFeedback] = useState<StudentFeedback | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    classId: string;
    className: string;
  }>({
    isOpen: false,
    classId: '',
    className: ''
  });

  useEffect(() => {
    fetchClasses();
    fetchPendingRequests();
  }, []);

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cls.teacher && cls.teacher.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cls.teacher && cls.teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (classId: string) => {
    try {
      await deleteClass(classId);
      showToast('Class deleted successfully!', 'success');
      setConfirmDialog({ isOpen: false, classId: '', className: '' });
    } catch (error) {
      showToast('Failed to delete class', 'error');
    }
  };

  const openConfirmDialog = (classId: string, className: string) => {
    setConfirmDialog({
      isOpen: true,
      classId,
      className
    });
  };

  const handleAddClass = async (classData: Partial<Class>) => {
    try {
      await createClass(classData);
      showToast('Class added successfully!', 'success');
      setShowClassFormModal(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to add class', 'error');
      throw error;
    }
  };

  const handleUpdateClass = async (classId: string, classData: Partial<Class>) => {
    try {
      await updateClass(classId, classData);
      showToast('Class updated successfully!', 'success');
      setShowClassFormModal(false);
      setSelectedClassForEdit(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update class', 'error');
      throw error;
    }
  };

  const handleEditClass = (cls: Class) => {
    setSelectedClassForEdit(cls);
    setShowClassFormModal(true);
  };

  const handleViewStudents = (cls: Class) => {
    setSelectedClassForStudents(cls);
    setShowStudentsModal(true);
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout title="Class Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
            <p className="text-gray-600">Manage classes, schedules, and enrollments</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => {
                setSelectedClassForEdit(null);
                setShowClassFormModal(true);
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Class</span>
            </button>
            {pendingRequests.length > 0 && (
              <button 
                onClick={() => setShowEnrollmentRequestsModal(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Enrollment Requests ({pendingRequests.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
              </div>
              <Settings className="w-8 h-8 text-indigo-600 bg-indigo-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Classes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classes.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-600 bg-green-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classes.reduce((sum, cls) => sum + cls.currentStudents, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600 bg-blue-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Class Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classes.length > 0 ? Math.round(classes.reduce((sum, cls) => sum + cls.currentStudents, 0) / classes.length) : 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600 bg-orange-100 rounded-lg p-2" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search classes by name, subject, or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg text-sm font-medium">
            {filteredClasses.length} Classes
          </div>
        </div>

        {/* Classes Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Classes</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.map((cls) => (
                  <div key={cls.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                        <p className="text-sm text-gray-600">{cls.subject} • {cls.level}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cls.status)}`}>
                        {cls.status}
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

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Enrollment</span>
                        <span>{Math.round((cls.currentStudents / cls.maxStudents) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${(cls.currentStudents / cls.maxStudents) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditClass(cls)}
                        className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleViewStudents(cls)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Students
                      </button>
                      <button
                        onClick={() => openConfirmDialog(cls.id, cls.name)}
                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No classes found' : 'No classes'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Try adjusting your search criteria.'
                    : 'Create your first class to get started.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title="Delete Class"
          message={`Are you sure you want to delete "${confirmDialog.className}"? This action cannot be undone and will affect all enrolled students.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          onConfirm={() => handleDelete(confirmDialog.classId)}
          onCancel={() => setConfirmDialog({ isOpen: false, classId: '', className: '' })}
        />

        <ClassFormModal
          isOpen={showClassFormModal}
          onClose={() => {
            setShowClassFormModal(false);
            setSelectedClassForEdit(null);
          }}
          classToEdit={selectedClassForEdit}
          onAdd={handleAddClass}
          onUpdate={handleUpdateClass}
        />

        <ClassEnrollmentRequestsModal
          isOpen={showEnrollmentRequestsModal}
          onClose={() => setShowEnrollmentRequestsModal(false)}
          userRole="admin"
        />
      </div>
    </Layout>
  );
}

// Admin Activities
function AdminActivities() {
  const { activities, fetchActivities, loading } = useActivity();

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <Layout title="Activity Log">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-600">Monitor system activities and user actions</p>
        </div>

        {/* Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{activity.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Recently'}
                        </p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {activity.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities</h3>
                <p className="text-gray-600">No system activities recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function AdminDashboard() {
  return (
    <Routes>
      <Route index element={<AdminDashboardHome />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="library" element={<AdminLibrary />} />
      <Route path="classes" element={<AdminClasses />} />
      <Route path="activities" element={<AdminActivities />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}