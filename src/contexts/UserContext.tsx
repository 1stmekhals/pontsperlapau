import React, { createContext, useContext, useState, ReactNode } from 'react';
import { userService } from '../services/userService';
import { User } from '../types/User';
import { useActivity } from './ActivityContext';
import { useAuth } from './AuthContext';

interface UserContextType {
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

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [studentUsers, setStudentUsers] = useState<User[]>([]);
  const [visitorUsers, setVisitorUsers] = useState<User[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { fetchActivities } = useActivity();
  const { user: authUser } = useAuth();

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const fetchedUsers = await userService.getAllUsers();
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
      const pending = await userService.getPendingUsers();
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
      const roleUsers = await userService.getUsersByRole(role);
      switch (role) {
        case 'staff':
          // For staff, also include admin users since admins are part of staff
          const allUsers = await userService.getAllUsers();
          setStaffUsers(allUsers.filter(u => u.role === 'staff' || u.role === 'admin'));
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
      if (!authUser?.id) {
        throw new Error('User not authenticated');
      }
      await userService.approveUser(userId, authUser.id);
      await fetchUsers();
      await fetchPendingUsers();
      await fetchActivities({ limit: 10 });
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  }, [fetchUsers, fetchPendingUsers, fetchActivities]);

  const rejectUser = React.useCallback(async (userId: string) => {
    try {
      if (!authUser?.id) {
        throw new Error('User not authenticated');
      }
      await userService.rejectUser(userId, authUser.id);
      await fetchPendingUsers();
      await fetchActivities({ limit: 10 });
    } catch (error) {
      console.error('Error rejecting user:', error);
      throw error;
    }
  }, [fetchPendingUsers, fetchActivities]);

  const updateUser = React.useCallback(async (userId: string, userData: Partial<User>) => {
    if (!authUser?.id) {
      throw new Error('User not authenticated');
    }
    await userService.updateUser(userId, userData, authUser.id);
    await fetchUsers();
    await fetchActivities({ limit: 10 });
  }, [fetchUsers, fetchActivities]);

  const deleteUser = React.useCallback(async (userId: string) => {
    if (!authUser?.id) {
      throw new Error('User not authenticated');
    }
    await userService.deleteUser(userId, authUser.id);
    await fetchUsers();
    await fetchActivities({ limit: 10 });
  }, [fetchUsers, fetchActivities]);

  const promoteToAdmin = React.useCallback(async (userId: string) => {
    if (!authUser?.id) {
      throw new Error('User not authenticated');
    }
    await userService.promoteToAdmin(userId, authUser.id);
    await fetchUsers();
    await fetchActivities({ limit: 10 });
  }, [fetchUsers, fetchActivities]);

  const addUser = React.useCallback(async (userData: Partial<User>) => {
    if (!authUser?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      await userService.addUser(userData, authUser.id);
      await fetchUsers();
      await fetchActivities({ limit: 10 });
    } catch (error) {
      console.error('UserContext.addUser - Error:', error);
      throw error;
    }
  }, [fetchUsers, fetchActivities]);

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