import React, { useEffect, useState } from 'react';
import { X, BookOpen, User, Calendar, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { BookRequest } from '../types/Library';
import { useBookRequests } from '../contexts/BookRequestContext';

interface BookRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'admin' | 'staff' | 'student' | 'visitor';
}

export default function BookRequestsModal({ isOpen, onClose, userRole }: BookRequestsModalProps) {
  const { 
    userRequests, 
    pendingRequests, 
    fetchUserRequests, 
    fetchPendingRequests, 
    approveBookRequest, 
    rejectBookRequest,
    loading 
  } = useBookRequests();
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (userRole === 'admin') {
        fetchPendingRequests();
      } else {
        fetchUserRequests();
      }
    }
  }, [isOpen, userRole, fetchUserRequests, fetchPendingRequests]);

  if (!isOpen) return null;

  const handleApprove = async (requestId: string) => {
    setProcessingRequestId(requestId);
    try {
      await approveBookRequest(requestId, adminNotes[requestId]);
      setAdminNotes(prev => ({ ...prev, [requestId]: '' }));
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingRequestId(requestId);
    try {
      await rejectBookRequest(requestId, adminNotes[requestId]);
      setAdminNotes(prev => ({ ...prev, [requestId]: '' }));
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const requestsToShow = userRole === 'admin' ? pendingRequests : userRequests;
  const title = userRole === 'admin' ? 'Pending Book Requests' : 'My Book Requests';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {title}
              </h2>
              <p className="text-gray-600">
                {userRole === 'admin' 
                  ? 'Review and approve book borrowing requests' 
                  : 'Track your book borrowing requests'
                }
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        {userRole === 'admin' && (
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Pending Requests</p>
                    <p className="text-2xl font-bold text-yellow-900">{pendingRequests.length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Approved Today</p>
                    <p className="text-2xl font-bold text-green-900">0</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Rejected Today</p>
                    <p className="text-2xl font-bold text-red-900">0</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : requestsToShow.length > 0 ? (
            <div className="space-y-4">
              {requestsToShow.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 bg-white border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Book Info */}
                      <div className="flex items-center space-x-3">
                        <BookOpen className="w-8 h-8 text-blue-600 bg-blue-100 rounded-lg p-2" />
                        <div>
                          <h4 className="font-medium text-gray-900">{request.book?.title}</h4>
                          <p className="text-sm text-gray-600">by {request.book?.author}</p>
                          <p className="text-xs text-gray-500">{request.book?.genre}</p>
                        </div>
                      </div>

                      {/* Request Info */}
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-8 h-8 text-purple-600 bg-purple-100 rounded-lg p-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Requested: {new Date(request.requestDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Due: {new Date(request.requestedDueDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Duration: {Math.ceil((new Date(request.requestedDueDate).getTime() - new Date(request.requestDate).getTime()) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                      </div>

                      {/* Status and User Info */}
                      <div className="flex items-center justify-between">
                        <div>
                          {userRole === 'admin' && request.user && (
                            <div className="mb-2">
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-900">
                                  {request.user.name} {request.user.lastName}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 ml-6">
                                {request.user.role} • {request.user.email}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              <span className="capitalize">{request.status}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {request.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Request Notes:</span> {request.notes}
                      </p>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {request.adminNotes && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Admin Notes:</span> {request.adminNotes}
                      </p>
                    </div>
                  )}

                  {/* Admin Actions */}
                  {userRole === 'admin' && request.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Admin Notes (Optional)
                        </label>
                        <textarea
                          rows={2}
                          value={adminNotes[request.id] || ''}
                          onChange={(e) => setAdminNotes(prev => ({ ...prev, [request.id]: e.target.value }))}
                          placeholder="Add notes about this approval/rejection..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleApprove(request.id)}
                          disabled={processingRequestId === request.id || (request.book?.availableCopies || 0) <= 0}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{processingRequestId === request.id ? 'Approving...' : 'Approve'}</span>
                        </button>
                        
                        <button
                          onClick={() => handleReject(request.id)}
                          disabled={processingRequestId === request.id}
                          className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>{processingRequestId === request.id ? 'Rejecting...' : 'Reject'}</span>
                        </button>
                      </div>

                      {(request.book?.availableCopies || 0) <= 0 && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                          ⚠️ Cannot approve: No copies available
                        </div>
                      )}
                    </div>
                  )}

                  {/* Approval Info */}
                  {request.status !== 'pending' && request.approvedAt && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        {request.status === 'approved' ? 'Approved' : 'Rejected'} on {new Date(request.approvedAt).toLocaleDateString()}
                        {request.approver && ` by ${request.approver.name} ${request.approver.lastName}`}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {userRole === 'admin' ? 'No Pending Requests' : 'No Book Requests'}
              </h3>
              <p className="text-gray-600">
                {userRole === 'admin' 
                  ? 'All book requests have been processed.'
                  : 'You haven\'t made any book requests yet.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}