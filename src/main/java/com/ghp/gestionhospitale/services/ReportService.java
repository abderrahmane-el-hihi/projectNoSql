package com.ghp.gestionhospitale.services;

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
    public List<Appointment> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByDate(date);
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
            
            Optional<Doctor> doctorOpt = doctorRepository.findByDoctorId(entry.getKey());
            if (doctorOpt.isPresent()) {
                item.put("doctorName", doctorOpt.get().getName());
            } else {
                item.put("doctorName", "Unknown");
            }
            
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
            Optional<Doctor> doctorOpt = doctorRepository.findByDoctorId(apt.getDoctorId());
            if (doctorOpt.isPresent()) {
                String specialty = doctorOpt.get().getSpecialization();
                specialtyCounts.put(specialty, specialtyCounts.getOrDefault(specialty, 0L) + 1);
            }
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
                
                Optional<Patient> patientOpt = patientRepository.findByPatientId(entry.getKey());
                if (patientOpt.isPresent()) {
                    item.put("patientName", patientOpt.get().getName());
                } else {
                    // Try by MongoDB ID if patientId doesn't match
                    Optional<Patient> patientByIdOpt = patientRepository.findById(entry.getKey());
                    if (patientByIdOpt.isPresent()) {
                        item.put("patientName", patientByIdOpt.get().getName());
                    } else {
                        item.put("patientName", "Unknown");
                    }
                }
                
                item.put("count", entry.getValue());
                result.add(item);
            }
        }

        // Sort by count descending
        result.sort((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")));
        
        return result;
    }
}

