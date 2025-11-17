package com.ghp.gestionhospitale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GestionHospitaleApplication implements CommandLineRunner {

    @Autowired
    private MongoTemplate mongoTemplate;

    public static void main(String[] args) {
        SpringApplication.run(GestionHospitaleApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        // Test MongoDB connection
        try {
            System.out.println("MongoDB Connection: SUCCESS");
            System.out.println("Database: " + mongoTemplate.getDb().getName());

        } catch (Exception e) {
            System.out.println(" MongoDB Connection: FAILED");
            System.out.println("Error: " + e.getMessage());
        }
    }
}
