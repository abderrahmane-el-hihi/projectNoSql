package com.ghp.gestionhospitale.services;

import com.ghp.gestionhospitale.model.Appointment;
import com.ghp.gestionhospitale.model.Doctor;
import com.ghp.gestionhospitale.model.Notification;
import com.ghp.gestionhospitale.model.Patient;
import com.ghp.gestionhospitale.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void notifyDoctorNewAppointment(Doctor doctor, Patient patient, Appointment appointment) {
        String body = String.format(
                "Rendez-vous le %s à %s avec le patient %s.",
                appointment.getDate(),
                appointment.getTime(),
                patient.getName()
        );
        sendIfAvailable("EMAIL", "DOCTOR", doctor.getName(), doctor.getEmail(),
                String.format("Email pour le Dr %s concernant %s : %s", doctor.getName(), patient.getName(), body));
        sendIfAvailable("SMS", "DOCTOR", doctor.getName(), doctor.getPhone(),
                String.format("SMS pour le Dr %s concernant %s : %s", doctor.getName(), patient.getName(), body));
    }

    public void notifyPatientNewAppointment(Patient patient, Doctor doctor, Appointment appointment) {
        String body = String.format(
                "Votre rendez-vous avec %s est prévu le %s à %s.",
                doctor.getName(),
                appointment.getDate(),
                appointment.getTime()
        );
        sendIfAvailable("EMAIL", "PATIENT", patient.getName(), patient.getEmail(),
                String.format("Email pour %s concernant le Dr %s : %s", patient.getName(), doctor.getName(), body));
        sendIfAvailable("SMS", "PATIENT", patient.getName(), patient.getPhone(),
                String.format("SMS pour %s concernant le Dr %s : %s", patient.getName(), doctor.getName(), body));
    }

    private void sendIfAvailable(String channel, String recipientType, String recipientName, String contact, String message) {
        if (!hasText(contact)) {
            return;
        }
        System.out.printf("%s notification -> %s | %s%n", channel.equals("EMAIL") ? "📧" : "📱", contact, message);
        Notification notification = new Notification();
        notification.setTimestamp(LocalDateTime.now());
        notification.setChannel(channel);
        notification.setRecipientType(recipientType);
        notification.setRecipientName(recipientName);
        notification.setMessage(message);
        notificationRepository.save(notification);
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
