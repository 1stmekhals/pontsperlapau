import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { feedbackService } from '../services/feedbackService';
import { StudentFeedback } from '../types/Class';
import { useActivity } from './ActivityContext';
import { useAuth } from './AuthContext';

interface FeedbackContextType {
  feedbacks: StudentFeedback[];
  loading: boolean;
  fetchClassFeedbacks: (classId: string) => Promise<void>;
  fetchStudentFeedbacks: (studentId: string) => Promise<void>;
  addFeedback: (feedbackData: Omit<StudentFeedback, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateFeedback: (feedbackId: string, feedbackData: Partial<StudentFeedback>) => Promise<void>;
  deleteFeedback: (feedbackId: string) => Promise<void>;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}

interface FeedbackProviderProps {
  children: ReactNode;
}

export function FeedbackProvider({ children }: FeedbackProviderProps) {
  const [feedbacks, setFeedbacks] = useState<StudentFeedback[]>([]);
  const [loading, setLoading] = useState(false);
  const { fetchActivities } = useActivity();
  const { user: authUser } = useAuth();

  const fetchClassFeedbacks = useCallback(async (classId: string) => {
    setLoading(true);
    try {
      const fetchedFeedbacks = await feedbackService.getClassFeedbacks(classId);
      setFeedbacks(fetchedFeedbacks);
    } catch (error) {
      console.error('Error fetching class feedbacks:', error);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudentFeedbacks = useCallback(async (studentId: string) => {
    setLoading(true);
    try {
      const fetchedFeedbacks = await feedbackService.getStudentFeedbacks(studentId);
      setFeedbacks(fetchedFeedbacks);
    } catch (error) {
      console.error('Error fetching student feedbacks:', error);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addFeedback = async (feedbackData: Omit<StudentFeedback, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!authUser?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      const newFeedback = await feedbackService.createFeedback(feedbackData, authUser.id);
      setFeedbacks(prev => [newFeedback, ...prev]);
      await fetchActivities({ limit: 10 });
    } catch (error) {
      console.error('Error adding feedback:', error);
      throw error;
    }
  };

  const updateFeedback = async (feedbackId: string, feedbackData: Partial<StudentFeedback>) => {
    if (!authUser?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      await feedbackService.updateFeedback(feedbackId, feedbackData, authUser.id);
      setFeedbacks(prev => 
        prev.map(feedback => 
          feedback.id === feedbackId 
            ? { ...feedback, ...feedbackData }
            : feedback
        )
      );
      await fetchActivities({ limit: 10 });
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  };

  const deleteFeedback = async (feedbackId: string) => {
    if (!authUser?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      await feedbackService.deleteFeedback(feedbackId, authUser.id);
      setFeedbacks(prev => prev.filter(feedback => feedback.id !== feedbackId));
      await fetchActivities({ limit: 10 });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  };

  const value = {
    feedbacks,
    loading,
    fetchClassFeedbacks,
    fetchStudentFeedbacks,
    addFeedback,
    updateFeedback,
    deleteFeedback
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
}