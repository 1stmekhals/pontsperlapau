import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug environment variables (only show first/last chars for security)
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key format:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...${supabaseAnonKey.substring(supabaseAnonKey.length - 10)}` : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY exists:', !!supabaseAnonKey);
  throw new Error('Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

// Validate API key format
if (!supabaseAnonKey.startsWith('eyJ')) {
  console.error('❌ Invalid Supabase API key format. The anon key should start with "eyJ"');
  throw new Error('Invalid Supabase API key format. Please check your VITE_SUPABASE_ANON_KEY in the .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'staff' | 'student' | 'visitor';
          status: 'pending' | 'approved' | 'rejected';
          name: string;
          father_name: string | null;
          last_name: string;
          date_of_birth: string | null;
          gender: 'male' | 'female' | 'other' | null;
          national_id: string | null;
          passport_no: string | null;
          phone: string | null;
          address: string | null;
          parent_contact: string | null;
          photo: string | null;
          job_title: string | null;
          job_description: string | null;
          join_date: string | null;
          leave_date: string | null;
          education_documents: string[] | null;
          cv: string | null;
          activity_history: string | null;
          short_bio: string | null;
          classes_teaching: string[] | null;
          education_level: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: 'admin' | 'staff' | 'student' | 'visitor';
          status?: 'pending' | 'approved' | 'rejected';
          name: string;
          father_name?: string | null;
          last_name: string;
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | 'other' | null;
          national_id?: string | null;
          passport_no?: string | null;
          phone?: string | null;
          address?: string | null;
          parent_contact?: string | null;
          photo?: string | null;
          job_title?: string | null;
          job_description?: string | null;
          join_date?: string | null;
          leave_date?: string | null;
          education_documents?: string[] | null;
          cv?: string | null;
          activity_history?: string | null;
          short_bio?: string | null;
          classes_teaching?: string[] | null;
          education_level?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'admin' | 'staff' | 'student' | 'visitor';
          status?: 'pending' | 'approved' | 'rejected';
          name?: string;
          father_name?: string | null;
          last_name?: string;
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | 'other' | null;
          national_id?: string | null;
          passport_no?: string | null;
          phone?: string | null;
          address?: string | null;
          parent_contact?: string | null;
          photo?: string | null;
          job_title?: string | null;
          job_description?: string | null;
          join_date?: string | null;
          leave_date?: string | null;
          education_documents?: string[] | null;
          cv?: string | null;
          activity_history?: string | null;
          short_bio?: string | null;
          classes_teaching?: string[] | null;
          education_level?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          isbn: string | null;
          genre: string;
          publisher: string | null;
          published_year: number | null;
          total_copies: number;
          available_copies: number;
          description: string | null;
          cover_image: string | null;
          status: 'available' | 'reserved' | 'maintenance';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          author: string;
          isbn?: string | null;
          genre: string;
          publisher?: string | null;
          published_year?: number | null;
          total_copies?: number;
          available_copies?: number;
          description?: string | null;
          cover_image?: string | null;
          status?: 'available' | 'reserved' | 'maintenance';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string;
          isbn?: string | null;
          genre?: string;
          publisher?: string | null;
          published_year?: number | null;
          total_copies?: number;
          available_copies?: number;
          description?: string | null;
          cover_image?: string | null;
          status?: 'available' | 'reserved' | 'maintenance';
          created_at?: string;
          updated_at?: string;
        };
      };
      borrow_logs: {
        Row: {
          id: string;
          book_id: string;
          user_id: string;
          borrow_date: string;
          due_date: string;
          return_date: string | null;
          status: 'borrowed' | 'returned' | 'overdue';
          renewal_count: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          user_id: string;
          borrow_date?: string;
          due_date: string;
          return_date?: string | null;
          status?: 'borrowed' | 'returned' | 'overdue';
          renewal_count?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          user_id?: string;
          borrow_date?: string;
          due_date?: string;
          return_date?: string | null;
          status?: 'borrowed' | 'returned' | 'overdue';
          renewal_count?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          type: string;
          title: string;
          description: string;
          user_id: string;
          target_id: string | null;
          target_type: string | null;
          metadata: any | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          type: string;
          title: string;
          description: string;
          user_id: string;
          target_id?: string | null;
          target_type?: string | null;
          metadata?: any | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          type?: string;
          title?: string;
          description?: string;
          user_id?: string;
          target_id?: string | null;
          target_type?: string | null;
          metadata?: any | null;
          timestamp?: string;
        };
      };
      classes: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          subject: string;
          level: string;
          teacher_id: string | null;
          schedule: any;
          max_students: number;
          current_students: number;
          enrolled_students: string[];
          status: 'active' | 'inactive' | 'completed';
          start_date: string;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          subject: string;
          level: string;
          teacher_id?: string | null;
          schedule?: any;
          max_students?: number;
          current_students?: number;
          enrolled_students?: string[];
          status?: 'active' | 'inactive' | 'completed';
          start_date?: string;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          subject?: string;
          level?: string;
          teacher_id?: string | null;
          schedule?: any;
          max_students?: number;
          current_students?: number;
          enrolled_students?: string[];
          status?: 'active' | 'inactive' | 'completed';
          start_date?: string;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      student_feedbacks: {
        Row: {
          id: string;
          class_id: string;
          student_id: string;
          teacher_id: string;
          score: 'basic' | 'intermediate' | 'advanced';
          feedback: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          student_id: string;
          teacher_id: string;
          score: 'basic' | 'intermediate' | 'advanced';
          feedback: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          student_id?: string;
          teacher_id?: string;
          score?: 'basic' | 'intermediate' | 'advanced';
          feedback?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}