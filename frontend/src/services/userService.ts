import apiClient from '../lib/api';

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'PATIENT' | 'DENTIST' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  patient?: any;
  dentist?: any;
}

export interface CreateUserData {
  email: string;
  password: string;
  role: 'USER' | 'PATIENT' | 'DENTIST' | 'ADMIN';
  firstName?: string;
  lastName?: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
}

export const userService = {
  // Get all users (Admin only - would need a backend endpoint)
  // For now, this is a placeholder
  getAll: async (): Promise<{ users: User[] }> => {
    // This would need a /api/users endpoint on the backend
    // For now, we'll use the auth/me to get current user only
    throw new Error('Admin user listing not yet implemented in backend');
  },

  // Create new user (Admin only)
  create: async (data: CreateUserData): Promise<{ message: string; user: User }> => {
    // Uses the existing register endpoint
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  // Note: Update and delete endpoints would need to be added to the backend
};
