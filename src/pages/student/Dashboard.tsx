import React from 'react';
import { BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';

export default function StudentDashboard() {
  const { signOut } = useAuth();
  const { currentUser } = useUser();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                Ponts per la Pau - Student
              </span>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-700">
                Welcome, {currentUser?.name}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Dashboard</h1>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Welcome to the Library System</h2>
            <p className="text-gray-600">
              Your student dashboard is being developed. Soon you'll be able to:
            </p>
            <ul className="mt-4 list-disc list-inside text-gray-600 space-y-2">
              <li>Browse and search books</li>
              <li>View your borrowed books</li>
              <li>Enroll in classes</li>
              <li>View your class schedule</li>
              <li>Update your profile</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}