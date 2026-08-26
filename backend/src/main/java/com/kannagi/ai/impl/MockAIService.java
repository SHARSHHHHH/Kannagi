package com.kannagi.ai.impl;

import com.kannagi.ai.AIService;
import com.kannagi.ai.model.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Rule-based reading of a description. Runs with no API key and no network.
 *
 * Every finding traces to a phrase the person actually wrote, which is what
 * lets the interface show why a concern was raised. A language model cannot
 * offer that as reliably, so this stays the default rather than the fallback.
 */
@Service
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "mock", matchIfMissing = true)
@Slf4j
public class MockAIService implements AIService {

    public MockAIService() {
        log.info("AI provider: offline rule-based analysis (no API key required).");
    }

    @Override
    public AIAnalysisResult analyse(String text, String language) {
        String haystack = normalise(text);

        List<CategoryFinding> findings = findCategories(haystack);
        List<String> distress = findDistress(haystack);
        SafetyLevel safety = assessSafety(haystack);

        if (!distress.isEmpty()) {
            findings = withPsychologicalDistress(findings, distress);
        }

        List<SupportType> support = suggestSupport(findings, safety);
        List<String> followUps = followUpsFor(findings);

        return new AIAnalysisResult(
                findings,
                distress,
                support,
                safety,
                followUps,
                composeResponse(findings, safety),
                AIAnalysisResult.STANDARD_DISCLAIMER,
                LanguageDetector.detect(text, language));
    }

    @Override
    public ChatResponse chat(ChatRequest request) {
        AIAnalysisResult analysis = analyse(request.message(), request.language());

        String reply = request.psychologicalMode()
                ? psychologicalReply(analysis)
                : analysis.response();

        return new ChatResponse(
                reply,
                suggestedReplies(analysis),
                analysis,
                request.psychologicalMode()
                        ? "This is automated support, not care from a psychologist. "
                          + "It cannot diagnose anything or replace therapy."
                        : AIAnalysisResult.STANDARD_DISCLAIMER);
    }

    // ── Classification ──────────────────────────────────────────────

    private List<CategoryFinding> findCategories(String haystack) {
        Map<IssueCategory, List<String>> hits = new EnumMap<>(IssueCategory.class);

        SignalLexicon.STRONG.forEach((category, phrases) -> {
            List<String> matched = phrases.stream()
                    .filter(haystack::contains)
                    .toList();
            if (!matched.isEmpty()) {
                hits.put(category, matched);
            }
        });

        if (hits.isEmpty()) {
            return List.of();
        }

        return hits.entrySet().stream()
                .map(entry -> {
                    List<String> matched = entry.getValue();
                    ConcernLevel level = levelFor(matched.size(), haystack);
                    return new CategoryFinding(
                            entry.getKey(),
                            entry.getKey().label(),
                            level,
                            reasonFor(entry.getKey(), matched),
                            matched);
                })
                .sorted(Comparator.comparingInt((CategoryFinding f) -> f.level().ordinal()).reversed())
                .limit(5)
                .collect(Collectors.toList());
    }

    /**
     * More distinct matching phrases means a stronger signal — not a stronger
     * claim about what happened, only about what the text points at.
     */
    private ConcernLevel levelFor(int matchCount, String haystack) {
        boolean repeated = haystack.contains("keeps")
                || haystack.contains("every day")
                || haystack.contains("again and again")
                || haystack.contains("constantly")
                || haystack.contains("always");

        if (matchCount >= 3 || (matchCount >= 2 && repeated)) {
            return ConcernLevel.HIGH;
        }
        if (matchCount == 2 || repeated) {
            return ConcernLevel.MODERATE;
        }
        return ConcernLevel.LOW;
    }

    private String reasonFor(IssueCategory category, List<String> matched) {
        String quoted = matched.stream()
                .limit(3)
                .map(phrase -> "\"" + phrase + "\"")
                .collect(Collectors.joining(", "));
        return "You mentioned " + quoted + ", which is language often associated with "
                + category.label().toLowerCase(Locale.ROOT) + ".";
    }

    private List<CategoryFinding> withPsychologicalDistress(
            List<CategoryFinding> findings, List<String> distress) {

        List<CategoryFinding> combined = new ArrayList<>(findings);
        combined.add(new CategoryFinding(
                IssueCategory.PSYCHOLOGICAL_DISTRESS,
                IssueCategory.PSYCHOLOGICAL_DISTRESS.label(),
                distress.size() >= 3 ? ConcernLevel.HIGH
                        : distress.size() == 2 ? ConcernLevel.MODERATE : ConcernLevel.LOW,
                "You described " + String.join(", ", distress)
                        + ". These are things people often report when under sustained stress.",
                distress));
        return combined;
    }

    private List<String> findDistress(String haystack) {
        return SignalLexicon.DISTRESS.entrySet().stream()
                .filter(entry -> entry.getValue().stream().anyMatch(haystack::contains))
                .map(Map.Entry::getKey)
                .toList();
    }

    private SafetyLevel assessSafety(String haystack) {
        if (SignalLexicon.SAFETY_HIGH.stream().anyMatch(haystack::contains)) {
            return SafetyLevel.HIGH;
        }
        if (SignalLexicon.SAFETY_MODERATE.stream().anyMatch(haystack::contains)) {
            return SafetyLevel.MODERATE;
        }
        return SafetyLevel.NONE;
    }

    private List<SupportType> suggestSupport(List<CategoryFinding> findings, SafetyLevel safety) {
        Set<SupportType> types = new LinkedHashSet<>();

        if (safety == SafetyLevel.HIGH) {
            types.add(SupportType.SAFETY);
        }
        for (CategoryFinding finding : findings) {
            switch (finding.category()) {
                case PSYCHOLOGICAL_DISTRESS -> types.add(SupportType.PSYCHOLOGICAL);
                case EDUCATION_FINANCIAL_DIFFICULTY -> types.add(SupportType.FINANCIAL);
                case OTHER -> types.add(SupportType.GENERAL);
                default -> types.add(SupportType.LEGAL);
            }
        }
        if (types.isEmpty()) {
            types.add(SupportType.GENERAL);
        }
        return List.copyOf(types);
    }

    private List<String> followUpsFor(List<CategoryFinding> findings) {
        return findings.stream()
                .map(f -> SignalLexicon.FOLLOW_UPS.get(f.category()))
                .filter(Objects::nonNull)
                .flatMap(List::stream)
                .distinct()
                .limit(3)
                .toList();
    }

    // ── Wording ─────────────────────────────────────────────────────

    private String composeResponse(List<CategoryFinding> findings, SafetyLevel safety) {
        if (safety == SafetyLevel.HIGH) {
            return "Thank you for telling me. Some of what you wrote suggests you may not "
                 + "be safe right now. If you are in immediate danger, contacting local "
                 + "emergency services or someone who can reach you quickly may matter more "
                 + "than anything here. Nothing has been reported anywhere — that is your "
                 + "decision, not mine.";
        }
        if (findings.isEmpty()) {
            return "Thank you for writing that. I have not picked out anything specific yet, "
                 + "which usually means I need a little more. What has been happening, and "
                 + "for how long?";
        }

        String named = findings.stream()
                .limit(2)
                .map(f -> f.label().toLowerCase(Locale.ROOT))
                .collect(Collectors.joining(" and "));

        return "Thank you for telling me. What you have described may relate to " + named
             + ". I could be wrong, and you know your situation better than I do. "
             + "Would it help to see what protections may apply, to talk to someone, "
             + "or to keep writing?";
    }

    private String psychologicalReply(AIAnalysisResult analysis) {
        if (analysis.safetyLevel() == SafetyLevel.HIGH) {
            return "What you have written sounds frightening, and I am glad you said it. "
                 + "If you are thinking about harming yourself, please reach someone who "
                 + "can be with you — a helpline, a doctor, or a person you trust. "
                 + "I can stay here with you while you decide.";
        }
        if (!analysis.distressIndicators().isEmpty()) {
            return "That sounds exhausting to carry. You mentioned "
                 + String.join(" and ", analysis.distressIndicators())
                 + " — those are the kinds of things that make everything else harder to "
                 + "manage. What has been the heaviest part of it lately?";
        }
        return "I am listening. Take whatever time you need — you do not have to explain "
             + "it in order, or justify any of it.";
    }

    private List<String> suggestedReplies(AIAnalysisResult analysis) {
        if (analysis.indicatesImmediateSafetyConcern()) {
            return List.of("Help me think about staying safe",
                           "Talk to a support professional",
                           "I want to keep talking");
        }
        List<String> options = new ArrayList<>();
        if (analysis.supportTypes().contains(SupportType.LEGAL)) {
            options.add("Understand my legal options");
        }
        if (analysis.supportTypes().contains(SupportType.PSYCHOLOGICAL)) {
            options.add("Talk to a psychologist");
        }
        options.add("I just want to talk");
        return options;
    }

    private String normalise(String text) {
        return text == null ? "" : text.toLowerCase(Locale.ROOT)
                .replace("\u2019", "'")
                .replaceAll("\\s+", " ");
    }
}
