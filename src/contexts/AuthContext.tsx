import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { User } from '../types/User';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  setupPassword: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshPendingUsers: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingUsersRefreshTrigger, setPendingUsersRefreshTrigger] = useState(0);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authService.verifyToken(token);
          setUser(userData);
        }
      } catch (error) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { user, token } = await authService.login(email, password);
    localStorage.setItem('token', token);
    setUser(user);
  };

  const register = async (userData: any) => {
    console.log('AuthContext.register - Registering user:', userData);
    const result = await authService.register(userData);
    console.log('AuthContext.register - Registration result:', result);
    
    if (result.success) {
      console.log('AuthContext.register - Registration completed successfully');
      // Trigger refresh of pending users in other contexts
      setPendingUsersRefreshTrigger(prev => prev + 1);
      
      // Also dispatch the event immediately
      window.dispatchEvent(new CustomEvent('pendingUsersChanged'));
    }
    
    return result;
  };

  const setupPassword = async (email: string, password: string) => {
    await authService.setupPassword(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authService.verifyToken(token);
        setUser(userData);
      }
    } catch (error) {
      logout();
    }
  };

  const refreshPendingUsers = () => {
    setPendingUsersRefreshTrigger(prev => prev + 1);
  };
  
  const value = {
    user,
    loading,
    login,
    register,
    setupPassword,
    logout,
    refreshUser,
    refreshPendingUsers
  };

  // Expose the refresh trigger for other contexts to listen to
  useEffect(() => {
    if (pendingUsersRefreshTrigger > 0) {
      // Dispatch a custom event that UserContext can listen to
      window.dispatchEvent(new CustomEvent('pendingUsersChanged'));
    }
  }, [pendingUsersRefreshTrigger]);
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}