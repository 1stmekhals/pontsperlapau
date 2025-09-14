import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useActivity } from './ActivityContext';
import { useAuth } from './AuthContext';

interface UserContextType {
  currentUser: User | null;
  users: User[];
  pendingUsers: User[];
  staffUsers: User[];
  studentUsers: User[];
  visitorUsers: User[];
  adminUsers: User[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
  fetchPendingUsers: () => Promise<void>;
  fetchUsersByRole: (role: string) => Promise<User[]>;
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;
  updateUser: (userId: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  promoteToAdmin: (userId: string) => Promise<void>;
  addUser: (userData: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function useUsers() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [studentUsers, setStudentUsers] = useState<User[]>([]);
  const [visitorUsers, setVisitorUsers] = useState<User[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Set current user from auth user
  React.useEffect(() => {
    setCurrentUser(authUser);
  }, [authUser]);
  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      // Mock implementation - replace with actual service call
      const fetchedUsers: User[] = [];
      setUsers(fetchedUsers);
      
      // Also update role-specific lists
      setStaffUsers(fetchedUsers.filter(u => u.role === 'staff'));
      // Include admins in staff view since admins are also staff members
      setStaffUsers(fetchedUsers.filter(u => u.role === 'staff' || u.role === 'admin'));
      setStudentUsers(fetchedUsers.filter(u => u.role === 'student'));
      setVisitorUsers(fetchedUsers.filter(u => u.role === 'visitor'));
      setAdminUsers(fetchedUsers.filter(u => u.role === 'admin'));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingUsers = React.useCallback(async () => {
    try {
      // Mock implementation - replace with actual service call
      const pending: User[] = [];
      console.log('UserContext.fetchPendingUsers - Count:', pending.length);
      console.log('UserContext.fetchPendingUsers - Users:', pending);
      setPendingUsers(pending);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ UserContext.fetchPendingUsers - Error:', errorMessage);
      
      // If it's an API key error, provide helpful guidance
      if (errorMessage.includes('Invalid API key')) {
        console.error('🔑 Please check your Supabase API key in the .env file');
        console.error('📝 Go to https://supabase.com/dashboard → Your Project → Settings → API');
        console.error('📋 Copy the "anon public" key and update VITE_SUPABASE_ANON_KEY');
      }
    }
  }, []);

  const fetchUsersByRole = React.useCallback(async (role: string) => {
    try {
      // Mock implementation - replace with actual service call
      const roleUsers: User[] = [];
      switch (role) {
        case 'staff':
          setStaffUsers(roleUsers);
          break;
        case 'student':
          setStudentUsers(roleUsers);
          break;
        case 'visitor':
          setVisitorUsers(roleUsers);
          break;
        case 'admin':
          setAdminUsers(roleUsers);
          break;
      }
      return roleUsers;
    } catch (error) {
      console.error(`Error fetching ${role} users:`, error);
      return [];
    }
  }, []);

  const approveUser = React.useCallback(async (userId: string) => {
    try {
      // Mock implementation - replace with actual service call
      console.log('Approving user:', userId);
      await fetchUsers();
      await fetchPendingUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  }, [fetchUsers, fetchPendingUsers]);

  const rejectUser = React.useCallback(async (userId: string) => {
    try {
      // Mock implementation - replace with actual service call
      console.log('Rejecting user:', userId);
      await fetchPendingUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      throw error;
    }
  }, [fetchPendingUsers]);

  const updateUser = React.useCallback(async (userId: string, userData: Partial<User>) => {
    // Mock implementation - replace with actual service call
    console.log('Updating user:', userId, userData);
    await fetchUsers();
  }, [fetchUsers]);

  const deleteUser = React.useCallback(async (userId: string) => {
    // Mock implementation - replace with actual service call
    console.log('Deleting user:', userId);
    await fetchUsers();
  }, [fetchUsers]);

  const promoteToAdmin = React.useCallback(async (userId: string) => {
    // Mock implementation - replace with actual service call
    console.log('Promoting user to admin:', userId);
    await fetchUsers();
  }, [fetchUsers]);

  const addUser = React.useCallback(async (userData: Partial<User>) => {
    try {
      // Mock implementation - replace with actual service call
      console.log('Adding user:', userData);
      await fetchUsers();
    } catch (error) {
      console.error('UserContext.addUser - Error:', error);
      throw error;
    }
  }, [fetchUsers]);

  // Fetch both users and pending users on mount
  React.useEffect(() => {
    const initializeData = async () => {
      await fetchUsers();
      await fetchPendingUsers();
      await fetchUsersByRole('staff');
      await fetchUsersByRole('student');
      await fetchUsersByRole('visitor');
      await fetchUsersByRole('admin');
    };
    initializeData();
  }, [fetchUsers, fetchPendingUsers, fetchUsersByRole]);

  // Set up periodic refresh for pending users
  React.useEffect(() => {
    // Listen for registration events
    const handlePendingUsersChanged = () => {
      console.log('UserContext - Received pendingUsersChanged event, refreshing...');
      fetchPendingUsers();
    };

    window.addEventListener('pendingUsersChanged', handlePendingUsersChanged);

    const interval = setInterval(() => {
      fetchPendingUsers();
    }, 3000); // Refresh every 3 seconds

    return () => {
      clearInterval(interval);
      window.removeEventListener('pendingUsersChanged', handlePendingUsersChanged);
    };
  }, [fetchPendingUsers]);

  const value = {
    currentUser,
    users,
    pendingUsers,
    staffUsers,
    studentUsers,
    visitorUsers,
    adminUsers,
    loading,
    fetchUsers,
    fetchPendingUsers,
    fetchUsersByRole,
    approveUser,
    rejectUser,
    updateUser,
    deleteUser,
    promoteToAdmin,
    addUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}