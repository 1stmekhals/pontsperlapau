import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, ArrowRight } from 'lucide-react';

export default function EmailConfirmed() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to login after 5 seconds
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Email Confirmed!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your email has been successfully verified
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8 text-center">
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Welcome to Ponts per la Pau!
            </h3>
            <p className="text-green-700 text-sm">
              Your email has been confirmed and your account is now active.
            </p>
          </div>

          <div className="space-y-4 text-sm text-gray-600 mb-6">
            <p>You can now sign in to your account and access all features.</p>
            <p className="text-xs text-gray-500">
              You will be automatically redirected to the login page in a few seconds.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              Sign In Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            
            <Link
              to="/"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}