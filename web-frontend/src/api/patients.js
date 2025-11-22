import { patientsAPI } from '../services/api';

export const getPatients = async () => {
  const response = await patientsAPI.getAll();
  // Transform dob to dateOfBirth for frontend consistency
  return response.data.map(patient => ({
    ...patient,
    dateOfBirth: patient.dob || patient.dateOfBirth,
  }));
};

export const getPatientById = async (id) => {
  const response = await patientsAPI.getById(id);
  // Transform dob to dateOfBirth for frontend consistency
  const patient = response.data;
  return {
    ...patient,
    dateOfBirth: patient.dob || patient.dateOfBirth,
  };
};

export const getPatientByPatientId = async (patientId) => {
  const response = await patientsAPI.getByPatientId(patientId);
  const patient = response.data;
  return {
    ...patient,
    dateOfBirth: patient.dob || patient.dateOfBirth,
  };
};

export const createPatient = async (patient) => {
  // Transform dateOfBirth to dob for backend
  const patientData = {
    ...patient,
    dob: patient.dateOfBirth || patient.dob,
  };
  // Remove dateOfBirth if it exists to avoid confusion
  delete patientData.dateOfBirth;
  const response = await patientsAPI.create(patientData);
  return response.data;
};

export const updatePatient = async (id, patient) => {
  // Transform dateOfBirth to dob for backend
  const patientData = {
    ...patient,
    dob: patient.dateOfBirth || patient.dob,
  };
  // Remove dateOfBirth if it exists to avoid confusion
  delete patientData.dateOfBirth;
  const response = await patientsAPI.update(id, patientData);
  return response.data;
};

export const deletePatient = async (id) => {
  await patientsAPI.delete(id);
};

export const searchPatients = async (name) => {
  const response = await patientsAPI.search(name);
  return response.data;
};
