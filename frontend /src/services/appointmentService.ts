import apiClient from '../lib/api';

export interface Appointment {
  id: string;
  dateTime: string;
  duration: number;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  reason?: string;
  notes?: string;
  dentist?: any;
  patient?: any;
}

export interface CreateAppointmentData {
  dentistId: string;
  dateTime: string;
  duration?: number;
  reason?: string;
}

export const appointmentService = {
  // Create new appointment
  create: async (data: CreateAppointmentData): Promise<{ message: string; appointment: Appointment }> => {
    const response = await apiClient.post('/appointments', data);
    return response.data;
  },

  // Get all appointments (filtered by role)
  getAll: async (): Promise<{ appointments: Appointment[] }> => {
    const response = await apiClient.get('/appointments');
    return response.data;
  },

  // Update appointment status
  updateStatus: async (id: string, status: string): Promise<{ message: string; appointment: Appointment }> => {
    const response = await apiClient.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },

  // Delete appointment
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/appointments/${id}`);
    return response.data;
  },
};
