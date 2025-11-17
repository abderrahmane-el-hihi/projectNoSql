import { appointmentsAPI } from '../services/api';

export const getAppointments = async () => {
  const response = await appointmentsAPI.getAll();
  return response.data;
};

export const getAppointmentById = async (id) => {
  const response = await appointmentsAPI.getById(id);
  return response.data;
};

export const createAppointment = async (appointment) => {
  const response = await appointmentsAPI.create(appointment);
  return response.data;
};

export const updateAppointment = async (id, appointment) => {
  const response = await appointmentsAPI.update(id, appointment);
  return response.data;
};

export const cancelAppointment = async (id) => {
  await appointmentsAPI.cancel(id);
};

export const getAppointmentsByDoctor = async (doctorId) => {
  const response = await appointmentsAPI.getByDoctor(doctorId);
  return response.data;
};

export const getAppointmentsByPatient = async (patientId) => {
  const response = await appointmentsAPI.getByPatient(patientId);
  return response.data;
};

export const getAppointmentsByDate = async (date) => {
  const response = await appointmentsAPI.getByDate(date);
  return response.data;
};

export const getAvailableSlots = async (doctorId, date) => {
  const response = await appointmentsAPI.getAvailableSlots(doctorId, date);
  return response.data;
};

