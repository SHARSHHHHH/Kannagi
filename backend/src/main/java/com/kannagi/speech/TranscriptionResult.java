package com.kannagi.speech;

public record TranscriptionResult(
        String transcript,
        String detectedLanguage,
        double confidence,
        int durationSeconds
) {}
