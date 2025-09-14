import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { classEnrollmentService } from '../services/classEnrollmentService';
import { ClassEnrollmentRequest } from '../types/Class';
import { useActivity } from './ActivityContext';
import { useAuth } from './AuthContext';

interface ClassEnrollmentContextType {
  requests: ClassEnrollmentRequest[];
  studentRequests: ClassEnrollmentRequest[];
  pendingRequests: ClassEnrollmentRequest[];
  loading: boolean;
  fetchStudentRequests: () => Promise<void>;
  fetchPendingRequests: () => Promise<void>;
  createEnrollmentRequest: (requestData: {
    classId: string;
    notes?: string;
  }) => Promise<void>;
  approveEnrollmentRequest: (requestId: string, adminNotes?: string) => Promise<void>;
  rejectEnrollmentRequest: (requestId: string, adminNotes?: string) => Promise<void>;
}

const ClassEnrollmentContext = createContext<ClassEnrollmentContextType | null>(null);

export function useClassEnrollment() {
  const context = useContext(ClassEnrollmentContext);
  if (!context) {
    throw new Error('useClassEnrollment must be used within a ClassEnrollmentProvider');
  }
  return context;
}

interface ClassEnrollmentProviderProps {
  children: ReactNode;
}

export function ClassEnrollmentProvider({ children }: ClassEnrollmentProviderProps) {
  const [requests, setRequests] = useState<ClassEnrollmentRequest[]>([]);
  const [studentRequests, setStudentRequests] = useState<ClassEnrollmentRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ClassEnrollmentRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const { fetchActivities } = useActivity();
  const { user: authUser } = useAuth();

  const fetchStudentRequests = useCallback(async () => {
    if (!authUser?.id) return;
    
    setLoading(true);
    try {
      const fetchedRequests = await classEnrollmentService.getStudentRequests(authUser.id);
      setStudentRequests(fetchedRequests);
      setRequests(fetchedRequests);
    } catch (error) {
      console.error('Error fetching student requests:', error);
      setStudentRequests([]);
    } finally {
      setLoading(false);
    }
  }, [authUser?.id]);

  const fetchPendingRequests = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedRequests = await classEnrollmentService.getAllPendingRequests();
      setPendingRequests(fetchedRequests);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEnrollmentRequest = async (requestData: {
    classId: string;
    notes?: string;
  }) => {
    if (!authUser?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      await classEnrollmentService.createEnrollmentRequest({
        ...requestData,
        studentId: authUser.id
      });
      await fetchStudentRequests();
      await fetchActivities({ limit: 10 });
    } catch (error) {
      console.error('Error creating enrollment request:', error);
      throw error;
    }
  };

  const approveEnrollmentRequest = async (requestId: string, adminNotes?: string) => {
    if (!authUser?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      await classEnrollmentService.approveEnrollmentRequest(requestId, authUser.id, adminNotes);
      await fetchPendingRequests();
      await fetchActivities({ limit: 10 });
    } catch (error) {
      console.error('Error approving enrollment request:', error);
      throw error;
    }
  };

  const rejectEnrollmentRequest = async (requestId: string, adminNotes?: string) => {
    if (!authUser?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      await classEnrollmentService.rejectEnrollmentRequest(requestId, authUser.id, adminNotes);
      await fetchPendingRequests();
      await fetchActivities({ limit: 10 });
    } catch (error) {
      console.error('Error rejecting enrollment request:', error);
      throw error;
    }
  };

  const value = {
    requests,
    studentRequests,
    pendingRequests,
    loading,
    fetchStudentRequests,
    fetchPendingRequests,
    createEnrollmentRequest,
    approveEnrollmentRequest,
    rejectEnrollmentRequest
  };

  return (
    <ClassEnrollmentContext.Provider value={value}>
      {children}
    </ClassEnrollmentContext.Provider>
  );
}