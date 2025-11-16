package com.ghp.gestionhospitale.controller;

import com.ghp.gestionhospitale.model.Appointment;
import com.ghp.gestionhospitale.model.Doctor;
import com.ghp.gestionhospitale.services.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:3000") // For frontend connection
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    // GET all appointments
    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.findAll());
    }

    // GET appointments by ID
    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable String id) {
        Appointment appointment = appointmentService.findById(id);
        return appointment != null ? ResponseEntity.ok(appointment) : ResponseEntity.notFound().build();
    }

    // GET available time slots for a doctor on specific date
    @GetMapping("/availability/{doctorId}")
    public ResponseEntity<List<String>> getAvailableSlots(
            @PathVariable String doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<String> slots = appointmentService.getAvailableSlots(doctorId, date);
        return ResponseEntity.ok(slots);
    }

    // Book new appointment
    @PostMapping
    public ResponseEntity<?> bookAppointment(@RequestBody Appointment appointment) {
        try {
            System.out.println("🎯 RECEIVED APPOINTMENT: " + appointment);
            System.out.println("⏰ TIME FIELD: '" + appointment.getTime() + "'");
            System.out.println("📅 DATE FIELD: " + appointment.getDate());

            Appointment savedAppointment = appointmentService.bookAppointment(appointment);
            return ResponseEntity.ok(savedAppointment);
        } catch (Exception e) {
            System.out.println("❌ ERROR: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to book appointment: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Update appointment
    @PutMapping("/{id}")
    public ResponseEntity<Appointment> updateAppointment(
            @PathVariable String id,
            @RequestBody Appointment appointment) {
        Appointment updated = appointmentService.updateAppointment(id, appointment);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    // Cancel appointment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelAppointment(@PathVariable String id) {
        boolean deleted = appointmentService.cancelAppointment(id);
        return deleted ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // GET appointments by doctor
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByDoctor(@PathVariable String doctorId) {
        List<Appointment> appointments = appointmentService.findByDoctorId(doctorId);
        return ResponseEntity.ok(appointments);
    }

    // GET appointments by patient
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByPatient(@PathVariable String patientId) {
        List<Appointment> appointments = appointmentService.findByPatientId(patientId);
        return ResponseEntity.ok(appointments);
    }

    // GET appointments by date
    @GetMapping("/date/{date}")
    public ResponseEntity<List<Appointment>> getAppointmentsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Appointment> appointments = appointmentService.findByDate(date);
        return ResponseEntity.ok(appointments);
    }
}
