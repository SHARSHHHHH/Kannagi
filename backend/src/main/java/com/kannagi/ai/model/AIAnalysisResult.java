package com.kannagi.ai.model;

import java.util.List;

/**
 * The structured result of reading a description.
 *
 * Every phrase here is hedged by construction: categories are "possible
 * concerns", indicators are "possible distress indicators". Nothing in this
 * record asserts that anything happened or that anyone is guilty.
 */
public record AIAnalysisResult(
        List<CategoryFinding> categories,
        List<String> distressIndicators,
        List<SupportType> supportTypes,
        SafetyLevel safetyLevel,
        List<String> followUpQuestions,
        String response,
        String disclaimer,
        String detectedLanguage
) {
    public static final String STANDARD_DISCLAIMER =
            "This is a reading of what you wrote, not a diagnosis or a legal opinion. "
            + "It may be wrong, and only you know your situation.";

    public boolean indicatesImmediateSafetyConcern() {
        return safetyLevel == SafetyLevel.HIGH
                || categories.stream()
                        .anyMatch(c -> c.level() == ConcernLevel.IMMEDIATE_SAFETY_CONCERN);
    }
}
