package com.kannagi.audit;

import com.kannagi.audit.domain.SecurityEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SecurityEventRepository extends JpaRepository<SecurityEvent, UUID> {

    Page<SecurityEvent> findAllByOrderByOccurredAtDesc(Pageable pageable);

    Page<SecurityEvent> findBySeverityOrderByOccurredAtDesc(
            SecurityEvent.Severity severity, Pageable pageable);
}
