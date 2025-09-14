import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, createBrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import PendingApproval from './pages/PendingApproval';
import SetupPassword from './pages/SetupPassword';
import ForgotPassword from './pages/ForgotPassword';
import EmailConfirmed from './pages/EmailConfirmed';
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

function SimpleDashboard() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-gray-900">
                Ponts per la Pau - {user?.role?.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Ponts per la Pau
          </h1>
          <p className="text-gray-600 mb-6">
            You are logged in as: <strong>{user?.name} {user?.lastName}</strong>
          </p>
          <p className="text-gray-600 mb-6">
            Role: <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">{user?.role}</span>
          </p>
          <p className="text-gray-600">
            Status: <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">{user?.status}</span>
          </p>
        </div>
      </div>
    </div>
  );
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
      <Route path="/email-confirmed" element={<EmailConfirmed />} />
      
      <Route path="/admin/*" element={
        <ProtectedRoute roles={['admin']}>
          <SimpleDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/staff/*" element={
        <ProtectedRoute roles={['staff']}>
          <SimpleDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/student/*" element={
        <ProtectedRoute roles={['student']}>
          <SimpleDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/visitor/*" element={
        <ProtectedRoute roles={['visitor']}>
          <SimpleDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="App">
            <AppRouter />
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;