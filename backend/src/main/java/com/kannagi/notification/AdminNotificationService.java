package com.kannagi.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Writes to the admin feed. Runs in its own transaction for the same reason
 * {@code AuditService} does — raising a notification is a side effect of
 * something else succeeding, and a failure here must never roll back the
 * thing that triggered it.
 */
@Service
@RequiredArgsConstructor
public class AdminNotificationService {

    private final AdminNotificationRepository repository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void raise(String type, String resourceType, UUID resourceId,
                      String message, String severity) {
        repository.save(AdminNotification.builder()
                .type(type)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .message(message)
                .severity(AdminNotification.Severity.valueOf(severity))
                .build());
    }

    @Transactional(readOnly = true)
    public List<AdminNotification> unresolved() {
        return repository.findByResolvedAtIsNullOrderByCreatedAtDesc();
    }

    @Transactional
    public void resolve(UUID id) {
        repository.findById(id).ifPresent(notification -> {
            notification.setResolvedAt(Instant.now());
            repository.save(notification);
        });
    }

    @Transactional
    public void markRead(UUID id) {
        repository.findById(id).ifPresent(notification -> {
            if (notification.getReadAt() == null) {
                notification.setReadAt(Instant.now());
                repository.save(notification);
            }
        });
    }
}
