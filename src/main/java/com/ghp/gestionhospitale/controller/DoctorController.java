package com.ghp.gestionhospitale.controller;

import com.ghp.gestionhospitale.model.Doctor;
import com.ghp.gestionhospitale.services.DoctorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://web-frontend"})
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    // GET all doctors
    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.findAll());
    }

    // GET doctor by ID
    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable String id) {
        Doctor doctor = doctorService.findById(id);
        return doctor != null ? ResponseEntity.ok(doctor) : ResponseEntity.notFound().build();
    }

    // GET doctor by doctorId (our custom ID like "D2001")
    @GetMapping("/by-doctor-id/{doctorId}")
    public ResponseEntity<Doctor> getDoctorByDoctorId(@PathVariable String doctorId) {
        Doctor doctor = doctorService.findByDoctorId(doctorId);
        return doctor != null ? ResponseEntity.ok(doctor) : ResponseEntity.notFound().build();
    }

    // POST - Create new doctor = works
    @PostMapping
    public ResponseEntity<Doctor> createDoctor(@Valid @RequestBody Doctor doctor) {
        Doctor savedDoctor = doctorService.save(doctor);
        return ResponseEntity.ok(savedDoctor);
    }

    // PUT - Update doctor
    @PutMapping("/{id}")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable String id, @Valid @RequestBody Doctor doctor) {
        Doctor updated = doctorService.update(id, doctor);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    // DELETE - Delete doctor
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable String id) {
        boolean deleted = doctorService.delete(id);
        return deleted ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // SEARCH - Search doctors by specialty
    @GetMapping("/specialty/{specialty}")
    public ResponseEntity<List<Doctor>> getDoctorsBySpecialty(@PathVariable String specialty) {
        List<Doctor> doctors = doctorService.findBySpecialty(specialty);
        return ResponseEntity.ok(doctors);
    }

    // SEARCH - Search doctors by name
    @GetMapping("/search")
    public ResponseEntity<List<Doctor>> searchDoctors(@RequestParam String name) {
        List<Doctor> doctors = doctorService.searchByName(name);
        return ResponseEntity.ok(doctors);
    }
}