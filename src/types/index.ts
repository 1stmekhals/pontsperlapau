export type UserRole = 'admin' | 'staff' | 'student' | 'visitor';
export type UserStatus = 'pending' | 'approved' | 'rejected';
export type GenderType = 'male' | 'female' | 'other';
export type BookStatus = 'available' | 'reserved' | 'maintenance';
export type BorrowStatus = 'borrowed' | 'returned' | 'overdue';
export type ActivityType = 
  | 'user_approved' 
  | 'user_rejected' 
  | 'user_created' 
  | 'user_deleted' 
  | 'user_promoted'
  | 'book_added' 
  | 'book_updated' 
  | 'book_deleted' 
  | 'book_borrowed' 
  | 'book_returned'
  | 'class_created' 
  | 'class_updated' 
  | 'class_deleted' 
  | 'student_enrolled' 
  | 'student_unenrolled';
export type ClassStatus = 'active' | 'inactive' | 'completed';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  name: string;
  father_name?: string;
  last_name: string;
  date_of_birth?: string;
  gender?: GenderType;
  national_id?: string;
  passport_no?: string;
  phone?: string;
  address?: string;
  parent_contact?: string;
  photo?: string;
  job_title?: string;
  job_description?: string;
  join_date?: string;
  leave_date?: string;
  education_documents?: string[];
  cv?: string;
  activity_history?: string;
  short_bio?: string;
  classes_teaching?: string[];
  education_level?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  genre: string;
  publisher?: string;
  published_year?: number;
  total_copies: number;
  available_copies: number;
  description?: string;
  cover_image?: string;
  status: BookStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Class {
  id: string;
  name: string;
  description?: string;
  subject: string;
  level: string;
  teacher_id?: string;
  schedule: any[];
  max_students: number;
  current_students: number;
  enrolled_students?: string[];
  status: ClassStatus;
  start_date: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BorrowLog {
  id: string;
  book_id: string;
  user_id: string;
  borrow_date: string;
  due_date: string;
  return_date?: string;
  status: BorrowStatus;
  renewal_count: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  user_id: string;
  target_id?: string;
  target_type?: string;
  metadata?: any;
  timestamp?: string;
}