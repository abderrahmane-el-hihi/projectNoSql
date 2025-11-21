package com.ghp.gestionhospitale.controller;

import com.ghp.gestionhospitale.dto.AppointmentReport;
import com.ghp.gestionhospitale.model.Appointment;
import com.ghp.gestionhospitale.services.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://web-frontend"})
public class ReportController {

    @Autowired
    private ReportService reportService;

    /**
     * Get all appointments for a given day
     * GET /api/reports/appointments-by-date?date=YYYY-MM-DD
     */
    @GetMapping("/appointments-by-date")
    public ResponseEntity<List<AppointmentReport>> getAppointmentsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AppointmentReport> appointments = reportService.getAppointmentsByDate(date);
        return ResponseEntity.ok(appointments);
    }

    /**
     * Count appointments per doctor within a date range
     * GET /api/reports/appointments-per-doctor?from=YYYY-MM-DD&to=YYYY-MM-DD
     */
    @GetMapping("/appointments-per-doctor")
    public ResponseEntity<List<Map<String, Object>>> getAppointmentsPerDoctor(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<Map<String, Object>> result = reportService.getAppointmentsPerDoctor(from, to);
        return ResponseEntity.ok(result);
    }

    /**
     * Count appointments per specialty within a date range
     * GET /api/reports/appointments-per-specialty?from=YYYY-MM-DD&to=YYYY-MM-DD
     */
    @GetMapping("/appointments-per-specialty")
    public ResponseEntity<List<Map<String, Object>>> getAppointmentsPerSpecialty(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<Map<String, Object>> result = reportService.getAppointmentsPerSpecialty(from, to);
        return ResponseEntity.ok(result);
    }

    /**
     * Get patients with multiple recent appointments
     * GET /api/reports/frequent-patients?from=YYYY-MM-DD&minCount=2
     */
    @GetMapping("/frequent-patients")
    public ResponseEntity<List<Map<String, Object>>> getFrequentPatients(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(defaultValue = "2") int minCount) {
        List<Map<String, Object>> result = reportService.getFrequentPatients(from, minCount);
        return ResponseEntity.ok(result);
    }
}
