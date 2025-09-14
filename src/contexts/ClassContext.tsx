import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Class } from '../types';

interface ClassContextType {
  classes: Class[];
  loading: boolean;
  fetchClasses: () => Promise<Class[]>;
  createClass: (classData: Partial<Class>) => Promise<void>;
  updateClass: (classId: string, classData: Partial<Class>) => Promise<void>;
  deleteClass: (classId: string) => Promise<void>;
  enrollStudent: (classId: string, studentId: string) => Promise<void>;
  unenrollStudent: (classId: string, studentId: string) => Promise<void>;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export function ClassProvider({ children }: { children: React.ReactNode }) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClasses = async (): Promise<Class[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const fetchedClasses = data || [];
      setClasses(fetchedClasses);
      return fetchedClasses;
    } catch (error) {
      console.error('Error fetching classes:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createClass = async (classData: Partial<Class>) => {
    try {
      const { error } = await supabase
        .from('classes')
        .insert([classData]);

      if (error) throw error;
      await fetchClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  };

  const updateClass = async (classId: string, classData: Partial<Class>) => {
    try {
      const { error } = await supabase
        .from('classes')
        .update(classData)
        .eq('id', classId);

      if (error) throw error;
      await fetchClasses();
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  };

  const deleteClass = async (classId: string) => {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;
      await fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  };

  const enrollStudent = async (classId: string, studentId: string) => {
    try {
      // Get current class data
      const { data: currentClass, error: fetchError } = await supabase
        .from('classes')
        .select('enrolled_students, current_students, max_students')
        .eq('id', classId)
        .single();

      if (fetchError) throw fetchError;

      const enrolledStudents = currentClass.enrolled_students || [];
      
      // Check if student is already enrolled
      if (enrolledStudents.includes(studentId)) {
        throw new Error('Student already enrolled');
      }

      // Check if class is full
      if (currentClass.current_students >= currentClass.max_students) {
        throw new Error('Class is full');
      }

      // Add student to enrolled list
      const updatedEnrolledStudents = [...enrolledStudents, studentId];

      const { error } = await supabase
        .from('classes')
        .update({
          enrolled_students: updatedEnrolledStudents,
          current_students: updatedEnrolledStudents.length
        })
        .eq('id', classId);

      if (error) throw error;
      await fetchClasses();
    } catch (error) {
      console.error('Error enrolling student:', error);
      throw error;
    }
  };

  const unenrollStudent = async (classId: string, studentId: string) => {
    try {
      // Get current class data
      const { data: currentClass, error: fetchError } = await supabase
        .from('classes')
        .select('enrolled_students')
        .eq('id', classId)
        .single();

      if (fetchError) throw fetchError;

      const enrolledStudents = currentClass.enrolled_students || [];
      
      // Remove student from enrolled list
      const updatedEnrolledStudents = enrolledStudents.filter((id: string) => id !== studentId);

      const { error } = await supabase
        .from('classes')
        .update({
          enrolled_students: updatedEnrolledStudents,
          current_students: updatedEnrolledStudents.length
        })
        .eq('id', classId);

      if (error) throw error;
      await fetchClasses();
    } catch (error) {
      console.error('Error unenrolling student:', error);
      throw error;
    }
  };

  const value = {
    classes,
    loading,
    fetchClasses,
    createClass,
    updateClass,
    deleteClass,
    enrollStudent,
    unenrollStudent,
  };

  return (
    <ClassContext.Provider value={value}>
      {children}
    </ClassContext.Provider>
  );
}

export function useClass() {
  const context = useContext(ClassContext);
  if (context === undefined) {
    throw new Error('useClass must be used within a ClassProvider');
  }
  return context;
}