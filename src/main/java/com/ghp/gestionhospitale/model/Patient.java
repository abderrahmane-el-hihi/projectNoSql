package com.ghp.gestionhospitale.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    
    @NotBlank(message = "Le nom est obligatoire")
    private String name;
    
    @NotNull(message = "La date de naissance est obligatoire")
    private LocalDate dob; // Date of birth
    
    @NotBlank(message = "Le sexe est obligatoire")
    private String gender;
    
    @NotBlank(message = "Le téléphone est obligatoire")
    private String phone;
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;
    
    @NotBlank(message = "L'adresse est obligatoire")
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
