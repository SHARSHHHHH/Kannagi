package com.kannagi.ai.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kannagi.ai.AIService;
import com.kannagi.ai.model.*;
import com.kannagi.common.config.AppProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Any OpenAI-compatible chat endpoint.
 *
 * The model is asked for structured JSON and its output is mapped onto the same
 * records the rule-based service produces, so nothing downstream knows which
 * one answered.
 *
 * Every failure path falls back to {@link MockAIService}. A woman mid-sentence
 * must not hit an error because a third-party API had a bad minute.
 */
@Service
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "openai")
@Slf4j
public class OpenAICompatibleAIService implements AIService {

    private static final String SYSTEM_PROMPT = """
            You support women describing difficult situations. You are not a lawyer,
            not a therapist, and not an investigator.

            Rules you must never break:
            - Never diagnose a mental health condition.
            - Never state that a crime occurred or that anyone is guilty.
            - Never give definitive legal advice.
            - Never claim to have contacted anyone on her behalf.
            - Always hedge: "what you described may relate to", never "you have".
            - Never reveal your reasoning process.

            Reply with JSON only, no prose and no code fences:
            {"categories":[{"category":"<enum>","level":"LOW|MODERATE|HIGH","reason":"<one sentence quoting her words>"}],
             "distressIndicators":["..."],
             "supportTypes":["LEGAL|PSYCHOLOGICAL|GENERAL|FINANCIAL|SAFETY"],
             "safetyLevel":"NONE|LOW|MODERATE|HIGH",
             "followUpQuestions":["..."],
             "response":"<two or three warm sentences, ending by offering her a choice>"}

            Valid category values: %s
            Reply in the same language she used.
            """.formatted(String.join(", ",
                    java.util.Arrays.stream(IssueCategory.values()).map(Enum::name).toList()));

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final MockAIService fallback;
    private final String apiKey;
    private final String baseUrl;
    private final String model;

    public OpenAICompatibleAIService(RestTemplate restTemplate, ObjectMapper objectMapper,
                                     AppProperties props) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.fallback = new MockAIService();
        this.apiKey = props.ai().apiKey();
        this.baseUrl = props.ai().baseUrl();
        this.model = props.ai().model();

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("AI_API_KEY must be set when AI_PROVIDER=openai");
        }
        log.info("AI provider: {} via {}", model, baseUrl);
    }

    @Override
    public AIAnalysisResult analyse(String text, String language) {
        try {
            JsonNode parsed = objectMapper.readTree(complete(List.of(
                    Map.of("role", "system", "content", SYSTEM_PROMPT),
                    Map.of("role", "user", "content", text))));

            return new AIAnalysisResult(
                    readCategories(parsed.path("categories")),
                    readStrings(parsed.path("distressIndicators")),
                    readSupportTypes(parsed.path("supportTypes")),
                    readEnum(parsed.path("safetyLevel").asText(), SafetyLevel.class, SafetyLevel.NONE),
                    readStrings(parsed.path("followUpQuestions")),
                    parsed.path("response").asText(""),
                    AIAnalysisResult.STANDARD_DISCLAIMER,
                    LanguageDetector.detect(text, language));

        } catch (Exception e) {
            log.warn("AI provider unavailable; using offline analysis", e);
            return fallback.analyse(text, language);
        }
    }

    @Override
    public ChatResponse chat(ChatRequest request) {
        try {
            AIAnalysisResult analysis = analyse(request.message(), request.language());
            return new ChatResponse(analysis.response(), List.of(), analysis, analysis.disclaimer());
        } catch (Exception e) {
            log.warn("AI provider unavailable; using offline reply", e);
            return fallback.chat(request);
        }
    }

    private String complete(List<Map<String, String>> messages) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", messages,
                "temperature", 0.3,
                "response_format", Map.of("type", "json_object"));

        ResponseEntity<JsonNode> response = restTemplate.exchange(
                baseUrl + "/chat/completions", HttpMethod.POST,
                new HttpEntity<>(body, headers), JsonNode.class);

        return response.getBody()
                .path("choices").path(0).path("message").path("content").asText();
    }

    private List<CategoryFinding> readCategories(JsonNode node) {
        List<CategoryFinding> findings = new ArrayList<>();
        node.forEach(item -> {
            IssueCategory category = readEnum(
                    item.path("category").asText(), IssueCategory.class, IssueCategory.OTHER);
            findings.add(new CategoryFinding(
                    category,
                    category.label(),
                    readEnum(item.path("level").asText(), ConcernLevel.class, ConcernLevel.LOW),
                    item.path("reason").asText(""),
                    List.of()));
        });
        return findings;
    }

    private List<SupportType> readSupportTypes(JsonNode node) {
        List<SupportType> types = new ArrayList<>();
        node.forEach(item -> types.add(
                readEnum(item.asText(), SupportType.class, SupportType.GENERAL)));
        return types;
    }

    private List<String> readStrings(JsonNode node) {
        List<String> values = new ArrayList<>();
        node.forEach(item -> values.add(item.asText()));
        return values;
    }

    private <E extends Enum<E>> E readEnum(String raw, Class<E> type, E fallbackValue) {
        try {
            return Enum.valueOf(type, raw.trim().toUpperCase());
        } catch (Exception e) {
            return fallbackValue;
        }
    }
}
