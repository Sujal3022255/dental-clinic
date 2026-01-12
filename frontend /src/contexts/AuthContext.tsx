import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, RegisterData } from '../services/authService';

export interface UserProfile {
  id: string;
  email: string;
  role: 'USER' | 'PATIENT' | 'DENTIST' | 'ADMIN';
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
  };
  dentist?: {
    id: string;
    firstName: string;
    lastName: string;
    specialization?: string;
    licenseNumber: string;
    phone?: string;
    bio?: string;
    experience?: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signUp: (data: RegisterData) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authService.getCurrentUser();
          setUser(response.user);
        } catch (error) {
          console.error('Failed to get current user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signUp = async (data: RegisterData) => {
    try {
      // Register user but don't auto-login - let them login manually
      await authService.register(data);
      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { 
        error: { 
          message: error.response?.data?.error || 'Failed to register. Please try again.' 
        } 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user as UserProfile);
      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { 
        error: { 
          message: error.response?.data?.error || 'Invalid email or password' 
        } 
      };
    }
  };

  const signOut = async () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      // This would need a backend endpoint
      // For now, just update locally
      if (!user) return { error: new Error('No user logged in') };
      
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // This would need a backend endpoint
      console.log('Password reset would be sent to:', email);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
