package com.ghp.gestionhospitale.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Setter
@Document(collection = "users")
public class User implements UserDetails {

    // Getters and setters for other fields
    @Getter
    @Id
    private String id;
    private String username;
    private String password;
    @Getter
    private String role; // ADMIN, PATIENT
    @Getter
    private String patientId; // For patient role
    private boolean enabled = true;

    // Spring Security 6 UserDetails implementation
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    // Constructors, getters, and setters
    public User() {
    }

    public User(String username, String password, String role, String patientId) {
        this.username = username;
        this.password = password;
        this.role = role;
        this.patientId = patientId;
    }

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                ", role='" + role + '\'' +
                ", patientId='" + patientId + '\'' +
                ", enabled=" + enabled +
                '}';
    }
}

