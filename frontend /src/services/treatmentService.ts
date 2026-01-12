import apiClient from '../lib/api';

export interface Treatment {
  id: string;
  appointmentId: string;
  patientId: string;
  diagnosis: string;
  procedure: string;
  prescription?: string;
  cost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  appointment?: any;
  patient?: any;
}

export interface CreateTreatmentData {
  appointmentId: string;
  diagnosis: string;
  procedure: string;
  prescription?: string;
  cost?: number;
  notes?: string;
}

export interface UpdateTreatmentData {
  diagnosis?: string;
  procedure?: string;
  prescription?: string;
  cost?: number;
  notes?: string;
}

export const treatmentService = {
  // Create new treatment record
  create: async (data: CreateTreatmentData): Promise<{ message: string; treatment: Treatment }> => {
    const response = await apiClient.post('/treatments', data);
    return response.data;
  },

  // Get all treatments (filtered by role)
  getAll: async (): Promise<{ treatments: Treatment[] }> => {
    const response = await apiClient.get('/treatments');
    return response.data;
  },

  // Get treatment by ID
  getById: async (id: string): Promise<{ treatment: Treatment }> => {
    const response = await apiClient.get(`/treatments/${id}`);
    return response.data;
  },

  // Update treatment
  update: async (id: string, data: UpdateTreatmentData): Promise<{ message: string; treatment: Treatment }> => {
    const response = await apiClient.patch(`/treatments/${id}`, data);
    return response.data;
  },

  // Delete treatment (Admin only)
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/treatments/${id}`);
    return response.data;
  },
};
