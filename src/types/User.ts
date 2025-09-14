export interface User {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'student' | 'visitor';
  status: 'pending' | 'approved' | 'rejected';
  name: string;
  fatherName?: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  nationalId?: string;
  passportNo?: string;
  phone?: string;
  address?: string;
  parentContact?: string;
  photo?: string;
  jobTitle?: string;
  jobDescription?: string;
  joinDate?: string;
  leaveDate?: string;
  educationDocuments?: string[];
  cv?: string;
  activityHistory?: string;
  shortBio?: string;
  classesTeaching?: string[];
  educationLevel?: string;
  createdAt: string;
  updatedAt: string;
}