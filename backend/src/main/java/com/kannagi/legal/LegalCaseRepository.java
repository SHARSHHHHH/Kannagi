package com.kannagi.legal;

import com.kannagi.legal.domain.LegalCaseSummary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LegalCaseRepository extends JpaRepository<LegalCaseSummary, UUID> {

    List<LegalCaseSummary> findByActiveTrueOrderByYearDesc();

    List<LegalCaseSummary> findByIssueCategoryAndActiveTrueOrderByYearDesc(String issueCategory);
}
