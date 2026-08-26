package com.kannagi.ai.model;

import java.util.List;

public record ChatRequest(
        List<ChatTurn> history,
        String message,
        String language,
        boolean psychologicalMode
) {}
