export interface Class {
  id: string;
  name: string;
  description?: string;
  subject: string;
  level: string;
  teacherId?: string; // Staff member assigned as teacher
  schedule: {
    dayOfWeek: number; // 0-6 (Sunday to Saturday)
    startTime: string;
    endTime: string;
  }[];
  maxStudents: number;
  currentStudents: number;
  enrolledStudents: string[]; // Array of student IDs
  status: 'active' | 'inactive' | 'completed';
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  
  // Populated fields
  teacher?: {
    id: string;
    name: string;
    lastName: string;
    jobTitle: string;
  };
  students?: {
    id: string;
    name: string;
    lastName: string;
    educationLevel: string;
  }[];
}

export interface StudentFeedback {
  id: string;
  classId: string;
  studentId: string;
  teacherId: string;
  score: 'basic' | 'intermediate' | 'advanced';
  feedback: string;
  createdAt: string;
  updatedAt: string;
  
  // Populated fields
  student?: {
    id: string;
    name: string;
    lastName: string;
    educationLevel: string;
  };
  teacher?: {
    id: string;
    name: string;
    lastName: string;
    jobTitle: string;
  };
  class?: {
    id: string;
    name: string;
    subject: string;
  };
}

export interface ClassEnrollmentRequest {
  id: string;
  classId: string;
  studentId: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  adminNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Populated fields
  class?: {
    id: string;
    name: string;
    subject: string;
    level: string;
    maxStudents: number;
    currentStudents: number;
  };
  student?: {
    id: string;
    name: string;
    lastName: string;
    educationLevel?: string;
  };
  approver?: {
    id: string;
    name: string;
    lastName: string;
  };
}