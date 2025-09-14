import React, { useState, useEffect } from 'react';
import { X, Save, Star, MessageSquare, User } from 'lucide-react';
import { StudentFeedback } from '../types/Class';

interface StudentFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    name: string;
    lastName: string;
    educationLevel?: string;
  } | null;
  classInfo: {
    id: string;
    name: string;
    subject: string;
  } | null;
  teacherId: string;
  existingFeedback?: StudentFeedback | null;
  onSave: (feedbackData: {
    classId: string;
    studentId: string;
    teacherId: string;
    score: 'basic' | 'intermediate' | 'advanced';
    feedback: string;
  }) => Promise<void>;
  onUpdate?: (feedbackId: string, feedbackData: {
    score: 'basic' | 'intermediate' | 'advanced';
    feedback: string;
  }) => Promise<void>;
}

export default function StudentFeedbackModal({
  isOpen,
  onClose,
  student,
  classInfo,
  teacherId,
  existingFeedback,
  onSave,
  onUpdate
}: StudentFeedbackModalProps) {
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<'basic' | 'intermediate' | 'advanced'>('basic');
  const [feedback, setFeedback] = useState('');

  const isEditing = !!existingFeedback;

  useEffect(() => {
    if (isOpen) {
      if (existingFeedback) {
        setScore(existingFeedback.score);
        setFeedback(existingFeedback.feedback);
      } else {
        setScore('basic');
        setFeedback('');
      }
    }
  }, [isOpen, existingFeedback]);

  if (!isOpen || !student || !classInfo) return null;

  const handleSave = async () => {
    if (!feedback.trim()) {
      alert('Please provide feedback for the student');
      return;
    }

    setLoading(true);
    try {
      if (isEditing && existingFeedback && onUpdate) {
        await onUpdate(existingFeedback.id, { score, feedback });
      } else {
        await onSave({
          classId: classInfo.id,
          studentId: student.id,
          teacherId,
          score,
          feedback
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (scoreLevel: string) => {
    switch (scoreLevel) {
      case 'basic': return 'bg-red-100 text-red-800 border-red-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreIcon = (scoreLevel: string) => {
    switch (scoreLevel) {
      case 'basic': return '⭐';
      case 'intermediate': return '⭐⭐';
      case 'advanced': return '⭐⭐⭐';
      default: return '⭐';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit' : 'Add'} Student Feedback
              </h2>
              <p className="text-gray-600">
                {student.name} {student.lastName} - {classInfo.name}
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Student Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Student Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Name:</span>
                <p className="text-gray-900">{student.name} {student.lastName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Education Level:</span>
                <p className="text-gray-900">{student.educationLevel || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Class:</span>
                <p className="text-gray-900">{classInfo.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Subject:</span>
                <p className="text-gray-900">{classInfo.subject}</p>
              </div>
            </div>
          </div>

          {/* Score Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Star className="w-4 h-4 inline mr-1" />
              Performance Level
            </label>
            <div className="grid grid-cols-3 gap-4">
              {(['basic', 'intermediate', 'advanced'] as const).map((level) => (
                <label
                  key={level}
                  className={`
                    relative flex cursor-pointer rounded-lg border-2 p-4 focus:outline-none transition-all
                    ${score === level 
                      ? getScoreColor(level) + ' border-current' 
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="score"
                    value={level}
                    checked={score === level}
                    onChange={(e) => setScore(e.target.value as any)}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center w-full">
                    <div className="text-2xl mb-2">{getScoreIcon(level)}</div>
                    <div className={`text-sm font-medium capitalize ${
                      score === level ? 'text-current' : 'text-gray-900'
                    }`}>
                      {level}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      {level === 'basic' && 'Needs improvement'}
                      {level === 'intermediate' && 'Good progress'}
                      {level === 'advanced' && 'Excellent work'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Feedback Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Detailed Feedback *
            </label>
            <textarea
              rows={6}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide detailed feedback about the student's performance, areas of strength, and areas for improvement..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {feedback.length}/500 characters
            </p>
          </div>

          {/* Preview */}
          {feedback.trim() && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Feedback Preview</h4>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{getScoreIcon(score)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(score)}`}>
                  {score.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-blue-800 leading-relaxed">{feedback}</p>
            </div>
          )}

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
              disabled={loading || !feedback.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : (isEditing ? 'Update Feedback' : 'Save Feedback')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}