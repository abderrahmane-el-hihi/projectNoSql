import { reportsAPI } from '../services/api';

export const getAppointmentsByDate = async (date) => {
  const response = await reportsAPI.getAppointmentsByDate(date);
  return response.data;
};

export const getAppointmentsPerDoctor = async (from, to) => {
  const response = await reportsAPI.getAppointmentsPerDoctor(from, to);
  return response.data;
};

export const getAppointmentsPerSpecialty = async (from, to) => {
  const response = await reportsAPI.getAppointmentsPerSpecialty(from, to);
  return response.data;
};

export const getFrequentPatients = async (from, minCount = 2) => {
  const response = await reportsAPI.getFrequentPatients(from, minCount);
  return response.data;
};

