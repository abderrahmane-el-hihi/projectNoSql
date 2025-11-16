package com.ghp.gestionhospitale.repository;

import com.ghp.gestionhospitale.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends MongoRepository<Appointment, String> {

    // Find appointments by doctor ID and date
    List<Appointment> findByDoctorIdAndDate(String doctorId, LocalDate date);

    // Find appointments by patient ID
    List<Appointment> findByPatientId(String patientId);

    // Find appointments by date only
    List<Appointment> findByDate(LocalDate date);

    // Find appointment by custom appointmentId
    Optional<Appointment> findByAppointmentId(String appointmentId);

    @Query("{ 'status': ?0 }")
    List<Appointment> findByStatus(String status);

    List<Appointment> findByDoctorId(String doctorId);
}
