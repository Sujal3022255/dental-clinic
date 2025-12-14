import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  profile_picture_url: string | null;
  role: 'patient' | 'dentist' | 'admin';
  created_at: string;
  updated_at: string;
};

export type DentistProfile = {
  id: string;
  user_id: string;
  specialization: string | null;
  experience_years: number;
  bio: string | null;
  license_number: string | null;
  created_at: string;
};

export type Appointment = {
  id: string;
  patient_id: string;
  dentist_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TreatmentHistory = {
  id: string;
  patient_id: string;
  dentist_id: string;
  appointment_id: string | null;
  treatment_description: string;
  prescription: string | null;
  notes: string | null;
  treatment_date: string;
  created_at: string;
};

export type DentistAvailability = {
  id: string;
  dentist_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
};

export type BlockedDate = {
  id: string;
  dentist_id: string;
  blocked_date: string;
  reason: string | null;
  created_at: string;
};

export type HealthTip = {
  id: string;
  title: string;
  content: string;
  author_id: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};
