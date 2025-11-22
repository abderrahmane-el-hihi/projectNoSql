package com.ghp.gestionhospitale.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private LocalDateTime timestamp;
    private String channel; // EMAIL or SMS
    private String recipientType; // DOCTOR or PATIENT
    private String recipientName;
    private String message;
}
