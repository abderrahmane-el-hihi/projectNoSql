package com.ghp.gestionhospitale.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Setter
@Getter
@Document(collection = "patients")
public class Patient {
    // Getters and Setters
    @Id
    private String id;

    private String patientId; // Custom ID like "P1801"
    private String name;
    private LocalDate dob; // Date of birth
    private String gender;
    private String phone;
    private String email;
    private String address;

    // Default constructor
    public Patient() {
    }

    // Constructor with parameters
    public Patient(String patientId, String name, LocalDate dob, String gender,
                   String phone, String email, String address) {
        this.patientId = patientId;
        this.name = name;
        this.dob = dob;
        this.gender = gender;
        this.phone = phone;
        this.email = email;
        this.address = address;
    }

    // toString method for debugging
    @Override
    public String toString() {
        return "Patient{" +
                "id='P" + id + '\'' +
                ", patientId='" + patientId + '\'' +
                ", name='" + name + '\'' +
                ", dob=" + dob +
                ", gender='" + gender + '\'' +
                ", phone='" + phone + '\'' +
                ", email='" + email + '\'' +
                ", address='" + address + '\'' +
                '}';
    }
}
