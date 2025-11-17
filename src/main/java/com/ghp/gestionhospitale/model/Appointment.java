package com.ghp.gestionhospitale.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "appointments")
public class Appointment {
    @Id
    private String id;

    private String appointmentId; // Custom ID like "A3001"
    
    @NotBlank(message = "L'ID du patient est obligatoire")
    private String patientId;     // Reference to patient
    
    @NotBlank(message = "L'ID du médecin est obligatoire")
    private String doctorId;      // Reference to doctor
    
    @NotNull(message = "La date est obligatoire")
    private LocalDate date;       // Appointment date
    
    @NotBlank(message = "L'heure est obligatoire")
    private String time;          // Appointment time "10:30"
    
    private String status;        // "PLANIFIE", "TERMINE", "ANNULE"
    private String remarks;       // Additional notes

    // Default constructor
    public Appointment() {
    }

    // Constructor with parameters
    public Appointment(String appointmentId, String patientId, String doctorId,
                       LocalDate date, String time, String status, String remarks) {
        this.appointmentId = appointmentId;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.date = date;
        this.time = time;
        this.status = status;
        this.remarks = remarks;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(String appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    @Override
    public String toString() {
        return "Appointment{" +
                "id='" + id + '\'' +
                ", appointmentId='" + appointmentId + '\'' +
                ", patientId='" + patientId + '\'' +
                ", doctorId='" + doctorId + '\'' +
                ", date=" + date +
                ", time='" + time + '\'' +
                ", status='" + status + '\'' +
                ", remarks='" + remarks + '\'' +
                '}';
    }
}
