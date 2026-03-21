import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { 
  Activity, 
  Users, 
  Plus,  
  QrCode, 
  Hospital, 
  ArrowRight, 
  History,
  CheckCircle2,
  Menu,
  X,
  User,
  Calendar,
  Phone,
  Stethoscope,
  ClipboardList,
  Clock,
  Copy,
  Check,
  Share2,
  ShieldCheck,
  ArrowUpRight,
  TrendingUp,
  Camera
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { format } from 'date-fns';
import { api } from './api';
import { Patient, HealthRecord, Referral, ReferralHistory } from './types';

// --- Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="bg-emerald-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-emerald-400" />
            <span className="font-bold text-xl tracking-tight">Arogya-Vahini</span>
          </Link>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <div className="flex items-center space-x-1 px-2 py-1 bg-emerald-800/50 rounded-full text-[10px] uppercase tracking-widest font-bold text-emerald-300">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span>Sync Active</span>
              </div>
              <Link to="/patients" className="hover:bg-emerald-800 px-3 py-2 rounded-md text-sm font-medium">Patients</Link>
              <Link to="/referrals" className="hover:bg-emerald-800 px-3 py-2 rounded-md text-sm font-medium">Referrals</Link>
              <Link to="/scan" className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2">
                <QrCode className="h-4 w-4" />
                <span>Scan Token</span>
              </Link>
            </div>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-emerald-800">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-emerald-900 px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/patients" className="block hover:bg-emerald-800 px-3 py-2 rounded-md text-base font-medium">Patients</Link>
          <Link to="/referrals" className="block hover:bg-emerald-800 px-3 py-2 rounded-md text-base font-medium">Referrals</Link>
          <Link to="/scan" className="block bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-md text-base font-medium">Scan Token</Link>
        </div>
      )}
    </nav>
  );
};

// --- Pages ---

const Dashboard = () => {
  const [stats, setStats] = useState<{
    totalPatients: number;
    activeReferrals: number;
    completedReferrals: number;
    recentActivity: Array<{ type: 'patient' | 'referral'; created_at: string; patient_name: string; detail: string }>;
  } | null>(null);

  useEffect(() => {
    api.getStats().then(setStats);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Health Vault Overview</h1>
        <p className="text-gray-500">Universal Rural Referral & Digital Health System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-100 p-3 rounded-2xl">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Registry
            </span>
          </div>
          <p className="text-sm text-gray-500 font-medium">Total Patients</p>
          <h3 className="text-3xl font-bold text-gray-900">{stats?.totalPatients || 0}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-2xl">
              <Hospital className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Active</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">Pending Referrals</p>
          <h3 className="text-3xl font-bold text-gray-900">{stats?.activeReferrals || 0}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-2xl">
              <ShieldCheck className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Secure</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">Completed Referrals</p>
          <h3 className="text-3xl font-bold text-gray-900">{stats?.completedReferrals || 0}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <Activity className="h-5 w-5 text-emerald-600" />
            <span>Quick Actions</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/patients/new" className="bg-emerald-600 text-white p-6 rounded-3xl hover:bg-emerald-700 transition-all group">
              <Plus className="h-8 w-8 mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-lg">New Patient</h4>
              <p className="text-emerald-100 text-sm">Register a new health vault</p>
            </Link>
            <Link to="/scan" className="bg-purple-600 text-white p-6 rounded-3xl hover:bg-purple-700 transition-all group">
              <QrCode className="h-8 w-8 mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-lg">Scan Token</h4>
              <p className="text-purple-100 text-sm">Access medical summary</p>
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <History className="h-5 w-5 text-emerald-600" />
            <span>Recent Activity</span>
          </h2>
          <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 overflow-hidden">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {stats.recentActivity.map((activity, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-xl ${activity.type === 'patient' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                        {activity.type === 'patient' ? <User className="h-5 w-5" /> : <Hospital className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{activity.patient_name}</p>
                        <p className="text-xs text-gray-500">{activity.detail}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{format(new Date(activity.created_at), 'MMM d, HH:mm')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                No recent activity to display.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReferralList = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getReferrals().then(setReferrals).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Referral Management</h1>
          <p className="text-gray-500">Track and manage patient transfers between hospitals</p>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search referrals by patient, hospital, status, or token"
          className="w-full md:w-1/2 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {referrals
            .filter(r => {
              if (!search) return true;
              const s = search.toLowerCase();
              return (
                (r.patient_name || '').toLowerCase().includes(s) ||
                (r.to_hospital || '').toLowerCase().includes(s) ||
                (r.status || '').toLowerCase().includes(s) ||
                (r.token || '').toLowerCase().includes(s)
              );
            })
            .map(referral => (
            <Link 
              key={referral.id} 
              to={`/referrals/${referral.token}`}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  referral.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {referral.status}
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-300 group-hover:text-emerald-600 transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{referral.patient_name}</h3>
              <p className="text-sm text-gray-500 mb-4 flex items-center">
                <Hospital className="h-4 w-4 mr-1" />
                To: {referral.to_hospital}
              </p>
              <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                <span className="text-xs text-gray-400">{format(new Date(referral.created_at), 'MMM d, yyyy')}</span>
                <span className="text-xs font-mono text-gray-300">#{referral.token.slice(0, 8)}</span>
              </div>
            </Link>
          ))}
          {referrals.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-3xl border border-dashed border-gray-200">
              No referrals found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PatientList = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getPatients().then(setPatients).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Patient Registry</h1>
        <Link to="/patients/new" className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-emerald-700 flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>New Patient</span>
        </Link>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="w-full md:w-1/2">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patients by name, contact or id"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients
            .filter(p => {
              if (!search) return true;
              const s = search.toLowerCase();
              return (
                (p.name || '').toLowerCase().includes(s) ||
                (p.contact || '').toLowerCase().includes(s) ||
                (p.id || '').toLowerCase().includes(s)
              );
            })
            .map(patient => (
            <Link key={patient.id} to={`/patients/${patient.id}`} className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-emerald-50 p-3 rounded-xl group-hover:bg-emerald-100 transition-colors">
                  <User className="h-6 w-6 text-emerald-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-emerald-600 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{patient.name}</h3>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{patient.age} years • {patient.gender}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{patient.contact}</span>
                </div>
              </div>
            </Link>
          ))}
          {patients.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-emerald-200 text-gray-500">
              No patients registered yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const NewPatient = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    address: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createPatient({
      ...formData,
      age: parseInt(formData.age)
    });
    navigate('/patients');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Register New Patient</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input 
                required
                type="number" 
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select 
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
            <input 
              required
              type="tel" 
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.contact}
              onChange={e => setFormData({...formData, contact: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea 
              required
              rows={3}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
            Register Patient
          </button>
        </form>
      </div>
    </div>
  );
};

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [showReferralForm, setShowReferralForm] = useState(false);

  useEffect(() => {
    if (id) {
      Promise.all([
        api.getPatients().then(list => list.find(p => p.id === id)),
        api.getPatientRecords(id)
      ]).then(([p, r]) => {
        if (p) setPatient(p);
        setRecords(r);
      }).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;
  if (!patient) return <div className="text-center py-12">Patient not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 sticky top-24">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-emerald-100 p-4 rounded-2xl">
                <User className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
                <p className="text-emerald-600 font-medium">ID: {patient.id.slice(0, 8)}</p>
              </div>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Age / Gender</span>
                <span className="font-medium">{patient.age} / {patient.gender}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Contact</span>
                <span className="font-medium">{patient.contact}</span>
              </div>
              <div className="py-2">
                <span className="text-gray-500 block mb-1">Address</span>
                <span className="font-medium">{patient.address}</span>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <button 
                onClick={() => setShowRecordForm(true)}
                className="w-full bg-emerald-600 text-white py-2 rounded-xl font-medium hover:bg-emerald-700 flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Health Record</span>
              </button>
              <button 
                onClick={() => setShowReferralForm(true)}
                className="w-full bg-blue-600 text-white py-2 rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <Hospital className="h-4 w-4" />
                <span>Refer Patient</span>
              </button>
            </div>
          </div>
        </div>

        {/* Records Timeline */}
        <div className="lg:col-span-2">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <ClipboardList className="h-6 w-6 text-emerald-600" />
            <span>Medical History Vault</span>
          </h3>
          
          <div className="space-y-6">
            {records.map(record => (
              <div key={record.id} className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-50 p-2 rounded-lg">
                      <Stethoscope className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{record.diagnosis}</h4>
                      <p className="text-xs text-gray-400">{format(new Date(record.created_at), 'PPP p')}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{record.prescription}</p>
                  {record.reports && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Diagnostic Reports</p>
                      <p className="text-xs text-gray-500">{record.reports}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {records.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-emerald-200 text-gray-500">
                No medical records found for this patient.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showRecordForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">New Medical Record</h3>
              <button onClick={() => setShowRecordForm(false)}><X className="h-6 w-6" /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const target = e.target as any;
              await api.createRecord({
                patient_id: patient.id,
                doctor_id: 'DOC-001', // Mock doctor ID
                diagnosis: target.diagnosis.value,
                prescription: target.prescription.value,
                reports: target.reports.value
              });
              setShowRecordForm(false);
              window.location.reload();
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                <input name="diagnosis" required className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prescription / Notes</label>
                <textarea name="prescription" required rows={4} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnostic Reports (Links/Notes)</label>
                <input name="reports" placeholder="e.g. Blood Test Link, X-Ray ID" className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">Save Record</button>
            </form>
          </div>
        </div>
      )}

      {showReferralForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Create Referral</h3>
              <button onClick={() => setShowReferralForm(false)}><X className="h-6 w-6" /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const target = e.target as any;
              const { token } = await api.createReferral({
                patient_id: patient.id,
                from_hospital: 'Rural PHC Center',
                to_hospital: target.to_hospital.value,
                reason: target.reason.value
              });
              navigate(`/referrals/${token}`);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Refer to Hospital</label>
                <input name="to_hospital" required placeholder="District Hospital / Specialist Center" className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Referral</label>
                <textarea name="reason" required rows={3} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Generate Referral Token</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ReferralView = () => {
  const { token } = useParams();
  const [data, setData] = useState<{ referral: Referral; records: HealthRecord[]; history: ReferralHistory[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const fetchReferral = async () => {
    if (token) {
      api.getReferralByToken(token).then(setData).finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchReferral();
  }, [token]);

  const handleComplete = async () => {
    if (!token) return;
    setUpdating(true);
    try {
      await api.updateReferralStatus(token, 'completed');
      await fetchReferral();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const copyToClipboard = () => {
    if (data?.referral.token) {
      navigator.clipboard.writeText(data.referral.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!data) return;
    const shareData = {
      title: 'Patient Referral - Arogya-Vahini',
      text: `Referral for ${data.referral.patient_name} to ${data.referral.to_hospital}. Token: ${data.referral.token}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      const mailtoLink = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + '\n\nLink: ' + shareData.url)}`;
      window.location.href = mailtoLink;
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;
  if (!data) return <div className="text-center py-12">Referral not found.</div>;

  const isCompleted = data.referral.status === 'completed';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className={`bg-white rounded-3xl shadow-xl border ${isCompleted ? 'border-emerald-200' : 'border-emerald-100'} overflow-hidden transition-colors duration-500`}>
        <div className={`${isCompleted ? 'bg-emerald-50 text-emerald-900 border-b border-emerald-100' : 'bg-emerald-600 text-white'} p-8 text-center transition-all duration-500`}>
          <div className="relative inline-block mb-4">
            <div className={`bg-white p-4 rounded-2xl shadow-sm ${isCompleted ? 'border border-emerald-100' : ''}`}>
              <QRCodeSVG value={data.referral.token} size={150} />
            </div>
            <button
              onClick={copyToClipboard}
              className={`absolute -right-4 -bottom-2 p-3 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center ${
                copied 
                  ? 'bg-emerald-500 text-white scale-110' 
                  : 'bg-white text-emerald-600 hover:bg-emerald-50 scale-100'
              }`}
              title="Copy Token"
            >
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
          <h1 className={`text-2xl font-bold ${isCompleted ? 'text-emerald-800' : 'text-white'}`}>
            {isCompleted ? '✓ Referral Successfully Completed' : 'Secure Referral Token'}
          </h1>
          <p className={`${isCompleted ? 'text-emerald-600' : 'opacity-80'} font-medium mt-1`}>
            {isCompleted ? 'Patient records have been archived in the Health Vault.' : 'Scan this code at the referral hospital'}
          </p>
        </div>
        
        <div className={`p-8 ${isCompleted ? 'bg-emerald-50/30' : ''} transition-colors duration-500`}>
          <div className="flex justify-between items-start mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
              <div>
                <h3 className={`text-sm font-bold ${isCompleted ? 'text-emerald-700' : 'text-emerald-600'} uppercase tracking-wider mb-4`}>Patient Information</h3>
                <div className="space-y-2">
                  <p className="text-xl font-bold">{data.referral.patient_name}</p>
                  <p className="text-gray-500">{data.referral.age} years • {data.referral.gender}</p>
                </div>
              </div>
              <div>
                <h3 className={`text-sm font-bold ${isCompleted ? 'text-emerald-700' : 'text-emerald-600'} uppercase tracking-wider mb-4`}>Referral Details</h3>
                <div className="space-y-2">
                  <p className="font-bold">To: {data.referral.to_hospital}</p>
                  <p className="text-gray-500">Reason: {data.referral.reason}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${isCompleted ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                      {data.referral.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleShare}
                className="bg-white text-emerald-600 border border-emerald-200 px-6 py-3 rounded-2xl font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Share2 className="h-5 w-5" />
                <span>Share Referral</span>
              </button>
              {!isCompleted && (
                <button 
                  onClick={handleComplete}
                  disabled={updating}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {updating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                  <span>Mark as Completed</span>
                </button>
              )}
            </div>
          </div>

          <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className={`text-sm font-bold ${isCompleted ? 'text-emerald-700' : 'text-emerald-600'} uppercase tracking-wider mb-4 flex items-center space-x-2`}>
              <Clock className="h-4 w-4" />
              <span>Referral Status History</span>
            </h3>
            <div className="space-y-4">
              {data.history.map((entry, idx) => (
                <div 
                  key={entry.id} 
                  className="flex items-start space-x-3 cursor-pointer relative group"
                  onClick={() => setActiveTooltip(activeTooltip === entry.id ? null : entry.id)}
                >
                  <div className="flex flex-col items-center">
                    <div className={`h-2.5 w-2.5 rounded-full ${idx === 0 ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-gray-300'}`}></div>
                    {idx !== data.history.length - 1 && <div className="w-0.5 h-8 bg-gray-200 my-1"></div>}
                  </div>
                  <div className="flex-1 -mt-1">
                    <div className="flex justify-between">
                      <span className={`text-sm font-bold capitalize ${idx === 0 ? 'text-emerald-700' : 'text-gray-600'}`}>
                        {entry.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(entry.created_at), 'MMM d, yyyy • HH:mm')}
                      </span>
                    </div>
                  </div>
                  {activeTooltip === entry.id && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-xl z-50 whitespace-nowrap animate-in fade-in zoom-in duration-200">
                      Full Timestamp: {format(new Date(entry.created_at), 'PPPP p')}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-4">Recent Medical Summary</h3>
          <div className="space-y-4">
            {data.records.map(record => (
              <div key={record.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-gray-900">{record.diagnosis}</span>
                  <span className="text-xs text-gray-400">{format(new Date(record.created_at), 'MMM d, yyyy')}</span>
                </div>
                <p className="text-sm text-gray-600">{record.prescription}</p>
                {record.reports && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase">Reports: <span className="font-normal text-gray-500 lowercase">{record.reports}</span></p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ScanToken = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (isScanning) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      scanner.render(
        (decodedText) => {
          setToken(decodedText);
          setIsScanning(false);
          if (scanner) scanner.clear();
          navigate(`/referrals/${decodedText}`);
        },
        (error) => {
          // console.warn(error);
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, [isScanning, navigate]);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (token) navigate(`/referrals/${token}`);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-emerald-100 text-center">
        <div className="bg-purple-100 p-6 rounded-full inline-block mb-6">
          <QrCode className="h-12 w-12 text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Scan Referral Token</h1>
        <p className="text-gray-500 mb-8">Enter the unique token ID or use a camera to scan the patient's referral QR code.</p>
        
        {isScanning ? (
          <div className="space-y-4">
            <div id="reader" className="overflow-hidden rounded-2xl border-2 border-purple-100"></div>
            <button 
              onClick={() => setIsScanning(false)}
              className="w-full bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
            >
              Cancel Camera Scan
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleScan} className="space-y-4">
              <input 
                type="text" 
                placeholder="Enter Token ID"
                className="w-full px-6 py-4 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500 text-center font-mono"
                value={token}
                onChange={e => setToken(e.target.value)}
              />
              <button type="submit" className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold hover:bg-purple-700 transition-colors">
                Access Health Vault
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400 font-bold tracking-widest">OR</span>
              </div>
            </div>

            <button 
              onClick={() => setIsScanning(true)}
              className="w-full bg-white text-purple-600 border-2 border-purple-100 py-4 rounded-2xl font-bold hover:bg-purple-50 transition-all flex items-center justify-center space-x-2"
            >
              <Camera className="h-5 w-5" />
              <span>Use Camera Scanner</span>
            </button>
          </div>
        )}
        
        <div className="mt-8 pt-8 border-t border-gray-100">
          <div className="bg-gray-50 p-4 rounded-2xl flex items-center space-x-3 text-left">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <p className="text-xs text-gray-500">Secure access granted only to authorized medical professionals.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/new" element={<NewPatient />} />
            <Route path="/patients/:id" element={<PatientDetails />} />
            <Route path="/referrals" element={<ReferralList />} />
            <Route path="/referrals/:token" element={<ReferralView />} />
            <Route path="/scan" element={<ScanToken />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
