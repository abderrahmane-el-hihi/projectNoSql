package com.ghp.gestionhospitale.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "doctors")
public class Doctor {
    @Id
    private String id;

    private String doctorId; // Custom ID like "D2001"
    
    @NotBlank(message = "Le nom est obligatoire")
    private String name;
    
    @NotBlank(message = "La spécialité est obligatoire")
    private String specialization;
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;
    
    @NotBlank(message = "Le téléphone est obligatoire")
    private String phone;
    
    private List<String> workingDays; // ["Monday", "Tuesday", "Thursday"]

    // Inner class for working hours
    private WorkingHours workingHours;

    // Inner class for break time
    private BreakTime breakTime;

    private int appointmentDuration; // in minutes (e.g., 30)
    private List<String> unavailableDates; // ["2025-12-25", "2026-01-01"]

    // Inner class for Working Hours
    public static class WorkingHours {
        private String start; // "09:00"
        private String end;   // "17:00"

        // Constructors
        public WorkingHours() {
        }

        public WorkingHours(String start, String end) {
            this.start = start;
            this.end = end;
        }

        // Getters and Setters
        public String getStart() {
            return start;
        }

        public void setStart(String start) {
            this.start = start;
        }

        public String getEnd() {
            return end;
        }

        public void setEnd(String end) {
            this.end = end;
        }
    }

    // Inner class for Break Time
    public static class BreakTime {
        private String start; // "12:00"
        private String end;   // "13:00"

        // Constructors
        public BreakTime() {
        }

        public BreakTime(String start, String end) {
            this.start = start;
            this.end = end;
        }

        // Getters and Setters
        public String getStart() {
            return start;
        }

        public void setStart(String start) {
            this.start = start;
        }

        public String getEnd() {
            return end;
        }

        public void setEnd(String end) {
            this.end = end;
        }
    }

    // Default constructor
    public Doctor() {
    }

    // Constructor with basic parameters
    public Doctor(String doctorId, String name, String specialization,
                  String email, String phone) {
        this.doctorId = doctorId;
        this.name = name;
        this.specialization = specialization;
        this.email = email;
        this.phone = phone;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public List<String> getWorkingDays() {
        return workingDays;
    }

    public void setWorkingDays(List<String> workingDays) {
        this.workingDays = workingDays;
    }

    public WorkingHours getWorkingHours() {
        return workingHours;
    }

    public void setWorkingHours(WorkingHours workingHours) {
        this.workingHours = workingHours;
    }

    public BreakTime getBreakTime() {
        return breakTime;
    }

    public void setBreakTime(BreakTime breakTime) {
        this.breakTime = breakTime;
    }

    public int getAppointmentDuration() {
        return appointmentDuration;
    }

    public void setAppointmentDuration(int appointmentDuration) {
        this.appointmentDuration = appointmentDuration;
    }

    public List<String> getUnavailableDates() {
        return unavailableDates;
    }

    public void setUnavailableDates(List<String> unavailableDates) {
        this.unavailableDates = unavailableDates;
    }

    @Override
    public String toString() {
        return "Doctor{" +
                "id='" + id + '\'' +
                ", doctorId='" + doctorId + '\'' +
                ", name='" + name + '\'' +
                ", specialization='" + specialization + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", workingDays=" + workingDays +
                ", workingHours=" + workingHours +
                ", breakTime=" + breakTime +
                ", appointmentDuration=" + appointmentDuration +
                ", unavailableDates=" + unavailableDates +
                '}';
    }
}