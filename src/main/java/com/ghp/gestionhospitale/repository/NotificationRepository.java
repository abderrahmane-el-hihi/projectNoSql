package com.ghp.gestionhospitale.repository;

import com.ghp.gestionhospitale.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findTop50ByOrderByTimestampDesc();
}
