package com.kannagi.legal;

import com.kannagi.ai.model.CategoryFinding;
import com.kannagi.legal.domain.LegalCaseSummary;
import com.kannagi.legal.domain.LegalResource;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Retrieval, not generation.
 *
 * Legal material shown to anyone comes from rows a person verified against a
 * source. Nothing here asks a model what the law says, which is the difference
 * between explaining a provision and inventing one.
 */
@Service
@RequiredArgsConstructor
public class LegalSearchService {

    private final LegalRepository legalRepository;
    private final LegalCaseRepository legalCaseRepository;

    @Transactional(readOnly = true)
    public List<LegalResource> forFindings(List<CategoryFinding> findings) {
        Set<LegalResource> matched = new LinkedHashSet<>();
        for (CategoryFinding finding : findings) {
            matched.addAll(legalRepository.findByCategory(finding.category().name()));
        }
        return new ArrayList<>(matched);
    }

    @Transactional(readOnly = true)
    public List<LegalResource> forCategory(String category) {
        return category == null || category.isBlank()
                ? legalRepository.findByActiveTrue()
                : legalRepository.findByCategory(category);
    }

    @Transactional(readOnly = true)
    public LegalResource byId(UUID id) {
        return legalRepository.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<LegalCaseSummary> cases(String category) {
        return category == null || category.isBlank()
                ? legalCaseRepository.findByActiveTrueOrderByYearDesc()
                : legalCaseRepository.findByIssueCategoryAndActiveTrueOrderByYearDesc(category);
    }
}
