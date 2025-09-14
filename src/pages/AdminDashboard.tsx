import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from '../components/Layout';
import UserDetailsModal from '../components/UserDetailsModal';
import ConfirmDialog from '../components/ConfirmDialog';
import BookFormModal from '../components/BookFormModal';
import ClassFormModal from '../components/ClassFormModal';
import StudentFeedbackModal from '../components/StudentFeedbackModal';
import BookRequestsModal from '../components/BookRequestsModal';
import ClassEnrollmentRequestsModal from '../components/ClassEnrollmentRequestsModal';
import { useUsers } from '../contexts/UserContext';
import { useLibrary } from '../contexts/LibraryContext';
import { useClasses } from '../contexts/ClassContext';
import { useBookRequests } from '../contexts/BookRequestContext';
import { useClassEnrollment } from '../contexts/ClassEnrollmentContext';
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
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Crown
} from 'lucide-react';
import { User } from '../types/User';
import { Book } from '../types/Library';
import { Class } from '../types/Class';

// Admin Users Management
function AdminUsers() {
  const { 
    users, 
    pendingUsers, 
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
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | 'delete' | 'promote';
    userId: string;
    userName: string;
  }>({
    isOpen: false,
    type: 'approve',
    userId: '',
    userName: ''
  });

  React.useEffect(() => {
    fetchUsers();
    fetchPendingUsers();
  }, [fetchUsers, fetchPendingUsers]);

  const allUsers = [...users, ...pendingUsers];
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAction = async (action: string, userId: string) => {
    try {
      switch (action) {
        case 'approve':
          await approveUser(userId);
          showToast('User approved successfully!', 'success');
          break;
        case 'reject':
          await rejectUser(userId);
          showToast('User rejected successfully!', 'success');
          break;
        case 'delete':
          await deleteUser(userId);
          showToast('User deleted successfully!', 'success');
          break;
        case 'promote':
          await promoteToAdmin(userId);
          showToast('User promoted to admin successfully!', 'success');
          break;
      }
      setConfirmDialog({ isOpen: false, type: 'approve', userId: '', userName: '' });
    } catch (error) {
      showToast(error instanceof Error ? error.message : `Failed to ${action} user`, 'error');
    }
  };

  const openConfirmDialog = (type: 'approve' | 'reject' | 'delete' | 'promote', userId: string, userName: string) => {
    setConfirmDialog({ isOpen: true, type, userId, userName });
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600 bg-yellow-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'approved').length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600 bg-green-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Staff Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'staff' && u.status === 'approved').length}
                </p>
              </div>
              <Settings className="w-8 h-8 text-purple-600 bg-purple-100 rounded-lg p-2" />
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="student">Student</option>
            <option value="visitor">Visitor</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {user.photo && user.photo.startsWith('data:image/') ? (
                              <img 
                                src={user.photo} 
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <Users className="w-5 h-5 text-gray-400" />
                            )}
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {user.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openConfirmDialog('approve', user.id, `${user.name} ${user.lastName}`)}
                              className="text-green-600 hover:text-green-900 transition-colors"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openConfirmDialog('reject', user.id, `${user.name} ${user.lastName}`)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {user.status === 'approved' && user.role !== 'admin' && (
                          <button
                            onClick={() => openConfirmDialog('promote', user.id, `${user.name} ${user.lastName}`)}
                            className="text-purple-600 hover:text-purple-900 transition-colors"
                          >
                            <Crown className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => openConfirmDialog('delete', user.id, `${user.name} ${user.lastName}`)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || roleFilter || statusFilter ? 'No users found' : 'No users'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || roleFilter || statusFilter 
                    ? 'Try adjusting your search criteria or filters.'
                    : 'No users have been registered yet.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <UserDetailsModal
          isOpen={showUserModal}
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          onSave={updateUser}
          currentUserRole="admin"
        />

        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={`${confirmDialog.type.charAt(0).toUpperCase() + confirmDialog.type.slice(1)} User`}
          message={`Are you sure you want to ${confirmDialog.type} "${confirmDialog.userName}"?`}
          confirmText={confirmDialog.type.charAt(0).toUpperCase() + confirmDialog.type.slice(1)}
          cancelText="Cancel"
          type={confirmDialog.type === 'delete' ? 'danger' : confirmDialog.type === 'approve' ? 'success' : 'warning'}
          onConfirm={() => handleAction(confirmDialog.type, confirmDialog.userId)}
          onCancel={() => setConfirmDialog({ isOpen: false, type: 'approve', userId: '', userName: '' })}
        />
      </div>
    </Layout>
  );
}

// Admin Library Management (using existing component)
function AdminLibrary() {
  return <div>Library component will be imported from admin/Library.tsx</div>;
}

// Admin Classes Management (using existing component)  
function AdminClasses() {
  return <div>Classes component will be imported from admin/Classes.tsx</div>;
}

// Admin Activities
function AdminActivities() {
  const { activities, fetchActivities, loading } = useActivity();
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_approved':
      case 'user_rejected':
      case 'user_created':
      case 'user_deleted':
      case 'user_promoted':
        return <Users className="w-5 h-5" />;
      case 'book_added':
      case 'book_updated':
      case 'book_deleted':
      case 'book_borrowed':
      case 'book_returned':
        return <BookOpen className="w-5 h-5" />;
      case 'class_created':
      case 'class_updated':
      case 'class_deleted':
      case 'student_enrolled':
      case 'student_unenrolled':
        return <GraduationCap className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    if (type.includes('user')) return 'bg-blue-100 text-blue-600';
    if (type.includes('book')) return 'bg-green-100 text-green-600';
    if (type.includes('class') || type.includes('student')) return 'bg-purple-100 text-purple-600';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <Layout title="Activity Log">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-600">Monitor all system activities and user actions</p>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
            {filteredActivities.length} Activities
          </div>
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
            ) : filteredActivities.length > 0 ? (
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                        <span className="text-xs text-gray-500">
                          {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="bg-gray-200 px-2 py-1 rounded capitalize">{activity.type.replace('_', ' ')}</span>
                        {activity.targetType && (
                          <span>Target: {activity.targetType}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No activities found' : 'No activities'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Try adjusting your search criteria.'
                    : 'No activities have been logged yet.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Admin Dashboard Home
function AdminDashboardHome() {
  const { users, pendingUsers } = useUsers();
  const { books } = useLibrary();
  const { classes } = useClasses();
  const { pendingRequests: pendingBookRequests } = useBookRequests();
  const { pendingRequests: pendingEnrollmentRequests } = useClassEnrollment();

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-blue-100">
            Manage your library and education system with comprehensive administrative tools.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length + pendingUsers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 bg-blue-100 rounded-lg p-2" />
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
                <p className="text-2xl font-bold text-gray-900">
                  {classes.filter(c => c.status === 'active').length}
                </p>
              </div>
              <GraduationCap className="w-8 h-8 text-purple-600 bg-purple-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingUsers.length + pendingBookRequests.length + pendingEnrollmentRequests.length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600 bg-orange-100 rounded-lg p-2" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h2>
            <div className="space-y-3">
              {pendingUsers.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-900">User Registrations</span>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    {pendingUsers.length}
                  </span>
                </div>
              )}
              
              {pendingBookRequests.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">Book Requests</span>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {pendingBookRequests.length}
                  </span>
                </div>
              )}
              
              {pendingEnrollmentRequests.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-900">Class Enrollments</span>
                  </div>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                    {pendingEnrollmentRequests.length}
                  </span>
                </div>
              )}
              
              {pendingUsers.length === 0 && pendingBookRequests.length === 0 && pendingEnrollmentRequests.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-gray-500">All caught up! No pending approvals.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center space-x-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Add User</span>
              </button>
              <button className="flex items-center justify-center space-x-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm font-medium">Add Book</span>
              </button>
              <button className="flex items-center justify-center space-x-2 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                <GraduationCap className="w-5 h-5" />
                <span className="text-sm font-medium">Add Class</span>
              </button>
              <button className="flex items-center justify-center space-x-2 p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
                <Activity className="w-5 h-5" />
                <span className="text-sm font-medium">View Reports</span>
              </button>
            </div>
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