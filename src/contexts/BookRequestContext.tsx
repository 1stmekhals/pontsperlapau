import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { bookRequestService } from '../services/bookRequestService';
import { BookRequest } from '../types/Library';
import { useActivity } from './ActivityContext';
import { useAuth } from './AuthContext';

interface BookRequestContextType {
  requests: BookRequest[];
  userRequests: BookRequest[];
  pendingRequests: BookRequest[];
  loading: boolean;
  fetchUserRequests: () => Promise<void>;
  fetchPendingRequests: () => Promise<void>;
  createBookRequest: (requestData: {
    bookId: string;
    requestedDueDate: string;
    notes?: string;
  }) => Promise<void>;
  approveBookRequest: (requestId: string, adminNotes?: string) => Promise<void>;
  rejectBookRequest: (requestId: string, adminNotes?: string) => Promise<void>;
}

const BookRequestContext = createContext<BookRequestContextType | null>(null);

export function useBookRequests() {
  const context = useContext(BookRequestContext);
  if (!context) {
    throw new Error('useBookRequests must be used within a BookRequestProvider');
  }
  return context;
}

interface BookRequestProviderProps {
  children: ReactNode;
}

export function BookRequestProvider({ children }: BookRequestProviderProps) {
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [userRequests, setUserRequests] = useState<BookRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const { fetchActivities } = useActivity();
  const { user: authUser } = useAuth();

  const fetchUserRequests = useCallback(async () => {
    if (!authUser?.id) return;
    
    setLoading(true);
    try {
      const fetchedRequests = await bookRequestService.getUserRequests(authUser.id);
      setUserRequests(fetchedRequests);
      setRequests(fetchedRequests);
    } catch (error) {
      console.error('Error fetching user requests:', error);
      setUserRequests([]);
    } finally {
      setLoading(false);
    }
  }, [authUser?.id]);

  const fetchPendingRequests = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedRequests = await bookRequestService.getAllPendingRequests();
      setPendingRequests(fetchedRequests);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBookRequest = async (requestData: {
    bookId: string;
    requestedDueDate: string;
    notes?: string;
  }) => {
    if (!authUser?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      await bookRequestService.createBookRequest({
        ...requestData,
        userId: authUser.id
      });
      await fetchUserRequests();
      await fetchActivities({ limit: 10 });
    } catch (error) {
      console.error('Error creating book request:', error);
      throw error;
    }
  };

  const approveBookRequest = async (requestId: string, adminNotes?: string) => {
    if (!authUser?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      await bookRequestService.approveBookRequest(requestId, authUser.id, adminNotes);
      await fetchPendingRequests();
      await fetchActivities({ limit: 10 });
    } catch (error) {
      console.error('Error approving book request:', error);
      throw error;
    }
  };

  const rejectBookRequest = async (requestId: string, adminNotes?: string) => {
    if (!authUser?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      await bookRequestService.rejectBookRequest(requestId, authUser.id, adminNotes);
      await fetchPendingRequests();
      await fetchActivities({ limit: 10 });
    } catch (error) {
      console.error('Error rejecting book request:', error);
      throw error;
    }
  };

  const value = {
    requests,
    userRequests,
    pendingRequests,
    loading,
    fetchUserRequests,
    fetchPendingRequests,
    createBookRequest,
    approveBookRequest,
    rejectBookRequest
  };

  return (
    <BookRequestContext.Provider value={value}>
      {children}
    </BookRequestContext.Provider>
  );
}