import apiClient from '../lib/api';

export interface Dentist {
  id: string;
  firstName: string;
  lastName: string;
  specialization?: string;
  licenseNumber: string;
  phone?: string;
  bio?: string;
  experience?: number;
  availability?: any[];
  user?: {
    email: string;
  };
}

export const dentistService = {
  // Get all dentists
  getAll: async (): Promise<{ dentists: Dentist[] }> => {
    const response = await apiClient.get('/dentists');
    return response.data;
  },

  // Get dentist by ID
  getById: async (id: string): Promise<{ dentist: Dentist }> => {
    const response = await apiClient.get(`/dentists/${id}`);
    return response.data;
  },

  // Update dentist profile
  update: async (id: string, data: Partial<Dentist>): Promise<{ message: string; dentist: Dentist }> => {
    const response = await apiClient.patch(`/dentists/${id}`, data);
    return response.data;
  },

  // Set availability
  setAvailability: async (dentistId: string, data: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }): Promise<{ message: string; availability: any }> => {
    const response = await apiClient.post(`/dentists/${dentistId}/availability`, data);
    return response.data;
  },
};
