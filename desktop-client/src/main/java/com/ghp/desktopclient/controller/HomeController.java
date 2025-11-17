package com.ghp.desktopclient.controller;

import com.ghp.desktopclient.ApiClient;
import com.ghp.desktopclient.ApiClient.ApiException;
import com.ghp.desktopclient.models.Doctor;
import com.ghp.desktopclient.models.Patient;
import com.ghp.desktopclient.Validation;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;
import java.util.List;

@Controller
public class HomeController {
    
    @GetMapping("/home")
    public String home(HttpSession session, Model model) {
        String token = (String) session.getAttribute("jwtToken");
        if (token == null) {
            return "redirect:/login";
        }
        
        model.addAttribute("username", session.getAttribute("username"));
        
        // Load doctors
        try {
            ApiClient apiClient = new ApiClient();
            apiClient.setJwtToken(token);
            List<Doctor> doctors = apiClient.listDoctors();
            model.addAttribute("doctors", doctors != null ? doctors : List.of());
            if (doctors != null && !doctors.isEmpty()) {
                model.addAttribute("doctorsCount", doctors.size());
            }
        } catch (ApiException e) {
            String errorMsg = e.getMessage();
            if (errorMsg.contains("401") || errorMsg.contains("403")) {
                session.invalidate();
                return "redirect:/login?error=session_expired";
            }
            model.addAttribute("doctorsError", "Failed to load doctors: " + errorMsg);
            model.addAttribute("doctors", List.of());
        } catch (Exception e) {
            model.addAttribute("doctorsError", "Failed to load doctors: " + e.getMessage());
            model.addAttribute("doctors", List.of());
        }
        
        return "home";
    }
    
    @PostMapping("/patients/create")
    public String createPatient(
            @RequestParam String nom,
            @RequestParam String dateNaissance,
            @RequestParam String sexe,
            @RequestParam String telephone,
            @RequestParam String email,
            @RequestParam String adresse,
            HttpSession session,
            RedirectAttributes redirectAttributes) {
        
        String token = (String) session.getAttribute("jwtToken");
        if (token == null) {
            return "redirect:/login";
        }
        
        // Validate input
        StringBuilder errors = new StringBuilder();
        if (!Validation.notBlank(nom)) errors.append("Full name is required. ");
        if (!Validation.dateIso(dateNaissance)) errors.append("Date must be in yyyy-MM-dd format. ");
        else if (!Validation.dateNotInFuture(dateNaissance)) errors.append("Date cannot be in the future. ");
        if (!Validation.sexValid(sexe)) errors.append("Gender must be M (Male) or F (Female). ");
        if (!Validation.phone(telephone)) errors.append("Phone number is invalid. ");
        if (!Validation.email(email)) errors.append("Email address is invalid. ");
        if (!Validation.notBlank(adresse)) errors.append("Address is required. ");
        
        if (errors.length() > 0) {
            redirectAttributes.addFlashAttribute("patientError", errors.toString().trim());
            return "redirect:/home";
        }
        
        try {
            ApiClient apiClient = new ApiClient();
            apiClient.setJwtToken(token);
            Patient patient = new Patient(nom.trim(), dateNaissance.trim(), sexe.trim(), 
                                         telephone.trim(), email.trim(), adresse.trim());
            Patient created = apiClient.createPatient(patient);
            String patientId = created.getPatientId() != null ? created.getPatientId() : 
                              (created.getId() != null ? created.getId() : "Unknown");
            redirectAttributes.addFlashAttribute("patientSuccess", 
                "✓ Patient created successfully! Patient ID: " + patientId);
        } catch (ApiException e) {
            String errorMsg = e.getMessage();
            if (errorMsg.contains("401") || errorMsg.contains("403")) {
                session.invalidate();
                return "redirect:/login?error=session_expired";
            }
            redirectAttributes.addFlashAttribute("patientError", 
                "Failed to create patient: " + (errorMsg.length() > 200 ? errorMsg.substring(0, 200) : errorMsg));
        } catch (IOException | InterruptedException e) {
            redirectAttributes.addFlashAttribute("patientError", 
                "Network error: " + e.getMessage());
        }
        
        return "redirect:/home";
    }
}

