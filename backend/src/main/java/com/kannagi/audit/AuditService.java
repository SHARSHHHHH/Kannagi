package com.kannagi.audit;

import com.kannagi.audit.domain.AuditLog;
import com.kannagi.audit.domain.SecurityEvent;
import com.kannagi.privacy.crypto.HmacSha256Service;
import com.kannagi.user.domain.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * Writes the audit trail.
 *
 * Audit writes run in their own transaction so that a failure to record an
 * event never rolls back the user's actual work — and, just as importantly, so
 * that a failed action still leaves a trace.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final SecurityEventRepository securityEventRepository;
    private final HmacSha256Service hmacSha256Service;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(UUID actorId, Role actorRole, AuditAction action,
                       String resourceType, String resourceId, boolean success) {
        record(actorId, actorRole, action, resourceType, resourceId, success, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(UUID actorId, Role actorRole, AuditAction action,
                       String resourceType, String resourceId, boolean success,
                       Map<String, Object> metadata) {
        try {
            auditLogRepository.save(AuditLog.builder()
                    .actorId(actorId)
                    .actorRole(actorRole)
                    .action(action)
                    .resourceType(resourceType)
                    .resourceId(resourceId)
                    .success(success)
                    .metadata(metadata)
                    .build());
        } catch (Exception e) {
            log.error("Failed to write audit log for action {}", action, e);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordSecurityEvent(String eventType, SecurityEvent.Severity severity,
                                    UUID actorId, String ipAddress, String userAgent,
                                    String detail) {
        try {
            securityEventRepository.save(SecurityEvent.builder()
                    .eventType(eventType)
                    .severity(severity)
                    .actorId(actorId)
                    .ipHash(hashIp(ipAddress))
                    .userAgent(truncate(userAgent, 255))
                    .detail(truncate(detail, 500))
                    .build());
        } catch (Exception e) {
            log.error("Failed to write security event {}", eventType, e);
        }
    }

    private String hashIp(String ip) {
        if (ip == null || ip.isBlank()) {
            return null;
        }
        return hmacSha256Service.index(ip);
    }

    private String truncate(String value, int max) {
        if (value == null) {
            return null;
        }
        return value.length() <= max ? value : value.substring(0, max);
    }
}
