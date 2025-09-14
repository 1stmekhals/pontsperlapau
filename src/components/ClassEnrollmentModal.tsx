import React, { useState, useEffect } from 'react';
import { X, Save, GraduationCap, Calendar, Users, MessageSquare } from 'lucide-react';
import { Class } from '../types/Class';

interface ClassEnrollmentModalProps {
  isOpen: boolean;
  class: Class | null;
  onClose: () => void;
  onSave: (requestData: {
    classId: string;
    notes?: string;
  }) => Promise<void>;
}

export default function ClassEnrollmentModal({ 
  isOpen, 
  class: classData, 
  onClose, 
  onSave 
}: ClassEnrollmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNotes('');
    }
  }, [isOpen]);

  if (!isOpen || !classData) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave({
        classId: classData.id,
        notes
      });
      onClose();
    } catch (error) {
      console.error('Error creating enrollment request:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const isClassFull = classData.currentStudents >= classData.maxStudents;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Request to Join Class
              </h2>
              <p className="text-gray-600">Request enrollment in "{classData.name}"</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Class Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Class Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Class Name:</span>
                <p className="text-gray-900">{classData.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Subject:</span>
                <p className="text-gray-900">{classData.subject}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Level:</span>
                <p className="text-gray-900">{classData.level}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Teacher:</span>
                <p className="text-gray-900">
                  {classData.teacher ? `${classData.teacher.name} ${classData.teacher.lastName}` : 'N/A'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Students:</span>
                <p className="text-gray-900">{classData.currentStudents}/{classData.maxStudents}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Start Date:</span>
                <p className="text-gray-900">{new Date(classData.startDate).toLocaleDateString()}</p>
              </div>
            </div>

            {classData.description && (
              <div className="mt-4">
                <span className="font-medium text-gray-600">Description:</span>
                <p className="text-gray-900 mt-1">{classData.description}</p>
              </div>
            )}
          </div>

          {/* Schedule */}
          {classData.schedule && classData.schedule.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Class Schedule
              </h4>
              <div className="space-y-1">
                {classData.schedule.map((schedule, index) => (
                  <div key={index} className="text-sm text-blue-700">
                    {getDayName(schedule.dayOfWeek)} • {schedule.startTime} - {schedule.endTime}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enrollment Status */}
          <div className={`rounded-lg p-4 ${isClassFull ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
            <h4 className={`font-medium mb-2 ${isClassFull ? 'text-red-900' : 'text-green-900'}`}>
              <Users className="w-4 h-4 inline mr-1" />
              Enrollment Status
            </h4>
            <p className={`text-sm ${isClassFull ? 'text-red-700' : 'text-green-700'}`}>
              {isClassFull 
                ? '⚠️ This class is currently full. Your request will be placed on a waiting list.'
                : `✅ ${classData.maxStudents - classData.currentStudents} spots available in this class.`
              }
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why do you want to join this class? Any relevant background or experience..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Sending Request...' : 'Send Request'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}