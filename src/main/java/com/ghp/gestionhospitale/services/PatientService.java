package com.ghp.gestionhospitale.services;

import com.ghp.gestionhospitale.model.Patient;
import com.ghp.gestionhospitale.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    /**
     * Generate unique patient ID (simple implementation)
     */
    private String generatePatientId() {
        long count = patientRepository.count();
        return "P" + String.format("%04d", count + 1);
    }

    // Create patient with all details
    public Patient createPatient(String name, LocalDate dob, String gender,
                                 String phone, String email, String address) {
        Patient patient = new Patient();
        patient.setPatientId(generatePatientId());
        patient.setName(name);
        patient.setDob(dob);
        patient.setGender(gender);
        patient.setPhone(phone);
        patient.setEmail(email);
        patient.setAddress(address);

        return patientRepository.save(patient);
    }

    // Find patient by email (for duplicate checking)
    public boolean existsByEmail(String email) {
        return patientRepository.findByEmail(email).isPresent();
    }

    // Find by MongoDB ID
    public Optional<Patient> findById(String id) {
        return patientRepository.findById(id);
    }


    public List<Patient> findAll() {
        return patientRepository.findAll();
    }

    public Optional<Patient> findByPatientId(String patientId) {
        return patientRepository.findByPatientId(patientId);
    }

    public Patient save(Patient patient) {
        return patientRepository.save(patient);
    }

    public Patient update(String id, Patient patientDetails) {
        Optional<Patient> patientOpt = patientRepository.findById(id);
        if (patientOpt.isPresent()) {
            Patient patient = patientOpt.get();
            patient.setName(patientDetails.getName());
            patient.setDob(patientDetails.getDob());
            patient.setGender(patientDetails.getGender());
            patient.setPhone(patientDetails.getPhone());
            patient.setEmail(patientDetails.getEmail());
            patient.setAddress(patientDetails.getAddress());
            return patientRepository.save(patient);
        }
        return null;
    }

    public boolean delete(String id) {
        return patientRepository.findById(id)
                .map(patient -> {
                    patientRepository.delete(patient);
                    return true;
                })
                .orElse(false);
    }

    public List<Patient> searchByName(String name) {
        return patientRepository.findByNameContainingIgnoreCase(name);
    }


}
