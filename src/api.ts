import { Patient, HealthRecord, Referral, ReferralHistory } from './types';

const API_BASE = '/api';

export const api = {
  async getPatients(): Promise<Patient[]> {
    const res = await fetch(`${API_BASE}/patients`);
    return res.json();
  },

  async getPatient(patientId: string): Promise<Patient> {
    const res = await fetch(`${API_BASE}/patients/${patientId}`);
    if (!res.ok) throw new Error('Patient not found');
    return res.json();
  },

  async getReferrals(): Promise<Referral[]> {
    const res = await fetch(`${API_BASE}/referrals`);
    return res.json();
  },

  async getStats(): Promise<{
    totalPatients: number;
    activeReferrals: number;
    completedReferrals: number;
    recentActivity: Array<{ type: 'patient' | 'referral'; created_at: string; patient_name: string; detail: string }>;
  }> {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  },

  async createPatient(patient: Omit<Patient, 'id' | 'created_at'>): Promise<Patient> {
    const res = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient),
    });
    return res.json();
  },

  async updatePatient(patientId: string, updates: Partial<Omit<Patient, 'id' | 'created_at'>>): Promise<Patient> {
    const res = await fetch(`${API_BASE}/patients/${patientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Unable to update patient');
    return res.json();
  },

  async deletePatient(patientId: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/patients/${patientId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Unable to delete patient');
    return res.json();
  },

  async getPatientRecords(patientId: string): Promise<HealthRecord[]> {
    const res = await fetch(`${API_BASE}/patients/${patientId}/records`);
    return res.json();
  },

  async createRecord(record: Omit<HealthRecord, 'id' | 'created_at'>): Promise<HealthRecord> {
    const res = await fetch(`${API_BASE}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    return res.json();
  },

  async getRecord(recordId: string): Promise<HealthRecord> {
    const res = await fetch(`${API_BASE}/records/${recordId}`);
    if (!res.ok) throw new Error('Health record not found');
    return res.json();
  },

  async updateRecord(recordId: string, updates: Partial<Omit<HealthRecord, 'id' | 'patient_id' | 'created_at'>>): Promise<HealthRecord> {
    const res = await fetch(`${API_BASE}/records/${recordId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Unable to update health record');
    return res.json();
  },

  async deleteRecord(recordId: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/records/${recordId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Unable to delete health record');
    return res.json();
  },

  async createReferral(referral: Omit<Referral, 'id' | 'token' | 'status' | 'created_at'>): Promise<{ id: string; token: string }> {
    const res = await fetch(`${API_BASE}/referrals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(referral),
    });
    return res.json();
  },

  async getReferral(referralId: string): Promise<Referral> {
    const res = await fetch(`${API_BASE}/referrals/id/${referralId}`);
    if (!res.ok) throw new Error('Referral not found');
    return res.json();
  },

  async updateReferral(referralId: string, updates: Partial<Pick<Referral, 'from_hospital' | 'to_hospital' | 'reason' | 'status'>>): Promise<Referral> {
    const res = await fetch(`${API_BASE}/referrals/id/${referralId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Unable to update referral');
    return res.json();
  },

  async deleteReferral(referralId: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/referrals/id/${referralId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Unable to delete referral');
    return res.json();
  },

  async getReferralByToken(token: string): Promise<{ referral: Referral; records: HealthRecord[]; history: ReferralHistory[] }> {
    const res = await fetch(`${API_BASE}/referrals/${token}`);
    if (!res.ok) throw new Error('Referral not found');
    return res.json();
  },

  async updateReferralStatus(token: string, status: 'pending' | 'completed'): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/referrals/${token}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  }
};

// Attach auth headers to protected endpoints above
