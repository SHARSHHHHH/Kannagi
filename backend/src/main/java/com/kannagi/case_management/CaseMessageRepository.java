package com.kannagi.case_management;

import com.kannagi.case_management.domain.CaseMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CaseMessageRepository extends JpaRepository<CaseMessage, UUID> {

    List<CaseMessage> findByCaseEntityIdAndDeletedAtIsNullOrderByCreatedAtAsc(UUID caseId);

    long countByCaseEntityIdAndDeletedAtIsNull(UUID caseId);
}
