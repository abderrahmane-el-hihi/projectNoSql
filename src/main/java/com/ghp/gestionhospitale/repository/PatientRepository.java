package com.ghp.gestionhospitale.repository;

import com.ghp.gestionhospitale.model.Patient;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends MongoRepository<Patient, String> {

    // Find patient by custom patientId (like "P1801")
    Optional<Patient> findByPatientId(String patientId);

    // Search patients by name (case-insensitive)
    List<Patient> findByNameContainingIgnoreCase(String name);

    // Check if email already exists
    boolean existsByEmail(String email);

    Optional<Patient> findByEmail(String email);

    // Find patient by phone number
    Optional<Patient> findByPhone(String phone);
}