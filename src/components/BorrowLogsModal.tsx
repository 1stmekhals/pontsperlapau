import React, { useEffect, useState } from 'react';
import { X, BookOpen, User, Calendar, Clock, CheckCircle, RotateCcw, Search } from 'lucide-react';
import { useLibrary } from '../contexts/LibraryContext';

interface BorrowLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BorrowLogsModal({ isOpen, onClose }: BorrowLogsModalProps) {
  const { borrowLogs, fetchBorrowLogs, returnBook, loading } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [processingReturnId, setProcessingReturnId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchBorrowLogs();
    }
  }, [isOpen, fetchBorrowLogs]);

  if (!isOpen) return null;

  const filteredLogs = borrowLogs.filter(log => {
    const matchesSearch = 
      log.book?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.book?.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || log.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleReturn = async (borrowLogId: string) => {
    setProcessingReturnId(borrowLogId);
    try {
      await returnBook(borrowLogId);
    } catch (error) {
      console.error('Error returning book:', error);
    } finally {
      setProcessingReturnId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'borrowed': return 'bg-blue-100 text-blue-800';
      case 'returned': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'borrowed': return <Clock className="w-4 h-4" />;
      case 'returned': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status === 'borrowed' && new Date(dueDate) < new Date();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Borrow Logs
              </h2>
              <p className="text-gray-600">Track all book borrowing activities</p>
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
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Currently Borrowed</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {borrowLogs.filter(log => log.status === 'borrowed').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Returned</p>
                  <p className="text-2xl font-bold text-green-900">
                    {borrowLogs.filter(log => log.status === 'returned').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-900">
                    {borrowLogs.filter(log => isOverdue(log.dueDate, log.status)).length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Logs</p>
                  <p className="text-2xl font-bold text-gray-900">{borrowLogs.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by book title, author, or user name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="borrowed">Borrowed</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`border rounded-lg p-4 ${
                    isOverdue(log.dueDate, log.status) ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Book Info */}
                      <div className="flex items-center space-x-3">
                        <BookOpen className="w-8 h-8 text-purple-600 bg-purple-100 rounded-lg p-2" />
                        <div>
                          <h4 className="font-medium text-gray-900">{log.book?.title}</h4>
                          <p className="text-sm text-gray-600">by {log.book?.author}</p>
                          <p className="text-xs text-gray-500">{log.book?.genre}</p>
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex items-center space-x-3">
                        <User className="w-8 h-8 text-blue-600 bg-blue-100 rounded-lg p-2" />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {log.user?.name} {log.user?.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">{log.user?.email}</p>
                          <p className="text-xs text-gray-500 capitalize">{log.user?.role}</p>
                        </div>
                      </div>

                      {/* Dates and Status */}
                      <div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Borrowed:</span>
                            <p className="text-gray-900">{new Date(log.borrowDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Due:</span>
                            <p className={`${isOverdue(log.dueDate, log.status) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                              {new Date(log.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          {log.returnDate && (
                            <div>
                              <span className="font-medium text-gray-600">Returned:</span>
                              <p className="text-gray-900">{new Date(log.returnDate).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 w-fit ${
                            isOverdue(log.dueDate, log.status) ? 'bg-red-100 text-red-800' : getStatusColor(log.status)
                          }`}>
                            {getStatusIcon(isOverdue(log.dueDate, log.status) ? 'overdue' : log.status)}
                            <span className="capitalize">
                              {isOverdue(log.dueDate, log.status) ? 'Overdue' : log.status}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {log.status === 'borrowed' && (
                      <div className="ml-4">
                        <button
                          onClick={() => handleReturn(log.id)}
                          disabled={processingReturnId === log.id}
                          className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>{processingReturnId === log.id ? 'Processing...' : 'Return'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {log.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {log.notes}
                      </p>
                    </div>
                  )}

                  {/* Renewal Count */}
                  {log.renewalCount > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Renewed {log.renewalCount} time{log.renewalCount !== 1 ? 's' : ''}
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
                {searchTerm || statusFilter ? 'No logs found' : 'No borrow logs'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter 
                  ? 'Try adjusting your search criteria or filters.'
                  : 'No books have been borrowed yet.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}