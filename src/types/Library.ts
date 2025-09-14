export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  genre: string;
  publisher?: string;
  publishedYear?: number;
  totalCopies: number;
  availableCopies: number;
  description?: string;
  coverImage?: string;
  status: 'available' | 'reserved' | 'maintenance';
  createdAt: string;
  updatedAt: string;
}

export interface BorrowLog {
  id: string;
  bookId: string;
  userId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
  renewalCount: number;
  notes?: string;
  
  // Populated fields
  book?: Book;
  user?: {
    id: string;
    name: string;
    lastName: string;
    role: string;
    email: string;
  };
}

export interface BookRequest {
  id: string;
  bookId: string;
  userId: string;
  requestDate: string;
  requestedDueDate: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  adminNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Populated fields
  book?: Book;
  user?: {
    id: string;
    name: string;
    lastName: string;
    role: string;
    email: string;
  };
  approver?: {
    id: string;
    name: string;
    lastName: string;
  };
}

export interface LibraryMembership {
  id: string;
  userId: string;
  membershipType: 'basic' | 'premium';
  startDate: string;
  endDate: string;
  status: 'active' | 'suspended' | 'expired';
  borrowLimit: number;
  renewalLimit: number;
}