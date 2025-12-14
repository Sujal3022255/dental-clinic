import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'patient' | 'dentist' | 'admin';
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  profile_picture_url?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string, role: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'dental_clinic_users';
const CURRENT_USER_STORAGE_KEY = 'dental_clinic_current_user';

const initializeDefaultAdmin = () => {
  const users = localStorage.getItem(USERS_STORAGE_KEY);
  const allUsers = users ? JSON.parse(users) : [];
  
  const adminExists = allUsers.some((u: UserProfile) => u.email === 'admin@gmail.com');
  
  if (!adminExists) {
    const defaultAdmin: UserProfile & { _password: string } = {
      id: 'admin-default-001',
      email: 'admin@gmail.com',
      full_name: 'System Administrator',
      phone: '0000000000',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _password: btoa('admin123'),
    };
    
    allUsers.push(defaultAdmin);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeDefaultAdmin();
    
    const storedUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const getAllUsers = (): UserProfile[] => {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  const saveUsers = (users: UserProfile[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string, role: string) => {
    try {
      const users = getAllUsers();

      if (users.some((u) => u.email === email)) {
        return { error: { message: 'Email already registered' } };
      }

      const newUser: UserProfile = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        full_name: fullName,
        phone,
        role: role as 'patient' | 'dentist' | 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      users.push({
        ...newUser,
        _password: btoa(password),
      } as any);

      saveUsers(users);
      setUser(newUser);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(newUser));

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const users = getAllUsers();
      const userRecord = users.find((u) => u.email === email);

      if (!userRecord) {
        return { error: { message: 'Invalid email or password' } };
      }

      const storedPassword = (userRecord as any)._password;
      if (storedPassword !== btoa(password)) {
        return { error: { message: 'Invalid email or password' } };
      }

      const userWithoutPassword = { ...userRecord };
      delete (userWithoutPassword as any)._password;

      setUser(userWithoutPassword);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userWithoutPassword));

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) return { error: new Error('No user logged in') };

      const users = getAllUsers();
      const userIndex = users.findIndex((u) => u.id === user.id);

      if (userIndex === -1) return { error: new Error('User not found') };

      const updatedUser = { ...user, ...updates, updated_at: new Date().toISOString() };
      users[userIndex] = updatedUser;

      saveUsers(users);
      setUser(updatedUser);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updatedUser));

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const users = getAllUsers();
      const userRecord = users.find((u) => u.email === email);

      if (!userRecord) {
        return { error: { message: 'Email not found' } };
      }

      // In a real app, this would send an email
      // For now, we'll just simulate success
      console.log('Password reset email would be sent to:', email);

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
