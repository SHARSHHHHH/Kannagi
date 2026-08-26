package com.kannagi.legal;

import com.kannagi.ai.AIService;
import com.kannagi.ai.model.AIAnalysisResult;
import com.kannagi.common.exception.NotFoundException;
import com.kannagi.common.web.ApiResponse;
import com.kannagi.legal.domain.LegalCaseSummary;
import com.kannagi.legal.domain.LegalResource;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/legal")
@RequiredArgsConstructor
@Tag(name = "Legal")
public class LegalController {

    private static final String DISCLAIMER =
            "This information is for awareness and does not replace advice from a "
            + "qualified legal professional.";

    private static final String CASE_DISCLAIMER =
            "This is a summary of a previous case and does not predict the outcome of "
            + "your case.";

    private final LegalSearchService legalSearchService;
    private final AIService aiService;

    public record LegalResourceList(List<LegalResource> resources, String disclaimer) {}

    public record LegalCaseList(List<LegalCaseSummary> cases, String disclaimer) {}

    public record LegalResourceDetail(LegalResource resource, String disclaimer) {}

    public record SearchRequest(String text, String language) {}

    public record SearchResult(
            AIAnalysisResult analysis,
            List<LegalResource> resources,
            String disclaimer,
            String noMatchNote) {}

    /**
     * Describe the situation, get the provisions that may relate to it.
     *
     * The text is read for concern categories, and those categories select rows
     * from the verified table. The model chooses which rows to show; it never
     * writes what they say.
     */
    @PostMapping("/search")
    @Operation(summary = "Describe a situation and see which verified provisions may relate")
    public ApiResponse<SearchResult> search(@RequestBody SearchRequest request) {
        AIAnalysisResult analysis =
                aiService.analyse(request.text(), request.language());

        List<LegalResource> matched = legalSearchService.forFindings(analysis.categories());

        return ApiResponse.ok(new SearchResult(
                analysis,
                matched.isEmpty() ? legalSearchService.forCategory(null) : matched,
                DISCLAIMER,
                matched.isEmpty()
                        ? "We could not match your description to a specific area, so "
                          + "everything we hold is listed below. Adding more detail usually "
                          + "narrows it."
                        : null));
    }

    @GetMapping("/resources")
    @Operation(summary = "Verified legal material, optionally filtered by concern category")
    public ApiResponse<LegalResourceList> resources(
            @RequestParam(required = false) String category) {
        return ApiResponse.ok(
                new LegalResourceList(legalSearchService.forCategory(category), DISCLAIMER));
    }

    @GetMapping("/resources/{id}")
    @Operation(summary = "One legal provision, with its source and verification date")
    public ApiResponse<LegalResourceDetail> resource(@PathVariable UUID id) {
        LegalResource resource = legalSearchService.byId(id);
        if (resource == null) {
            throw new NotFoundException("We could not find that legal information.");
        }
        return ApiResponse.ok(new LegalResourceDetail(resource, DISCLAIMER));
    }

    @GetMapping("/cases")
    @Operation(summary = "Summaries of previously decided cases")
    public ApiResponse<LegalCaseList> cases(@RequestParam(required = false) String category) {
        return ApiResponse.ok(
                new LegalCaseList(legalSearchService.cases(category), CASE_DISCLAIMER));
    }
}
