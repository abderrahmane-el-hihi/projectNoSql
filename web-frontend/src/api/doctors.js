import { doctorsAPI } from '../services/api';

// Day name mappings
const dayNamesFrToEn = {
  'Lundi': 'Monday',
  'Mardi': 'Tuesday',
  'Mercredi': 'Wednesday',
  'Jeudi': 'Thursday',
  'Vendredi': 'Friday',
  'Samedi': 'Saturday',
  'Dimanche': 'Sunday'
};

const dayNamesEnToFr = {
  'Monday': 'Lundi',
  'Tuesday': 'Mardi',
  'Wednesday': 'Mercredi',
  'Thursday': 'Jeudi',
  'Friday': 'Vendredi',
  'Saturday': 'Samedi',
  'Sunday': 'Dimanche'
};

// Transform backend workingHours/breakTime to frontend format
const transformWorkingHoursFromBackend = (doctor) => {
  if (!doctor.workingHours) {
    return {
      morning: { start: '09:00', end: '12:00' },
      afternoon: { start: '14:00', end: '17:00' },
    };
  }
  
  const start = doctor.workingHours.start || '09:00';
  const end = doctor.workingHours.end || '17:00';
  const breakStart = doctor.breakTime?.start || '12:00';
  const breakEnd = doctor.breakTime?.end || '13:00';
  
  return {
    morning: { start, end: breakStart },
    afternoon: { start: breakEnd, end },
  };
};

// Transform frontend workingHours to backend format
const transformWorkingHoursToBackend = (workingHours) => {
  if (!workingHours || !workingHours.morning || !workingHours.afternoon) {
    return {
      workingHours: { start: '09:00', end: '17:00' },
      breakTime: { start: '12:00', end: '13:00' },
    };
  }
  
  return {
    workingHours: {
      start: workingHours.morning.start || '09:00',
      end: workingHours.afternoon.end || '17:00',
    },
    breakTime: {
      start: workingHours.morning.end || '12:00',
      end: workingHours.afternoon.start || '13:00',
    },
  };
};

export const getDoctors = async () => {
  const response = await doctorsAPI.getAll();
  // Transform English day names to French and workingHours format for frontend display
  return response.data.map(doctor => ({
    ...doctor,
    workingDays: (doctor.workingDays || []).map(day => dayNamesEnToFr[day] || day),
    workingHours: transformWorkingHoursFromBackend(doctor),
  }));
};

export const getDoctorById = async (id) => {
  const response = await doctorsAPI.getById(id);
  const doctor = response.data;
  // Transform English day names to French and workingHours format for frontend display
  return {
    ...doctor,
    workingDays: (doctor.workingDays || []).map(day => dayNamesEnToFr[day] || day),
    workingHours: transformWorkingHoursFromBackend(doctor),
  };
};

export const createDoctor = async (doctor) => {
  // Transform French day names to English and workingHours to backend format
  const workingHoursTransformed = transformWorkingHoursToBackend(doctor.workingHours);
  const doctorData = {
    ...doctor,
    workingDays: (doctor.workingDays || []).map(day => dayNamesFrToEn[day] || day),
    workingHours: workingHoursTransformed.workingHours,
    breakTime: workingHoursTransformed.breakTime,
  };
  // Remove the frontend workingHours structure
  delete doctorData.morning;
  delete doctorData.afternoon;
  
  const response = await doctorsAPI.create(doctorData);
  // Transform back to French and frontend format for consistency
  const created = response.data;
  return {
    ...created,
    workingDays: (created.workingDays || []).map(day => dayNamesEnToFr[day] || day),
    workingHours: transformWorkingHoursFromBackend(created),
  };
};

export const updateDoctor = async (id, doctor) => {
  // Transform French day names to English and workingHours to backend format
  const workingHoursTransformed = transformWorkingHoursToBackend(doctor.workingHours);
  const doctorData = {
    ...doctor,
    workingDays: (doctor.workingDays || []).map(day => dayNamesFrToEn[day] || day),
    workingHours: workingHoursTransformed.workingHours,
    breakTime: workingHoursTransformed.breakTime,
  };
  // Remove the frontend workingHours structure
  delete doctorData.morning;
  delete doctorData.afternoon;
  
  const response = await doctorsAPI.update(id, doctorData);
  // Transform back to French and frontend format for consistency
  const updated = response.data;
  return {
    ...updated,
    workingDays: (updated.workingDays || []).map(day => dayNamesEnToFr[day] || day),
    workingHours: transformWorkingHoursFromBackend(updated),
  };
};

export const deleteDoctor = async (id) => {
  await doctorsAPI.delete(id);
};

export const searchDoctors = async (name) => {
  const response = await doctorsAPI.search(name);
  return response.data;
};

export const getDoctorsBySpecialty = async (specialty) => {
  const response = await doctorsAPI.getBySpecialty(specialty);
  return response.data;
};

