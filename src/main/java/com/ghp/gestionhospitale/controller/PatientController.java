package com.ghp.gestionhospitale.controller;

import com.ghp.gestionhospitale.model.Patient;
import com.ghp.gestionhospitale.services.PatientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://web-frontend"})
public class PatientController {

    @Autowired
    private PatientService patientService;

    // GET all patients
    @GetMapping
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientService.findAll());
    }

    // GET patient by ID
    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable String id) {
        return patientService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET patient by patientId (our custom ID like "P1801")
    @GetMapping("/by-patient-id/{patientId}")
    public ResponseEntity<Patient> getPatientByPatientId(@PathVariable String patientId) {
        return patientService.findByPatientId(patientId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST - Create new patient
    @PostMapping
    public ResponseEntity<Patient> createPatient(@Valid @RequestBody Patient patient) {
        // Use the service method that generates patientId if not provided
        if (patient.getPatientId() == null || patient.getPatientId().isEmpty()) {
            Patient savedPatient = patientService.createPatient(
                    patient.getName(),
                    patient.getDob(),
                    patient.getGender(),
                    patient.getPhone(),
                    patient.getEmail(),
                    patient.getAddress()
            );
            return ResponseEntity.ok(savedPatient);
        } else {
            Patient savedPatient = patientService.save(patient);
            return ResponseEntity.ok(savedPatient);
        }
    }

    // PUT - Update patient
    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable String id, @Valid @RequestBody Patient patient) {
        Patient updated = patientService.update(id, patient);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    // DELETE - Delete patient
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable String id) {
        boolean deleted = patientService.delete(id);
        return deleted ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // SEARCH - Search patients by name
    @GetMapping("/search")
    public ResponseEntity<List<Patient>> searchPatients(@RequestParam String name) {
        List<Patient> patients = patientService.searchByName(name);
        return ResponseEntity.ok(patients);
    }
}
