package com.ghp.gestionhospitale.dto;

import java.time.LocalDate;

public class AppointmentReport {

    private String id;
    private String appointmentId;
    private String patientId;
    private String patientName;
    private String doctorId;
    private String doctorName;
    private LocalDate date;
    private String time;
    private String status;

    public AppointmentReport() {
    }

    public AppointmentReport(String id,
                             String appointmentId,
                             String patientId,
                             String patientName,
                             String doctorId,
                             String doctorName,
                             LocalDate date,
                             String time,
                             String status) {
        this.id = id;
        this.appointmentId = appointmentId;
        this.patientId = patientId;
        this.patientName = patientName;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.date = date;
        this.time = time;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public String getAppointmentId() {
        return appointmentId;
    }

    public String getPatientId() {
        return patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public String getDoctorId() {
        return doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getTime() {
        return time;
    }

    public String getStatus() {
        return status;
    }
}
