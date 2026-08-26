package com.kannagi.ai.model;

import java.util.List;

public record ChatResponse(
        String reply,
        List<String> suggestedReplies,
        AIAnalysisResult analysis,
        String disclaimer
) {}
