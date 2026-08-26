package com.kannagi.lawyer;

import com.kannagi.lawyer.domain.Professional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ProfessionalSearchService {

    public record Filters(String state, String language, String area,
                          Boolean legalAid, Boolean online) {}

    private final ProfessionalRepository repository;

    @Transactional(readOnly = true)
    public List<Professional> search(Professional.Kind kind, Filters filters) {
        return repository.findByKindAndAcceptingClientsTrue(kind).stream()
                .filter(p -> matches(filters.state(), p.getState()))
                .filter(p -> contains(filters.language(), p.getLanguages()))
                .filter(p -> filters.area() == null
                        || contains(filters.area(), p.getPracticeAreas())
                        || contains(filters.area(), p.getSpecialisations()))
                .filter(p -> filters.legalAid() == null
                        || p.isAcceptsLegalAid() == filters.legalAid())
                .filter(p -> filters.online() == null
                        || p.isOffersOnline() == filters.online())
                .sorted(Comparator
                        .comparing((Professional p) ->
                                p.getRating() == null ? BigDecimal.ZERO : p.getRating())
                        .reversed()
                        .thenComparing(Comparator.comparingInt(
                                Professional::getYearsExperience).reversed()))
                .toList();
    }

    private boolean matches(String wanted, String actual) {
        return wanted == null || (actual != null && actual.equalsIgnoreCase(wanted));
    }

    private boolean contains(String wanted, String haystack) {
        return wanted == null || (haystack != null
                && haystack.toLowerCase(Locale.ROOT).contains(wanted.toLowerCase(Locale.ROOT)));
    }
}
