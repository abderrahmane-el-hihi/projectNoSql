package com.ghp.gestionhospitale.controller;

import com.ghp.gestionhospitale.model.Patient;
import com.ghp.gestionhospitale.model.User;
import com.ghp.gestionhospitale.repository.UserRepository;
import com.ghp.gestionhospitale.security.JwtUtil;
import com.ghp.gestionhospitale.services.PatientService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://web-frontend",
        "http://web-frontend:80"
})
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final PatientService patientService;

    @Autowired
    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          PatientService patientService) {  // ← Add PatientService here
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.patientService = patientService;  // ← Now it will be properly injected
    }


    // LOGIN ENDPOINT
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            User user = (User) authentication.getPrincipal();

            String jwt = jwtUtil.generateToken(user);

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("username", user.getUsername());
            response.put("role", user.getRole());
            response.put("patientId", user.getPatientId());
            response.put("message", "Login successful");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid username or password");
            return ResponseEntity.status(401).body(errorResponse);
        }
    }

    //  PATIENT REGISTRATION
    @PostMapping("/register")
    public ResponseEntity<?> registerPatient(@RequestBody RegisterRequest registerRequest) {
        try {
            // 1. Check if username already exists
            if (userRepository.existsByUsername(registerRequest.getUsername())) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Username already exists");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // 2. Check if email already exists in patients
            if (patientService.existsByEmail(registerRequest.getEmail())) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Email already registered");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // 3. Create Patient record with all details
            Patient patient = patientService.createPatient(
                    registerRequest.getName(),
                    registerRequest.getDob(),
                    registerRequest.getGender(),
                    registerRequest.getPhone(),
                    registerRequest.getEmail(),
                    registerRequest.getAddress()
            );

            // 4. Create User account linked to the patient
            User user = new User();
            user.setUsername(registerRequest.getUsername());
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            user.setRole("PATIENT");
            user.setPatientId(patient.getPatientId()); // Link to the patient record

            userRepository.save(user);

            // 5. Return success response with patient details

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Patient registered successfully");
            response.put("username", registerRequest.getUsername());
            response.put("patientId", patient.getPatientId());
            response.put("patient", patient);
            response.put("role", "PATIENT");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // ADMIN REGISTRATION (for initial setup)
    @PostMapping("/register-admin")
    public ResponseEntity<?> registerAdmin(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Username already exists");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole("ADMIN");
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Admin registered successfully");
        response.put("username", registerRequest.getUsername());
        response.put("role", "ADMIN");


        return ResponseEntity.ok(response);
    }

    // GET CURRENT USER INFO
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUserProfile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        try {
            User user = (User) authentication.getPrincipal();
            Map<String, Object> userProfile = new HashMap<>();

            // Basic user info
            userProfile.put("username", user.getUsername());
            userProfile.put("role", user.getRole());


            // If user is a patient, fetch their complete patient profile
            if ("PATIENT".equals(user.getRole()) && user.getPatientId() != null) {
                patientService.findByPatientId(user.getPatientId()).ifPresent(patient -> {
                    Map<String, Object> patientProfile = new HashMap<>();
                    patientProfile.put("patientId", patient.getPatientId());
                    patientProfile.put("name", patient.getName());
                    patientProfile.put("dob", patient.getDob());
                    patientProfile.put("gender", patient.getGender());
                    patientProfile.put("phone", patient.getPhone());
                    patientProfile.put("email", patient.getEmail());
                    patientProfile.put("address", patient.getAddress());

                    userProfile.put("patientProfile", patientProfile);
                });
            }

            return ResponseEntity.ok(userProfile);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch user profile: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Request DTOs
    @Setter
    @Getter
    public static class LoginRequest {
        // Getters and setters
        private String username;
        private String password;

    }

    @Setter
    @Getter
    public static class RegisterRequest {
        // Getters and setters for all fields
        private String username;
        private String password;

        // Patient details
        private String name;
        private LocalDate dob;
        private String gender;
        private String phone;
        private String email;
        private String address;
    }
}
