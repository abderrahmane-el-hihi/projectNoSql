package com.ghp.gestionhospitale.services;

import com.ghp.gestionhospitale.model.Doctor;
import com.ghp.gestionhospitale.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    // 🆕 ADD DOCTOR WITH VALIDATION
    public Doctor save(Doctor doctor) {
        // Generate doctor ID if not provided
        if (doctor.getDoctorId() == null || doctor.getDoctorId().isEmpty()) {
            doctor.setDoctorId(generateDoctorId());
        }

        // Set default values if not provided
        if (doctor.getAppointmentDuration() == 0) {
            doctor.setAppointmentDuration(30); // Default 30 minutes
        }

        return doctorRepository.save(doctor);
    }

    // FIND DOCTOR BY CUSTOM DOCTOR ID
    public Doctor findByDoctorId(String doctorId) {
        Optional<Doctor> doctor = doctorRepository.findByDoctorId(doctorId);
        return doctor.orElse(null);
    }

    // FIND DOCTORS BY SPECIALTY
    public List<Doctor> findBySpecialty(String specialty) {
        return doctorRepository.findBySpecializationContainingIgnoreCase(specialty);
    }

    // SEARCH DOCTORS BY NAME
    public List<Doctor> searchByName(String name) {
        return doctorRepository.findByNameContainingIgnoreCase(name);
    }

    // GENERATE DOCTOR ID
    private String generateDoctorId() {
        long count = doctorRepository.count();
        return "D" + (2000 + count + 1);
    }

    // BASIC CRUD METHODS
    public List<Doctor> findAll() {
        return doctorRepository.findAll();
    }

    public Doctor findById(String id) {
        return doctorRepository.findById(id).orElse(null);
    }

    public Doctor update(String id, Doctor doctorDetails) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(id);
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            doctor.setName(doctorDetails.getName());
            doctor.setSpecialization(doctorDetails.getSpecialization());
            doctor.setEmail(doctorDetails.getEmail());
            doctor.setPhone(doctorDetails.getPhone());
            doctor.setWorkingDays(doctorDetails.getWorkingDays());
            doctor.setWorkingHours(doctorDetails.getWorkingHours());
            doctor.setBreakTime(doctorDetails.getBreakTime());
            doctor.setAppointmentDuration(doctorDetails.getAppointmentDuration());
            doctor.setUnavailableDates(doctorDetails.getUnavailableDates());
            return doctorRepository.save(doctor);
        }
        return null;
    }

    public boolean delete(String id) {
        if (doctorRepository.existsById(id)) {
            doctorRepository.deleteById(id);
            return true;
        }
        return false;
    }
}