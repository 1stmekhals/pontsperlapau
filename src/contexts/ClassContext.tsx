import React, { createContext, useContext, useState } from 'react';
import { classService } from '../services/classService';
import { supabase } from '../lib/supabase';
import { Class } from '../types/Class';
import { useAuth } from './AuthContext';

interface ClassContextType {
  classes: Class[];
  loading: boolean;
  fetchClasses: () => Promise<Class[]>;
  addClass: (classData: Partial<Class>) => Promise<void>;
  updateClass: (classId: string, classData: Partial<Class>) => Promise<void>;
  deleteClass: (classId: string) => Promise<void>;
  enrollStudent: (classId: string, studentId: string) => Promise<void>;
  unenrollStudent: (classId: string, studentId: string) => Promise<void>;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export function ClassProvider({ children }: { children: React.ReactNode }) {
  const { authUser } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClasses = async (): Promise<Class[]> => {
    setLoading(true);
    try {
      const fetchedClasses = await classService.getAllClasses();
      setClasses(fetchedClasses);
      return fetchedClasses;
    } catch (error) {
      console.error('Error fetching classes:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addClass = async (classData: Partial<Class>) => {
    try {
      if (!authUser?.id) throw new Error('Not authenticated');
      await classService.createClass(classData, authUser.id);
      await fetchClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  };

  const updateClass = async (classId: string, classData: Partial<Class>) => {
    try {
      if (!authUser?.id) throw new Error('Not authenticated');
      await classService.updateClass(classId, classData, authUser.id);
      await fetchClasses();
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  };

  const deleteClass = async (classId: string) => {
    try {
      if (!authUser?.id) throw new Error('Not authenticated');
      await classService.deleteClass(classId, authUser.id);
      await fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  };

  const enrollStudent = async (classId: string, studentId: string) => {
    try {
      if (!authUser?.id) throw new Error('Not authenticated');
      await classService.enrollStudent(classId, studentId, authUser.id);
      await fetchClasses();
    } catch (error) {
      console.error('Error enrolling student:', error);
      throw error;
    }
  };

  const unenrollStudent = async (classId: string, studentId: string) => {
    try {
      if (!authUser?.id) throw new Error('Not authenticated');
      await classService.unenrollStudent(classId, studentId, authUser.id);
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
    addClass,
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
export function useClasses() {
  const context = useContext(ClassContext);
  if (context === undefined) {
    throw new Error('useClasses must be used within a ClassProvider');
  }
  return context;
}