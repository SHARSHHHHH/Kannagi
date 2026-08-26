package com.kannagi.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AdminNotificationRepository extends JpaRepository<AdminNotification, UUID> {

    List<AdminNotification> findByResolvedAtIsNullOrderByCreatedAtDesc();

    List<AdminNotification> findByTypeAndResolvedAtIsNullOrderByCreatedAtDesc(String type);

    long countByResolvedAtIsNull();
}
