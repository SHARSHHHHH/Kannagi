package com.kannagi.ai.model;

import java.util.List;

/**
 * One identified concern, with the reason it was identified.
 *
 * The reason is a plain-language summary of what in her own words triggered the
 * match, so the finding can be argued with. It is not the model's internal
 * reasoning, which is never shown.
 */
public record CategoryFinding(
        IssueCategory category,
        String label,
        ConcernLevel level,
        String reason,
        List<String> matchedSignals
) {}
