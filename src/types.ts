export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  address: string;
  created_at: string;
}

export interface HealthRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis: string;
  prescription: string;
  reports: string;
  created_at: string;
}

export interface Referral {
  id: string;
  patient_id: string;
  from_hospital: string;
  to_hospital: string;
  reason: string;
  status: 'pending' | 'completed';
  token: string;
  created_at: string;
  patient_name?: string;
  age?: number;
  gender?: string;
}

export interface ReferralHistory {
  id: string;
  referral_id: string;
  status: string;
  created_at: string;
}
