package com.kannagi.ai.impl;

/**
 * Identifies the script a message is written in.
 *
 * Unicode block ranges rather than a model: the six launch languages use
 * distinct scripts, so counting characters is both exact and instant. It cannot
 * tell romanised Tamil from English, which is why the caller's declared
 * language wins when the text is all Latin.
 */
public final class LanguageDetector {

    private LanguageDetector() {}

    public static String detect(String text, String declaredLanguage) {
        if (text == null || text.isBlank()) {
            return declaredLanguage == null ? "en" : declaredLanguage;
        }

        int tamil = 0, devanagari = 0, telugu = 0, malayalam = 0, kannada = 0;

        for (char c : text.toCharArray()) {
            if (c >= 0x0B80 && c <= 0x0BFF) tamil++;
            else if (c >= 0x0900 && c <= 0x097F) devanagari++;
            else if (c >= 0x0C00 && c <= 0x0C7F) telugu++;
            else if (c >= 0x0D00 && c <= 0x0D7F) malayalam++;
            else if (c >= 0x0C80 && c <= 0x0CFF) kannada++;
        }

        int highest = Math.max(tamil,
                Math.max(devanagari, Math.max(telugu, Math.max(malayalam, kannada))));

        if (highest == 0) {
            // All Latin. Could be English or romanised Tamil; trust what she chose.
            return declaredLanguage == null ? "en" : declaredLanguage;
        }
        if (highest == tamil) return "ta";
        if (highest == devanagari) return "hi";
        if (highest == telugu) return "te";
        if (highest == malayalam) return "ml";
        return "kn";
    }
}
