import React from 'react';
import { useUsers } from '../contexts/UserContext';
import AdminDashboard from './admin/Dashboard';
import StudentDashboard from './student/Dashboard';
import StaffDashboard from './staff/Dashboard';
import VisitorDashboard from './visitor/Dashboard';

export default function Dashboard() {
  const { currentUser } = useUsers();

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  switch (currentUser.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'visitor':
      return <VisitorDashboard />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unknown Role</h2>
            <p className="text-gray-600">Your account role is not recognized.</p>
          </div>
        </div>
      );
  }
}