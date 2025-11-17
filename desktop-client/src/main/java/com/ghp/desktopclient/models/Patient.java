package com.ghp.desktopclient.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Patient {
    private String id;
    @JsonProperty("patientId")
    private String patientId;
    @JsonProperty("name")
    private String nom;
    @JsonProperty("dob")
    private String dateNaissance; // yyyy-MM-dd
    @JsonProperty("gender")
    private String sexe; // M/F
    @JsonProperty("phone")
    private String telephone;
    private String email;
    @JsonProperty("address")
    private String adresse;

    public Patient() {}

    public Patient(String nom, String dateNaissance, String sexe, String telephone, String email, String adresse) {
        this.nom = nom;
        this.dateNaissance = dateNaissance;
        this.sexe = sexe;
        this.telephone = telephone;
        this.email = email;
        this.adresse = adresse;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getDateNaissance() { return dateNaissance; }
    public void setDateNaissance(String dateNaissance) { this.dateNaissance = dateNaissance; }
    public String getSexe() { return sexe; }
    public void setSexe(String sexe) { this.sexe = sexe; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }
}
