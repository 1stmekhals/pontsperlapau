import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Book, BorrowLog } from '../types/Library';
import { activityService } from '../services/activityService';

interface LibraryContextType {
  books: Book[];
  borrowLogs: BorrowLog[];
  loading: boolean;
  fetchBooks: () => Promise<void>;
  fetchBorrowLogs: () => Promise<void>;
  addBook: (bookData: Partial<Book>) => Promise<void>;
  updateBook: (bookId: string, bookData: Partial<Book>) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;
  borrowBook: (bookId: string, userId: string, borrowDate: string, dueDate: string, notes?: string) => Promise<void>;
  returnBook: (borrowLogId: string) => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowLogs, setBorrowLogs] = useState<BorrowLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert database format to application format
      const convertedBooks = data?.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        genre: book.genre,
        publisher: book.publisher,
        publishedYear: book.published_year,
        totalCopies: book.total_copies,
        availableCopies: book.available_copies,
        description: book.description,
        coverImage: book.cover_image,
        status: book.status,
        createdAt: book.created_at,
        updatedAt: book.updated_at
      })) || [];
      
      setBooks(convertedBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('borrow_logs')
        .select(`
          *,
          books (*),
          users (id, name, last_name, role, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert database format to application format
      const convertedLogs = data?.map(log => ({
        id: log.id,
        bookId: log.book_id,
        userId: log.user_id,
        borrowDate: log.borrow_date,
        dueDate: log.due_date,
        returnDate: log.return_date,
        status: log.status,
        renewalCount: log.renewal_count,
        notes: log.notes,
        book: log.books ? {
          id: log.books.id,
          title: log.books.title,
          author: log.books.author,
          isbn: log.books.isbn,
          genre: log.books.genre,
          publisher: log.books.publisher,
          publishedYear: log.books.published_year,
          totalCopies: log.books.total_copies,
          availableCopies: log.books.available_copies,
          description: log.books.description,
          coverImage: log.books.cover_image,
          status: log.books.status,
          createdAt: log.books.created_at,
          updatedAt: log.books.updated_at
        } : undefined,
        user: log.users ? {
          id: log.users.id,
          name: log.users.name,
          lastName: log.users.last_name,
          role: log.users.role,
          email: log.users.email
        } : undefined
      })) || [];
      
      setBorrowLogs(convertedLogs);
    } catch (error) {
      console.error('Error fetching borrow logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBook = async (bookData: Partial<Book>) => {
    try {
      const { error } = await supabase
        .from('books')
        .insert([{
          title: bookData.title,
          author: bookData.author,
          isbn: bookData.isbn,
          genre: bookData.genre,
          publisher: bookData.publisher,
          published_year: bookData.publishedYear,
          total_copies: bookData.totalCopies,
          available_copies: bookData.availableCopies || bookData.totalCopies,
          description: bookData.description,
          cover_image: bookData.coverImage,
          status: bookData.status
        }]);

      if (error) throw error;
      await fetchBooks();
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  };

  const updateBook = async (bookId: string, bookData: Partial<Book>) => {
    try {
      const { error } = await supabase
        .from('books')
        .update({
          title: bookData.title,
          author: bookData.author,
          isbn: bookData.isbn,
          genre: bookData.genre,
          publisher: bookData.publisher,
          published_year: bookData.publishedYear,
          total_copies: bookData.totalCopies,
          available_copies: bookData.availableCopies,
          description: bookData.description,
          cover_image: bookData.coverImage,
          status: bookData.status
        })
        .eq('id', bookId);

      if (error) throw error;
      await fetchBooks();
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  };

  const deleteBook = async (bookId: string) => {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);

      if (error) throw error;
      await fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  };

  const borrowBook = async (bookId: string, userId: string, borrowDate: string, dueDate: string, notes?: string) => {
    try {
      // Get current book data
      const { data: book, error: bookError } = await supabase
        .from('books')
        .select('available_copies')
        .eq('id', bookId)
        .single();

      if (bookError) throw bookError;
      
      if (book.available_copies <= 0) {
        throw new Error('No copies available');
      }

      // Create borrow log
      const { error: borrowError } = await supabase
        .from('borrow_logs')
        .insert([{
          book_id: bookId,
          user_id: userId,
          borrow_date: borrowDate,
          due_date: dueDate,
          status: 'borrowed',
          notes: notes
        }]);

      if (borrowError) throw borrowError;

      // Update book available copies
      const { error: updateError } = await supabase
        .from('books')
        .update({ available_copies: book.available_copies - 1 })
        .eq('id', bookId);

      if (updateError) throw updateError;

      await fetchBooks();
      await fetchBorrowLogs();
    } catch (error) {
      console.error('Error borrowing book:', error);
      throw error;
    }
  };

  const returnBook = async (borrowLogId: string) => {
    try {
      // Get borrow log data
      const { data: borrowLog, error: logError } = await supabase
        .from('borrow_logs')
        .select('book_id')
        .eq('id', borrowLogId)
        .single();

      if (logError) throw logError;

      // Update borrow log
      const { error: updateLogError } = await supabase
        .from('borrow_logs')
        .update({ 
          status: 'returned',
          return_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', borrowLogId);

      if (updateLogError) throw updateLogError;

      // Update book available copies
      const { data: book, error: bookError } = await supabase
        .from('books')
        .select('available_copies')
        .eq('id', borrowLog.book_id)
        .single();

      if (bookError) throw bookError;

      const { error: updateBookError } = await supabase
        .from('books')
        .update({ available_copies: book.available_copies + 1 })
        .eq('id', borrowLog.book_id);

      if (updateBookError) throw updateBookError;

      await fetchBooks();
      await fetchBorrowLogs();
    } catch (error) {
      console.error('Error returning book:', error);
      throw error;
    }
  };

  const value = {
    books,
    borrowLogs,
    loading,
    fetchBooks,
    fetchBorrowLogs,
    addBook,
    updateBook,
    deleteBook,
    borrowBook,
    returnBook,
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}