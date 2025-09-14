import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import ConfirmDialog from '../../components/ConfirmDialog';
import ClassFormModal from '../../components/ClassFormModal';
import StudentFeedbackModal from '../../components/StudentFeedbackModal';
import { Plus, Settings, Calendar, Users, Clock, Search, X } from 'lucide-react';
import { useClasses } from '../../contexts/ClassContext';
import { useUsers } from '../../contexts/UserContext';
import { useFeedback } from '../../contexts/FeedbackContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { Class } from '../../types/Class';

export default function Classes() {
  const { classes, fetchClasses, addClass, updateClass, deleteClass, enrollStudent, unenrollStudent, loading } = useClasses();
  const { showToast } = useToast();
  const { studentUsers } = useUsers();
  const { authUser } = useAuth();
  const { addFeedback, updateFeedback, getFeedbackByStudentAndClass } = useFeedback();
  const [searchTerm, setSearchTerm] = useState('');
  const [showClassFormModal, setShowClassFormModal] = useState(false);
  const [selectedClassForEdit, setSelectedClassForEdit] = useState<Class | null>(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<Class | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedStudentForFeedback, setSelectedStudentForFeedback] = useState<any>(null);
  const [selectedClassForFeedback, setSelectedClassForFeedback] = useState<Class | null>(null);
  const [existingFeedback, setExistingFeedback] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    classId: string;
    className: string;
  }>({
    isOpen: false,
    classId: '',
    className: ''
  });

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cls.teacher && cls.teacher.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cls.teacher && cls.teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (classId: string) => {
    try {
      await deleteClass(classId);
      showToast('Class deleted successfully!', 'success');
      setConfirmDialog({ isOpen: false, classId: '', className: '' });
    } catch (error) {
      showToast('Failed to delete class', 'error');
    }
  };

  const openConfirmDialog = (classId: string, className: string) => {
    setConfirmDialog({
      isOpen: true,
      classId,
      className
    });
  };

  const handleAddClass = async (classData: Partial<Class>) => {
    try {
      await addClass(classData);
      showToast('Class added successfully!', 'success');
      setShowClassFormModal(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to add class', 'error');
      throw error;
    }
  };

  const handleUpdateClass = async (classId: string, classData: Partial<Class>) => {
    try {
      await updateClass(classId, classData);
      showToast('Class updated successfully!', 'success');
      setShowClassFormModal(false);
      setSelectedClassForEdit(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update class', 'error');
      throw error;
    }
  };

  const handleEditClass = (cls: Class) => {
    setSelectedClassForEdit(cls);
    setShowClassFormModal(true);
  };

  const handleViewStudents = (cls: Class) => {
    setSelectedClassForStudents(cls);
    setShowStudentsModal(true);
  };

  const handleGiveFeedback = async (student: any, cls: Class) => {
    try {
      // Check if feedback already exists
      const existing = await getFeedbackByStudentAndClass(student.id, cls.id);
      setExistingFeedback(existing);
      setSelectedStudentForFeedback(student);
      setSelectedClassForFeedback(cls);
      setShowFeedbackModal(true);
    } catch (error) {
      showToast('Failed to load existing feedback', 'error');
    }
  };

  const handleSaveFeedback = async (feedbackData: any) => {
    try {
      await addFeedback(feedbackData);
      showToast('Feedback saved successfully!', 'success');
    } catch (error) {
      showToast('Failed to save feedback', 'error');
      throw error;
    }
  };

  const handleUpdateFeedback = async (feedbackId: string, feedbackData: any) => {
    try {
      await updateFeedback(feedbackId, feedbackData);
      showToast('Feedback updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update feedback', 'error');
      throw error;
    }
  };

  const handleEnrollStudent = async (classId: string, studentId: string) => {
    try {
      await enrollStudent(classId, studentId);
      showToast('Student enrolled successfully!', 'success');
      // Refresh classes data and update the selected class
      const updatedClasses = await fetchClasses();
      // Update the selected class with fresh data
      const updatedClass = updatedClasses.find(c => c.id === classId);
      if (updatedClass) {
        setSelectedClassForStudents(updatedClass);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to enroll student', 'error');
    }
  };

  const handleUnenrollStudent = async (classId: string, studentId: string) => {
    try {
      await unenrollStudent(classId, studentId);
      showToast('Student unenrolled successfully!', 'success');
      // Refresh classes data and update the selected class
      const updatedClasses = await fetchClasses();
      // Update the selected class with fresh data
      const updatedClass = updatedClasses.find(c => c.id === classId);
      if (updatedClass) {
        setSelectedClassForStudents(updatedClass);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to unenroll student', 'error');
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout title="Class Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
            <p className="text-gray-600">Manage classes, schedules, and enrollments</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => {
                setSelectedClassForEdit(null);
                setShowClassFormModal(true);
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Class</span>
            </button>
            {pendingRequests.length > 0 && (
              <button 
                onClick={() => setShowEnrollmentRequestsModal(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Enrollment Requests ({pendingRequests.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
              </div>
              <Settings className="w-8 h-8 text-indigo-600 bg-indigo-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Classes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classes.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-600 bg-green-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classes.reduce((sum, cls) => sum + cls.currentStudents, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600 bg-blue-100 rounded-lg p-2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Class Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classes.length > 0 ? Math.round(classes.reduce((sum, cls) => sum + cls.currentStudents, 0) / classes.length) : 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600 bg-orange-100 rounded-lg p-2" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search classes by name, subject, or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg text-sm font-medium">
            {filteredClasses.length} Classes
          </div>
        </div>

        {/* Classes Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Classes</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.map((cls) => (
                  <div key={cls.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                        <p className="text-sm text-gray-600">{cls.subject} • {cls.level}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cls.status)}`}>
                        {cls.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Teacher:</span>
                        <span>{cls.teacher ? `${cls.teacher.name} ${cls.teacher.lastName}` : 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Students:</span>
                        <span>{cls.currentStudents}/{cls.maxStudents}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Start Date:</span>
                        <span>{new Date(cls.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Schedule:</h4>
                      <div className="space-y-1">
                        {cls.schedule.map((schedule, index) => (
                          <div key={index} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                            {getDayName(schedule.dayOfWeek)} {schedule.startTime} - {schedule.endTime}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Enrollment</span>
                        <span>{Math.round((cls.currentStudents / cls.maxStudents) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${(cls.currentStudents / cls.maxStudents) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditClass(cls)}
                        className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleViewStudents(cls)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Students
                      </button>
                      <button
                        onClick={() => openConfirmDialog(cls.id, cls.name)}
                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No classes found' : 'No classes'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Try adjusting your search criteria.'
                    : 'Create your first class to get started.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title="Delete Class"
          message={`Are you sure you want to delete "${confirmDialog.className}"? This action cannot be undone and will affect all enrolled students.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          onConfirm={() => handleDelete(confirmDialog.classId)}
          onCancel={() => setConfirmDialog({ isOpen: false, classId: '', className: '' })}
        />

        {/* Class Form Modal */}
        <ClassFormModal
          isOpen={showClassFormModal}
          onClose={() => {
            setShowClassFormModal(false);
            setSelectedClassForEdit(null);
          }}
          classToEdit={selectedClassForEdit}
          onAdd={handleAddClass}
          onUpdate={handleUpdateClass}
        />

        {/* Students Modal */}
        {showStudentsModal && selectedClassForStudents && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Students in {selectedClassForStudents.name}
                  </h2>
                  <p className="text-gray-600">
                    {selectedClassForStudents.currentStudents} of {selectedClassForStudents.maxStudents} students enrolled
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowStudentsModal(false);
                    setSelectedClassForStudents(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {selectedClassForStudents.enrolledStudents && selectedClassForStudents.enrolledStudents.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Enrolled Students</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedClassForStudents.enrolledStudents.map((studentId) => {
                        const student = studentUsers.find(s => s.id === studentId);
                        return student ? (
                          <div key={studentId} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {student.name} {student.lastName}
                                </h4>
                                <p className="text-sm text-gray-600">{student.email}</p>
                                {student.educationLevel && (
                                  <p className="text-sm text-green-600">{student.educationLevel}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={() => handleGiveFeedback(student, selectedClassForStudents)}
                                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                              >
                                Feedback
                              </button>
                              <button
                                onClick={() => handleUnenrollStudent(selectedClassForStudents.id, studentId)}
                                className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors text-sm"
                              >
                                Unenroll
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div key={studentId} className="bg-red-50 rounded-lg p-4">
                            <p className="text-red-600 text-sm">Student not found (ID: {studentId})</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Enrolled</h3>
                    <p className="text-gray-600">This class doesn't have any students enrolled yet.</p>
                  </div>
                )}

                {/* Available Students to Enroll */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Students</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studentUsers
                      .filter(student => !selectedClassForStudents.enrolledStudents?.includes(student.id))
                      .slice(0, 6)
                      .map((student) => (
                        <div key={student.id} className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {student.name} {student.lastName}
                                </h4>
                                <p className="text-sm text-gray-600">{student.email}</p>
                                {student.educationLevel && (
                                  <p className="text-sm text-blue-600">{student.educationLevel}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                handleEnrollStudent(selectedClassForStudents.id, student.id);
                              }}
                              className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                            >
                              Enroll
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                  {studentUsers.filter(student => !selectedClassForStudents.enrolledStudents?.includes(student.id)).length === 0 && (
                    <p className="text-gray-500 text-center py-4">All students are already enrolled in this class.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Feedback Modal */}
        <StudentFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedStudentForFeedback(null);
            setSelectedClassForFeedback(null);
            setExistingFeedback(null);
          }}
          student={selectedStudentForFeedback}
          classInfo={selectedClassForFeedback ? {
            id: selectedClassForFeedback.id,
            name: selectedClassForFeedback.name,
            subject: selectedClassForFeedback.subject
          } : null}
          teacherId={authUser?.id || ''}
          existingFeedback={existingFeedback}
          onSave={handleSaveFeedback}
          onUpdate={handleUpdateFeedback}
        />
      </div>
    </Layout>
  );
}