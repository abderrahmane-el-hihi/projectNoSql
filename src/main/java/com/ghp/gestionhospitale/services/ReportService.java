package com.ghp.gestionhospitale.services;

import com.ghp.gestionhospitale.dto.AppointmentReport;
import com.ghp.gestionhospitale.model.Appointment;
import com.ghp.gestionhospitale.model.Doctor;
import com.ghp.gestionhospitale.model.Patient;
import com.ghp.gestionhospitale.repository.AppointmentRepository;
import com.ghp.gestionhospitale.repository.DoctorRepository;
import com.ghp.gestionhospitale.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    /**
     * Get all appointments for a given day
     */
    public List<AppointmentReport> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByDate(date).stream()
                .map(this::mapToReport)
                .toList();
    }

    /**
     * Count appointments per doctor within a date range
     * Returns list with doctorId, doctorName, and count
     */
    public List<Map<String, Object>> getAppointmentsPerDoctor(LocalDate from, LocalDate to) {
        List<Appointment> appointments = appointmentRepository.findAll().stream()
                .filter(apt -> !apt.getDate().isBefore(from) && !apt.getDate().isAfter(to))
                .toList();

        Map<String, Long> doctorCounts = appointments.stream()
                .collect(Collectors.groupingBy(Appointment::getDoctorId, Collectors.counting()));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Long> entry : doctorCounts.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("doctorId", entry.getKey());
            
            item.put("doctorName", findDoctorName(entry.getKey()));
            
            item.put("count", entry.getValue());
            result.add(item);
        }

        // Sort by count descending
        result.sort((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")));
        
        return result;
    }

    /**
     * Count appointments per specialty within a date range
     */
    public List<Map<String, Object>> getAppointmentsPerSpecialty(LocalDate from, LocalDate to) {
        List<Appointment> appointments = appointmentRepository.findAll().stream()
                .filter(apt -> !apt.getDate().isBefore(from) && !apt.getDate().isAfter(to))
                .toList();

        Map<String, Long> specialtyCounts = new HashMap<>();
        
        for (Appointment apt : appointments) {
            findDoctorByIdentifier(apt.getDoctorId()).ifPresent(doctor -> {
                String specialty = doctor.getSpecialization();
                specialtyCounts.put(specialty, specialtyCounts.getOrDefault(specialty, 0L) + 1);
            });
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Long> entry : specialtyCounts.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("specialty", entry.getKey());
            item.put("count", entry.getValue());
            result.add(item);
        }

        // Sort by count descending
        result.sort((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")));
        
        return result;
    }

    /**
     * Get patients with multiple appointments within a date range
     * Returns patients with count >= minCount
     */
    public List<Map<String, Object>> getFrequentPatients(LocalDate from, int minCount) {
        List<Appointment> appointments = appointmentRepository.findAll().stream()
                .filter(apt -> !apt.getDate().isBefore(from))
                .toList();

        Map<String, Long> patientCounts = appointments.stream()
                .collect(Collectors.groupingBy(Appointment::getPatientId, Collectors.counting()));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Long> entry : patientCounts.entrySet()) {
            if (entry.getValue() >= minCount) {
                Map<String, Object> item = new HashMap<>();
                item.put("patientId", entry.getKey());
                item.put("patientName", findPatientName(entry.getKey()));
                item.put("count", entry.getValue());
                result.add(item);
            }
        }

        // Sort by count descending
        result.sort((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")));
        
        return result;
    }

    private AppointmentReport mapToReport(Appointment appointment) {
        return new AppointmentReport(
                appointment.getId(),
                appointment.getAppointmentId(),
                appointment.getPatientId(),
                findPatientName(appointment.getPatientId()),
                appointment.getDoctorId(),
                findDoctorName(appointment.getDoctorId()),
                appointment.getDate(),
                appointment.getTime(),
                appointment.getStatus()
        );
    }

    private String findPatientName(String identifier) {
        if (identifier == null) {
            return "Unknown";
        }
        return patientRepository.findByPatientId(identifier)
                .or(() -> patientRepository.findByIdentifier(identifier))
                .or(() -> patientRepository.findById(identifier))
                .map(Patient::getName)
                .orElse("Unknown");
    }

    private String findDoctorName(String identifier) {
        return findDoctorByIdentifier(identifier)
                .map(Doctor::getName)
                .orElse("Unknown");
    }

    private Optional<Doctor> findDoctorByIdentifier(String identifier) {
        if (identifier == null) {
            return Optional.empty();
        }
        Optional<Doctor> doctorOpt = doctorRepository.findByDoctorId(identifier);
        if (doctorOpt.isPresent()) {
            return doctorOpt;
        }
        return doctorRepository.findById(identifier);
    }
}
