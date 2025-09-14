import React, { useState, useEffect } from 'react';
import { User } from '../types/User';
import { X, Save, User as UserIcon, Mail, Phone, MapPin, Calendar, Car as IdCard, FileText, Briefcase, Eye, Download } from 'lucide-react';
import FileUpload from './FileUpload';

interface FormData extends Partial<User> {
  photo?: string[];
  cv?: string[];
  educationDocuments?: string[];
}

interface UserDetailsModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (userId: string, userData: Partial<User>) => Promise<void>;
  currentUserRole: string;
}

export default function UserDetailsModal({ 
  isOpen, 
  user, 
  onClose, 
  onSave, 
  currentUserRole 
}: UserDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        fatherName: user.fatherName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        nationalId: user.nationalId || '',
        passportNo: user.passportNo || '',
        parentContact: user.parentContact || '',
        jobTitle: user.jobTitle || '',
        jobDescription: user.jobDescription || '',
        joinDate: user.joinDate || '',
        leaveDate: user.leaveDate || '',
        shortBio: user.shortBio || '',
        educationLevel: user.educationLevel || '',
        activityHistory: user.activityHistory || '',
        photo: user.photo ? [user.photo] : [],
        cv: user.cv ? [user.cv] : [],
        educationDocuments: user.educationDocuments || []
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await onSave(user.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        fatherName: user.fatherName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        nationalId: user.nationalId || '',
        passportNo: user.passportNo || '',
        parentContact: user.parentContact || '',
        jobTitle: user.jobTitle || '',
        jobDescription: user.jobDescription || '',
        joinDate: user.joinDate || '',
        leaveDate: user.leaveDate || '',
        shortBio: user.shortBio || '',
        educationLevel: user.educationLevel || '',
        activityHistory: user.activityHistory || '',
        photo: user.photo ? [user.photo] : [],
        cv: user.cv ? [user.cv] : [],
        educationDocuments: user.educationDocuments || []
      });
    }
  };

  const getRoleColor = () => {
    switch (user.role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'staff': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      case 'visitor': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = () => {
    switch (user.status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              {user.photo && user.photo.startsWith('data:image/') ? (
                <img 
                  src={user.photo} 
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user.name} {user.lastName}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor()}`}>
                  {user.role.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                  {user.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {currentUserRole === 'admin' && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
            )}
            {isEditing && (
              <>
                <button
                  onClick={handleCancel}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save'}</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.name || 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.lastName || 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.fatherName || ''}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.fatherName || 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.dateOfBirth || ''}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">
                    {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                {isEditing ? (
                  <select
                    value={formData.gender || ''}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-900 capitalize">{user.gender || 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.nationalId || ''}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.nationalId || 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passport No</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.passportNo || ''}
                    onChange={(e) => setFormData({ ...formData, passportNo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.passportNo || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.email || 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.phone || 'N/A'}</p>
                )}
              </div>

              {user.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Contact</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.parentContact || ''}
                      onChange={(e) => setFormData({ ...formData, parentContact: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{user.parentContact || 'N/A'}</p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{user.address || 'N/A'}</p>
              )}
            </div>
          </div>

          {/* Role-specific Information */}
          {user.role === 'staff' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.jobTitle || ''}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{user.jobTitle || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.joinDate || ''}
                      onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leave Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.leaveDate || ''}
                      onChange={(e) => setFormData({ ...formData, leaveDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {user.leaveDate ? new Date(user.leaveDate).toLocaleDateString() : 'N/A'}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={formData.jobDescription || ''}
                    onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.jobDescription || 'N/A'}</p>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Bio</label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={formData.shortBio || ''}
                    onChange={(e) => setFormData({ ...formData, shortBio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.shortBio || 'N/A'}</p>
                )}
              </div>
            </div>
          )}

          {user.role === 'student' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                  {isEditing ? (
                    <select
                      value={formData.educationLevel || ''}
                      onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Education Level</option>
                      <option value="Elementary">Elementary</option>
                      <option value="Middle School">Middle School</option>
                      <option value="High School">High School</option>
                      <option value="University">University</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{user.educationLevel || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Files Section */}
          {isEditing && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Files & Documents
              </h3>
              
              <div className="space-y-6">
                <FileUpload
                  label="Profile Photo"
                  accept="image/*"
                  files={formData.photo || []}
                  onFilesChange={(files) => setFormData({ ...formData, photo: files })}
                  showPreview={true}
                />

                {user.role === 'staff' && (
                  <>
                    <FileUpload
                      label="CV/Resume"
                      accept=".pdf,.doc,.docx"
                      files={formData.cv || []}
                      onFilesChange={(files) => setFormData({ ...formData, cv: files })}
                    />

                    <FileUpload
                      label="Education Documents"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      multiple={true}
                      files={formData.educationDocuments || []}
                      onFilesChange={(files) => setFormData({ ...formData, educationDocuments: files })}
                      maxFiles={5}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* View Files Section (when not editing) */}
          {!isEditing && (user.role === 'staff') && (user.cv || (user.educationDocuments && user.educationDocuments.length > 0)) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Files & Documents
              </h3>
              
              <div className="space-y-4">
                {user.cv && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">CV/Resume:</h4>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">📄</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">CV/Resume</p>
                          <p className="text-xs text-gray-500">Document file</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          className="p-1 text-green-600 hover:text-green-800 transition-colors"
                          title="Download CV"
                          onClick={() => {
                            if (user.cv) {
                              const link = document.createElement('a');
                              link.href = user.cv;
                              link.download = `CV_Resume_${user.name}_${user.lastName}_${Date.now()}.pdf`;
                              link.style.display = 'none';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="View CV"
                          onClick={() => {
                            if (user.cv && user.cv.startsWith('data:')) {
                              const newWindow = window.open();
                              if (newWindow) {
                                if (user.cv.startsWith('data:image/')) {
                                  newWindow.document.write(`
                                    <!DOCTYPE html>
                                    <html>
                                      <head>
                                        <title>CV/Resume</title>
                                        <style>
                                          body { margin: 0; padding: 20px; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                                          img { max-width: 100%; max-height: 100%; object-fit: contain; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                                        </style>
                                      </head>
                                      <body>
                                        <img src="${user.cv}" alt="CV/Resume" />
                                      </body>
                                    </html>
                                  `);
                                  newWindow.document.close();
                                } else if (user.cv.startsWith('data:application/pdf')) {
                                  // For PDFs, open directly in new tab
                                  newWindow.location.href = user.cv;
                                } else {
                                  newWindow.document.write(`
                                    <!DOCTYPE html>
                                    <html>
                                      <head>
                                        <title>CV/Resume</title>
                                        <style>
                                          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                                          .container { max-width: 800px; margin: 0 auto; text-align: center; }
                                          .download-btn { background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; margin-top: 20px; }
                                          .download-btn:hover { background: #2563eb; }
                                        </style>
                                      </head>
                                      <body>
                                        <div class="container">
                                          <h2>CV/Resume</h2>
                                          <p>This document cannot be previewed directly in the browser.</p>
                                          <button class="download-btn" onclick="downloadFile()">Download CV/Resume</button>
                                          <script>
                                            function downloadFile() {
                                              const link = document.createElement('a');
                                              link.href = '${user.cv}';
                                              link.download = 'CV_Resume_${Date.now()}';
                                              link.click();
                                            }
                                          </script>
                                        </div>
                                      </body>
                                    </html>
                                  `);
                                  newWindow.document.close();
                                }
                              }
                            }
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {user.educationDocuments && user.educationDocuments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Education Documents:</h4>
                    <div className="space-y-2">
                      {user.educationDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">📄</span>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Education Document {index + 1}</p>
                              <p className="text-xs text-gray-500">Document file</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              className="p-1 text-green-600 hover:text-green-800 transition-colors"
                              title="Download document"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = doc;
                                link.download = `Education_Document_${index + 1}_${user.name}_${user.lastName}_${Date.now()}`;
                                link.style.display = 'none';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                              title="View document"
                              onClick={() => {
                                if (doc && doc.startsWith('data:')) {
                                  const newWindow = window.open();
                                  if (newWindow) {
                                    if (doc.startsWith('data:image/')) {
                                      newWindow.document.write(`
                                        <!DOCTYPE html>
                                        <html>
                                          <head>
                                            <title>Education Document ${index + 1}</title>
                                            <style>
                                              body { margin: 0; padding: 20px; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                                              img { max-width: 100%; max-height: 100%; object-fit: contain; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                                            </style>
                                          </head>
                                          <body>
                                            <img src="${doc}" alt="Education Document ${index + 1}" />
                                          </body>
                                        </html>
                                      `);
                                      newWindow.document.close();
                                    } else if (doc.startsWith('data:application/pdf')) {
                                      // For PDFs, open directly in new tab
                                      newWindow.location.href = doc;
                                    } else {
                                      newWindow.document.write(`
                                        <!DOCTYPE html>
                                        <html>
                                          <head>
                                            <title>Education Document ${index + 1}</title>
                                            <style>
                                              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                                              .container { max-width: 800px; margin: 0 auto; text-align: center; }
                                              .download-btn { background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; margin-top: 20px; }
                                              .download-btn:hover { background: #2563eb; }
                                            </style>
                                          </head>
                                          <body>
                                            <div class="container">
                                              <h2>Education Document ${index + 1}</h2>
                                              <p>This document cannot be previewed directly in the browser.</p>
                                              <button class="download-btn" onclick="downloadFile()">Download Document</button>
                                              <script>
                                                function downloadFile() {
                                                  const link = document.createElement('a');
                                                  link.href = '${doc}';
                                                  link.download = 'Education_Document_${index + 1}_${Date.now()}';
                                                  link.click();
                                                }
                                              </script>
                                            </div>
                                          </body>
                                        </html>
                                      `);
                                      newWindow.document.close();
                                    }
                                  }
                                }
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Activity History
            </h3>
            {isEditing ? (
              <textarea
                rows={4}
                value={formData.activityHistory || ''}
                onChange={(e) => setFormData({ ...formData, activityHistory: e.target.value })}
                placeholder="Add notes about user's activity history..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{user.activityHistory || 'No activity history recorded'}</p>
            )}
          </div>

          {/* System Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">User ID:</span>
                <p className="text-gray-900 font-mono">{user.id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Created:</span>
                <p className="text-gray-900">{new Date(user.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Last Updated:</span>
                <p className="text-gray-900">{new Date(user.updatedAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <p className="text-gray-900 capitalize">{user.status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}