import axios from 'axios';

// Use relative URL when running in Docker (nginx proxies /api to backend)
// Use absolute URL for local development
// VITE_API_BASE_URL can be set in .env file for local dev
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (payload) => api.post('/auth/register', payload),
  registerAdmin: (payload) => api.post('/auth/register-admin', payload),
  me: () => api.get('/auth/me'),
};

// Patients API
export const patientsAPI = {
  getAll: () => api.get('/patients'),
  getById: (id) => api.get(`/patients/${id}`),
  getByPatientId: (patientId) => api.get(`/patients/by-patient-id/${patientId}`),
  create: (patient) => api.post('/patients', patient),
  update: (id, patient) => api.put(`/patients/${id}`, patient),
  delete: (id) => api.delete(`/patients/${id}`),
  search: (name) => api.get(`/patients/search?name=${name}`),
};

// Doctors API
export const doctorsAPI = {
  getAll: () => api.get('/doctors'),
  getById: (id) => api.get(`/doctors/${id}`),
  getByDoctorId: (doctorId) => api.get(`/doctors/by-doctor-id/${doctorId}`),
  create: (doctor) => api.post('/doctors', doctor),
  update: (id, doctor) => api.put(`/doctors/${id}`, doctor),
  delete: (id) => api.delete(`/doctors/${id}`),
  search: (name) => api.get(`/doctors/search?name=${name}`),
  getBySpecialty: (specialty) => api.get(`/doctors/specialty/${specialty}`),
};

// Appointments API
export const appointmentsAPI = {
  getAll: () => api.get('/appointments'),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (appointment) => api.post('/appointments', appointment),
  update: (id, appointment) => api.put(`/appointments/${id}`, appointment),
  cancel: (id) => api.delete(`/appointments/${id}`),
  getByDoctor: (doctorId) => api.get(`/appointments/doctor/${doctorId}`),
  getByPatient: (patientId) => api.get(`/appointments/patient/${patientId}`),
  getDoctorDashboard: (doctorId) => api.get(`/appointments/doctor/${doctorId}/dashboard`),
  getPatientHistory: (patientId) => api.get(`/appointments/patient/${patientId}/history`),
  getByDate: (date) => api.get(`/appointments/date/${date}`),
  getAvailableSlots: (doctorId, date) => 
    api.get(`/appointments/availability/${doctorId}?date=${date}`),
  markPastCompleted: () => api.post('/appointments/maintenance/mark-past-completed'),
};

// Reports API
export const reportsAPI = {
  getAppointmentsByDate: (date) => 
    api.get(`/reports/appointments-by-date?date=${date}`),
  getAppointmentsPerDoctor: (from, to) => 
    api.get(`/reports/appointments-per-doctor?from=${from}&to=${to}`),
  getAppointmentsPerSpecialty: (from, to) => 
    api.get(`/reports/appointments-per-specialty?from=${from}&to=${to}`),
  getFrequentPatients: (from, minCount = 2) => 
    api.get(`/reports/frequent-patients?from=${from}&minCount=${minCount}`),
};

export const notificationsAPI = {
  getRecent: () => api.get('/notifications'),
};

export default api;
