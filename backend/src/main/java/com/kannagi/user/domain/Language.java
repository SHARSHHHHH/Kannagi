package com.kannagi.user.domain;

import java.util.Arrays;

/**
 * Launch languages. Language handling is centralised here rather than scattered
 * as string literals, so adding a language is one enum constant plus its
 * translation bundle.
 */
public enum Language {
    EN("en", "English", "English"),
    TA("ta", "Tamil", "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD"),
    HI("hi", "Hindi", "\u0939\u093F\u0928\u094D\u0926\u0940"),
    TE("te", "Telugu", "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41"),
    ML("ml", "Malayalam", "\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02"),
    KN("kn", "Kannada", "\u0C95\u0CA8\u0CCD\u0CA8\u0CA1");

    private final String code;
    private final String englishName;
    private final String nativeName;

    Language(String code, String englishName, String nativeName) {
        this.code = code;
        this.englishName = englishName;
        this.nativeName = nativeName;
    }

    public String code() {
        return code;
    }

    public String englishName() {
        return englishName;
    }

    public String nativeName() {
        return nativeName;
    }

    public static Language fromCode(String code) {
        return Arrays.stream(values())
                .filter(l -> l.code.equalsIgnoreCase(code))
                .findFirst()
                .orElse(EN);
    }
}
