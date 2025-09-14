import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { LibraryProvider } from './contexts/LibraryContext';
import { ClassProvider } from './contexts/ClassContext';
import { BookRequestProvider } from './contexts/BookRequestContext';
import { FeedbackProvider } from './contexts/FeedbackContext';
import { ActivityProvider } from './contexts/ActivityContext';
import { ClassEnrollmentProvider } from './contexts/ClassEnrollmentContext';
import { ToastProvider } from './contexts/ToastContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import StaffDashboard from './pages/StaffDashboard';
import StudentDashboard from './pages/StudentDashboard';
import VisitorDashboard from './pages/VisitorDashboard';
import PendingApproval from './pages/PendingApproval';
import SetupPassword from './pages/SetupPassword';
import ForgotPassword from './pages/ForgotPassword';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children, roles }: { children: React.ReactNode, roles: string[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.status === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (user.status === 'rejected') {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function DashboardRedirect() {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/" replace />;
  
  if (user.status === 'pending') return <Navigate to="/pending-approval" replace />;
  
  switch (user.role) {
    case 'admin': return <Navigate to="/admin" replace />;
    case 'staff': return <Navigate to="/staff" replace />;
    case 'student': return <Navigate to="/student" replace />;
    case 'visitor': return <Navigate to="/visitor" replace />;
    default: return <Navigate to="/" replace />;
  }
}

function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <DashboardRedirect /> : <Landing />} />
      <Route path="/login" element={user ? <DashboardRedirect /> : <Login />} />
      <Route path="/register" element={user ? <DashboardRedirect /> : <Register />} />
      <Route path="/pending-approval" element={
        user && user.status === 'pending' ? <PendingApproval /> : <Navigate to="/" replace />
      } />
      <Route path="/setup-password" element={
        user ? <DashboardRedirect /> : <SetupPassword />
      } />
      <Route path="/forgot-password" element={
        user ? <DashboardRedirect /> : <ForgotPassword />
      } />
      
      <Route path="/admin/*" element={
        <ProtectedRoute roles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/staff/*" element={
        <ProtectedRoute roles={['staff']}>
          <StaffDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/student/*" element={
        <ProtectedRoute roles={['student']}>
          <StudentDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/visitor/*" element={
        <ProtectedRoute roles={['visitor']}>
          <VisitorDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ActivityProvider>
          <UserProvider>
            <FeedbackProvider>
              <ClassEnrollmentProvider>
                <BookRequestProvider>
                  <ClassProvider>
                    <LibraryProvider>
                      <Router>
                        <div className="App">
                          <AppRouter />
                        </div>
                      </Router>
                    </LibraryProvider>
                  </ClassProvider>
                </BookRequestProvider>
              </ClassEnrollmentProvider>
            </FeedbackProvider>
          </UserProvider>
        </ActivityProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;