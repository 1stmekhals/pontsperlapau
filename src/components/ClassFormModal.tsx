import React, { useState, useEffect } from 'react';
import { Class } from '../types/Class';
import { useUsers } from '../contexts/UserContext';
import { X, Save, GraduationCap, Plus, Trash2 } from 'lucide-react';

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  classToEdit?: Class | null;
  onAdd?: (classData: Partial<Class>) => Promise<void>;
  onUpdate?: (classId: string, classData: Partial<Class>) => Promise<void>;
}

export default function ClassFormModal({ 
  isOpen, 
  onClose, 
  classToEdit,
  onAdd,
  onUpdate
}: ClassFormModalProps) {
  const { staffUsers } = useUsers();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Class>>({
    name: '',
    description: '',
    subject: '',
    level: '',
    teacherId: '',
    schedule: [],
    maxStudents: 20,
    status: 'active',
    startDate: '',
    endDate: ''
  });

  const isEditing = !!classToEdit;

  // Initialize form data when modal opens or classToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (classToEdit) {
        setFormData({
          name: classToEdit.name || '',
          description: classToEdit.description || '',
          subject: classToEdit.subject || '',
          level: classToEdit.level || '',
          teacherId: classToEdit.teacherId || '',
          schedule: classToEdit.schedule || [],
          maxStudents: classToEdit.maxStudents || 20,
          status: classToEdit.status || 'active',
          startDate: classToEdit.startDate || '',
          endDate: classToEdit.endDate || ''
        });
      } else {
        setFormData({
          name: '',
          description: '',
          subject: '',
          level: '',
          teacherId: '',
          schedule: [],
          maxStudents: 20,
          status: 'active',
          startDate: '',
          endDate: ''
        });
      }
    }
  }, [isOpen, classToEdit]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!formData.name || !formData.subject || !formData.level || !formData.startDate) {
      alert('Please fill in required fields: Name, Subject, Level, and Start Date');
      return;
    }
    
    setLoading(true);
    try {
      if (isEditing && classToEdit && onUpdate) {
        await onUpdate(classToEdit.id, formData);
      } else if (!isEditing && onAdd) {
        await onAdd(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving class:', error);
    } finally {
      setLoading(false);
    }
  };

  const addScheduleSlot = () => {
    setFormData({
      ...formData,
      schedule: [
        ...(formData.schedule || []),
        { dayOfWeek: 1, startTime: '09:00', endTime: '10:00' }
      ]
    });
  };

  const removeScheduleSlot = (index: number) => {
    const newSchedule = [...(formData.schedule || [])];
    newSchedule.splice(index, 1);
    setFormData({ ...formData, schedule: newSchedule });
  };

  const updateScheduleSlot = (index: number, field: string, value: any) => {
    const newSchedule = [...(formData.schedule || [])];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setFormData({ ...formData, schedule: newSchedule });
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Class' : 'Add New Class'}
              </h2>
              <p className="text-gray-600">
                {isEditing ? 'Update class information' : 'Create a new class'}
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
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Class Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject || ''}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Mathematics, English, Science"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level *
                </label>
                <select
                  required
                  value={formData.level || ''}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Elementary">Elementary</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teacher
                </label>
                <select
                  value={formData.teacherId || ''}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">No teacher assigned</option>
                  {staffUsers.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} {staff.lastName} - {staff.jobTitle || 'Staff'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Students
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxStudents || ''}
                  onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 20 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the class..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Dates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Class Schedule</h3>
              <button
                type="button"
                onClick={addScheduleSlot}
                className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition-colors text-sm flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Time Slot</span>
              </button>
            </div>

            {formData.schedule && formData.schedule.length > 0 ? (
              <div className="space-y-3">
                {formData.schedule.map((slot, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <select
                      value={slot.dayOfWeek}
                      onChange={(e) => updateScheduleSlot(index, 'dayOfWeek', parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map(day => (
                        <option key={day} value={day}>{getDayName(day)}</option>
                      ))}
                    </select>

                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateScheduleSlot(index, 'startTime', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <span className="text-gray-500">to</span>

                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateScheduleSlot(index, 'endTime', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <button
                      type="button"
                      onClick={() => removeScheduleSlot(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <GraduationCap className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No schedule added yet</p>
                <p className="text-xs text-gray-400">Click "Add Time Slot" to create a schedule</p>
              </div>
            )}
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
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : (isEditing ? 'Update Class' : 'Create Class')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}