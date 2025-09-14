import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle, Mail } from 'lucide-react';

export default function PendingApproval() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Clock className="w-12 h-12 text-yellow-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Account Pending Approval
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your account has been created and is awaiting admin approval
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8">
          <div className="text-center">
            <div className="bg-yellow-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                Registration Successful!
              </h3>
              <p className="text-yellow-700 text-sm">
                Thank you for registering with Ponts per la Pau. Your account has been created and is currently being reviewed by our administrators.
              </p>
            </div>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Account Created</p>
                  <p>Your registration information has been submitted successfully.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Under Review</p>
                  <p>An administrator will review your account within 24-48 hours.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Email Notification</p>
                  <p>You'll receive an email once your account is approved.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-700 space-y-1 text-left">
                <li>• Admin reviews your registration details</li>
                <li>• Account approval notification sent via email</li>
                <li>• Access granted to library and class systems</li>
                <li>• Welcome orientation materials provided</li>
              </ul>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-4">
                Need help or have questions about your registration?
              </p>
              <Link
                to="/login"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}