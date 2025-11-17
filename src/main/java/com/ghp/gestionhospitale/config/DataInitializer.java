package com.ghp.gestionhospitale.config;

import com.ghp.gestionhospitale.model.User;
import com.ghp.gestionhospitale.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(2) // Run after connection test (Order(1))
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize admin user if it doesn't exist
        initializeAdminUser();
    }

    private void initializeAdminUser() {
        String adminUsername = "admin";
        String adminPassword = "admin";

        if (!userRepository.existsByUsername(adminUsername)) {
            User adminUser = new User();
            adminUser.setUsername(adminUsername);
            adminUser.setPassword(passwordEncoder.encode(adminPassword));
            adminUser.setRole("ADMIN");
            adminUser.setEnabled(true);

            userRepository.save(adminUser);
            System.out.println("✓ Admin user created successfully");
            System.out.println("  Username: " + adminUsername);
            System.out.println("  Password: " + adminPassword);
        } else {
            System.out.println("✓ Admin user already exists");
        }
    }
}

