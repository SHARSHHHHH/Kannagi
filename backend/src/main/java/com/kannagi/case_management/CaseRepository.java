package com.kannagi.case_management;

import com.kannagi.case_management.domain.Case;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CaseRepository extends JpaRepository<Case, UUID> {

    Optional<Case> findByIdAndDeletedAtIsNull(UUID id);

    Optional<Case> findByReferenceAndDeletedAtIsNull(String reference);

    boolean existsByReference(String reference);

    Page<Case> findByOwnerIdAndDeletedAtIsNullOrderByLastActivityAtDesc(
            UUID ownerId, Pageable pageable);

    long countByOwnerIdAndDeletedAtIsNull(UUID ownerId);
}
