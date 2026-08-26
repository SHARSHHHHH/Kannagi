package com.kannagi.lawyer;

import com.kannagi.common.exception.NotFoundException;
import com.kannagi.common.web.ApiResponse;
import com.kannagi.lawyer.domain.Professional;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Directory listings.
 *
 * Lawyers and psychologists share an implementation but keep separate paths, so
 * the URL says what the person is actually looking for.
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Professionals")
public class ProfessionalController {

    private static final String DEMO_NOTICE =
            "Profiles marked DEMO PROFILE are fictional examples created for this "
            + "prototype. They are not real practitioners and cannot be contacted.";

    private final ProfessionalRepository repository;
    private final ProfessionalSearchService searchService;

    public record ProfessionalList(List<Professional> professionals, String notice) {}

    @GetMapping("/api/lawyers")
    @Operation(summary = "Find lawyers. Set legalAid=true for legal-aid practitioners.")
    public ApiResponse<ProfessionalList> lawyers(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String practiceArea,
            @RequestParam(required = false) Boolean legalAid,
            @RequestParam(required = false) Boolean online) {

        return ApiResponse.ok(new ProfessionalList(
                searchService.search(Professional.Kind.LAWYER,
                        new ProfessionalSearchService.Filters(blankToNull(state),
                                blankToNull(language), blankToNull(practiceArea),
                                legalAid, online)),
                DEMO_NOTICE));
    }

    @GetMapping("/api/lawyers/{id}")
    @Operation(summary = "One lawyer's profile")
    public ApiResponse<Professional> lawyer(@PathVariable UUID id) {
        return ApiResponse.ok(load(id, Professional.Kind.LAWYER));
    }

    @GetMapping("/api/psychologists")
    @Operation(summary = "Find psychologists")
    public ApiResponse<ProfessionalList> psychologists(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String specialisation,
            @RequestParam(required = false) Boolean online) {

        return ApiResponse.ok(new ProfessionalList(
                searchService.search(Professional.Kind.PSYCHOLOGIST,
                        new ProfessionalSearchService.Filters(blankToNull(state),
                                blankToNull(language), blankToNull(specialisation),
                                null, online)),
                DEMO_NOTICE));
    }

    @GetMapping("/api/psychologists/{id}")
    @Operation(summary = "One psychologist's profile")
    public ApiResponse<Professional> psychologist(@PathVariable UUID id) {
        return ApiResponse.ok(load(id, Professional.Kind.PSYCHOLOGIST));
    }

    private Professional load(UUID id, Professional.Kind kind) {
        return repository.findById(id)
                .filter(professional -> professional.getKind() == kind)
                .orElseThrow(() -> new NotFoundException("We could not find that profile."));
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
