import { supabase } from '../lib/supabase';
import { BookRequest } from '../types/Library';
import { activityService } from './activityService';

// Helper function to convert database book request to application BookRequest type
const convertDbRequestToRequest = (dbRequest: any): BookRequest => ({
  id: dbRequest.id,
  bookId: dbRequest.book_id,
  userId: dbRequest.user_id,
  requestDate: dbRequest.request_date,
  requestedDueDate: dbRequest.requested_due_date,
  status: dbRequest.status,
  notes: dbRequest.notes,
  adminNotes: dbRequest.admin_notes,
  approvedBy: dbRequest.approved_by,
  approvedAt: dbRequest.approved_at,
  createdAt: dbRequest.created_at,
  updatedAt: dbRequest.updated_at,
  book: dbRequest.books ? {
    id: dbRequest.books.id,
    title: dbRequest.books.title,
    author: dbRequest.books.author,
    isbn: dbRequest.books.isbn,
    genre: dbRequest.books.genre,
    publisher: dbRequest.books.publisher,
    publishedYear: dbRequest.books.published_year,
    totalCopies: dbRequest.books.total_copies,
    availableCopies: dbRequest.books.available_copies,
    description: dbRequest.books.description,
    coverImage: dbRequest.books.cover_image,
    status: dbRequest.books.status,
    createdAt: dbRequest.books.created_at,
    updatedAt: dbRequest.books.updated_at
  } : undefined,
  user: dbRequest.users ? {
    id: dbRequest.users.id,
    name: dbRequest.users.name,
    lastName: dbRequest.users.last_name,
    role: dbRequest.users.role,
    email: dbRequest.users.email
  } : undefined,
  approver: dbRequest.approver ? {
    id: dbRequest.approver.id,
    name: dbRequest.approver.name,
    lastName: dbRequest.approver.last_name
  } : undefined
});

export const bookRequestService = {
  async createBookRequest(requestData: {
    bookId: string;
    userId: string;
    requestedDueDate: string;
    notes?: string;
  }): Promise<BookRequest> {
    console.log('📚 BookRequestService.createBookRequest - Creating request');
    
    try {
      const { data: newRequest, error } = await supabase
        .from('book_requests')
        .insert({
          book_id: requestData.bookId,
          user_id: requestData.userId,
          requested_due_date: requestData.requestedDueDate,
          notes: requestData.notes,
          status: 'pending'
        })
        .select(`
          *,
          books (*),
          users!book_requests_user_id_fkey (id, name, last_name, role, email)
        `)
        .single();

      if (error) {
        console.error('❌ BookRequestService.createBookRequest - Error:', error);
        throw error;
      }

      console.log('✅ BookRequestService.createBookRequest - Request created successfully');

      const request = convertDbRequestToRequest(newRequest);

      // Log activity
      try {
        await activityService.logActivity({
          type: 'book_borrowed', // Using closest available type
          title: 'Book Request Created',
          description: `${request.user?.name} requested to borrow "${request.book?.title}"`,
          userId: requestData.userId,
          targetId: request.id,
          targetType: 'book',
          metadata: { 
            bookTitle: request.book?.title,
            requestedDueDate: requestData.requestedDueDate
          }
        });
      } catch (activityError) {
        console.warn('⚠️ BookRequestService.createBookRequest - Activity logging failed:', activityError);
      }

      return request;
    } catch (error) {
      console.error('❌ BookRequestService.createBookRequest - Error:', error);
      throw error;
    }
  },

  async getUserRequests(userId: string): Promise<BookRequest[]> {
    console.log('📚 BookRequestService.getUserRequests - Fetching requests for user:', userId);
    
    try {
      const { data, error } = await supabase
        .from('book_requests')
        .select(`
          *,
          books (*),
          users!book_requests_user_id_fkey (id, name, last_name, role, email),
          approver:users!book_requests_approved_by_fkey (id, name, last_name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ BookRequestService.getUserRequests - Error:', error);
        throw error;
      }

      const requests = data?.map(convertDbRequestToRequest) || [];
      console.log('📊 BookRequestService.getUserRequests - Requests count:', requests.length);
      return requests;
    } catch (error) {
      console.error('❌ BookRequestService.getUserRequests - Error:', error);
      throw error;
    }
  },

  async getAllPendingRequests(): Promise<BookRequest[]> {
    console.log('📚 BookRequestService.getAllPendingRequests - Fetching all pending requests');
    
    try {
      const { data, error } = await supabase
        .from('book_requests')
        .select(`
          *,
          books (*),
          users!book_requests_user_id_fkey (id, name, last_name, role, email),
          approver:users!book_requests_approved_by_fkey (id, name, last_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ BookRequestService.getAllPendingRequests - Error:', error);
        throw error;
      }

      const requests = data?.map(convertDbRequestToRequest) || [];
      console.log('📊 BookRequestService.getAllPendingRequests - Pending requests count:', requests.length);
      return requests;
    } catch (error) {
      console.error('❌ BookRequestService.getAllPendingRequests - Error:', error);
      throw error;
    }
  },

  async approveBookRequest(requestId: string, adminId: string, adminNotes?: string): Promise<void> {
    console.log('✅ BookRequestService.approveBookRequest - Approving request:', requestId);
    
    try {
      // Get request details first
      const { data: request, error: fetchError } = await supabase
        .from('book_requests')
        .select(`
          *,
          books (*),
          users!book_requests_user_id_fkey (id, name, last_name, role, email)
        `)
        .eq('id', requestId)
        .single();

      if (fetchError || !request) {
        throw new Error('Request not found');
      }

      // Check if book is still available
      if (request.books.available_copies <= 0) {
        throw new Error('Book is no longer available');
      }

      // Update request status
      const { error: updateError } = await supabase
        .from('book_requests')
        .update({
          status: 'approved',
          approved_by: adminId,
          approved_at: new Date().toISOString(),
          admin_notes: adminNotes
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('❌ BookRequestService.approveBookRequest - Error:', updateError);
        throw updateError;
      }

      // Create borrow log
      const borrowDate = new Date().toISOString().split('T')[0];
      const { error: borrowError } = await supabase
        .from('borrow_logs')
        .insert({
          book_id: request.book_id,
          user_id: request.user_id,
          borrow_date: borrowDate,
          due_date: request.requested_due_date,
          status: 'borrowed',
          notes: `Approved request: ${request.notes || 'No notes'}`
        });

      if (borrowError) {
        console.error('❌ BookRequestService.approveBookRequest - Borrow log error:', borrowError);
        throw borrowError;
      }

      // Update book available copies
      const { error: bookUpdateError } = await supabase
        .from('books')
        .update({ available_copies: request.books.available_copies - 1 })
        .eq('id', request.book_id);

      if (bookUpdateError) {
        console.error('❌ BookRequestService.approveBookRequest - Book update error:', bookUpdateError);
        throw bookUpdateError;
      }

      console.log('✅ BookRequestService.approveBookRequest - Request approved successfully');

      // Log activity
      try {
        await activityService.logActivity({
          type: 'book_borrowed',
          title: 'Book Request Approved',
          description: `${request.users.name} ${request.users.last_name}'s request for "${request.books.title}" was approved`,
          userId: adminId,
          targetId: requestId,
          targetType: 'book',
          metadata: { 
            bookTitle: request.books.title,
            requesterName: `${request.users.name} ${request.users.last_name}`,
            dueDate: request.requested_due_date
          }
        });
      } catch (activityError) {
        console.warn('⚠️ BookRequestService.approveBookRequest - Activity logging failed:', activityError);
      }
    } catch (error) {
      console.error('❌ BookRequestService.approveBookRequest - Error:', error);
      throw error;
    }
  },

  async rejectBookRequest(requestId: string, adminId: string, adminNotes?: string): Promise<void> {
    console.log('❌ BookRequestService.rejectBookRequest - Rejecting request:', requestId);
    
    try {
      // Get request details first
      const { data: request, error: fetchError } = await supabase
        .from('book_requests')
        .select(`
          *,
          books (*),
          users!book_requests_user_id_fkey (id, name, last_name, role, email)
        `)
        .eq('id', requestId)
        .single();

      if (fetchError || !request) {
        throw new Error('Request not found');
      }

      // Update request status
      const { error: updateError } = await supabase
        .from('book_requests')
        .update({
          status: 'rejected',
          approved_by: adminId,
          approved_at: new Date().toISOString(),
          admin_notes: adminNotes
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('❌ BookRequestService.rejectBookRequest - Error:', updateError);
        throw updateError;
      }

      console.log('✅ BookRequestService.rejectBookRequest - Request rejected successfully');

      // Log activity
      try {
        await activityService.logActivity({
          type: 'book_borrowed', // Using closest available type
          title: 'Book Request Rejected',
          description: `${request.users.name} ${request.users.last_name}'s request for "${request.books.title}" was rejected`,
          userId: adminId,
          targetId: requestId,
          targetType: 'book',
          metadata: { 
            bookTitle: request.books.title,
            requesterName: `${request.users.name} ${request.users.last_name}`,
            reason: adminNotes
          }
        });
      } catch (activityError) {
        console.warn('⚠️ BookRequestService.rejectBookRequest - Activity logging failed:', activityError);
      }
    } catch (error) {
      console.error('❌ BookRequestService.rejectBookRequest - Error:', error);
      throw error;
    }
  }
};