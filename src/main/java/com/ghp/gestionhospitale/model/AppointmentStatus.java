package com.ghp.gestionhospitale.model;

/**
 * Appointment status constants matching the French specification.
 * Used in API responses and database storage.
 */
public class AppointmentStatus {
    public static final String PLANIFIE = "PLANIFIE";  // Scheduled
    public static final String TERMINE = "TERMINE";    // Completed
    public static final String ANNULE = "ANNULE";      // Cancelled

    private AppointmentStatus() {
        // Utility class - prevent instantiation
    }
}

