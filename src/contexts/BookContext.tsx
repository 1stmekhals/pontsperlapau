import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Book } from '../types';

interface BookContextType {
  books: Book[];
  loading: boolean;
  fetchBooks: () => Promise<void>;
  createBook: (bookData: Partial<Book>) => Promise<void>;
  updateBook: (bookId: string, bookData: Partial<Book>) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBook = async (bookData: Partial<Book>) => {
    try {
      const { error } = await supabase
        .from('books')
        .insert([bookData]);

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
        .update(bookData)
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

  const value = {
    books,
    loading,
    fetchBooks,
    createBook,
    updateBook,
    deleteBook,
  };

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
}

export function useBook() {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error('useBook must be used within a BookProvider');
  }
  return context;
}