package com.ghp.gestionhospitale.repository;

import com.ghp.gestionhospitale.model.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends MongoRepository<Doctor, String> {

    // Find doctor by custom doctorId
    Optional<Doctor> findByDoctorId(String doctorId);

    // Find doctors by specialization
    List<Doctor> findBySpecialization(String specialization);

    // Search doctors by name (case-insensitive)
    List<Doctor> findByNameContainingIgnoreCase(String name);

    List<Doctor> findBySpecializationContainingIgnoreCase(String specialization);

    // Check if doctor email exists
    boolean existsByEmail(String email);


    @Query("{ 'workingDays': ?0 }")
    List<Doctor> findByWorkingDay(String day);
}