import apiClient from '../lib/api';

export interface Appointment {
  id: string;
  dateTime: string;
  duration: number;
  status: 'PENDING' | 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
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

export interface RescheduleAppointmentData {
  dateTime: string;
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

  // Reschedule appointment
  reschedule: async (id: string, data: RescheduleAppointmentData): Promise<{ message: string; appointment: Appointment }> => {
    const response = await apiClient.patch(`/appointments/${id}/reschedule`, data);
    return response.data;
  },

  // Approve appointment (dentist/admin only)
  approve: async (id: string): Promise<{ message: string; appointment: Appointment }> => {
    const response = await apiClient.patch(`/appointments/${id}/approve`);
    return response.data;
  },

  // Reject appointment (dentist/admin only)
  reject: async (id: string, reason?: string): Promise<{ message: string; appointment: Appointment }> => {
    const response = await apiClient.patch(`/appointments/${id}/reject`, { reason });
    return response.data;
  },

  // Cancel appointment (set status to CANCELLED)
  cancel: async (id: string): Promise<{ message: string; appointment: Appointment }> => {
    const response = await apiClient.patch(`/appointments/${id}/cancel`);
    return response.data;
  },

  // Delete appointment
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/appointments/${id}`);
    return response.data;
  },
};

