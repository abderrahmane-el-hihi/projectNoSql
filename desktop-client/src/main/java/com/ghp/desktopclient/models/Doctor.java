package com.ghp.desktopclient.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Doctor {
    private String id;
    private String doctorId;
    private String name;
    private String specialization;
    private String email;
    private String phone;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    @Override 
    public String toString() {
        return name != null && !name.isBlank() ? name : (doctorId != null ? doctorId : "Unknown Doctor");
    }
}
