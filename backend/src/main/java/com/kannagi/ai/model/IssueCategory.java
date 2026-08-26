package com.kannagi.ai.model;

/** Multi-label. A single description commonly touches several of these at once. */
public enum IssueCategory {
    DOMESTIC_DOWRY("Dowry-related harassment"),
    DOMESTIC_CONSENT("Consent violation"),
    DOMESTIC_SEXUAL_ABUSE("Sexual abuse at home"),
    DOMESTIC_IN_LAWS_ABUSE("Abuse by in-laws"),
    DOMESTIC_PARENTAL_ABUSE("Abuse by parents or family"),
    DOMESTIC_VIOLENCE("Domestic violence"),
    DOMESTIC_EMOTIONAL_ABUSE("Emotional abuse"),
    DOMESTIC_FINANCIAL_ABUSE("Financial control"),

    WORKPLACE_SEXUAL_HARASSMENT("Workplace sexual harassment"),
    WORKPLACE_RAGGING("Ragging"),
    WORKPLACE_BULLYING("Workplace bullying"),
    WORKPLACE_INEQUALITY("Gender inequality at work"),
    WORKPLACE_BOUNDARY_VIOLATION("Boundary violation at work"),
    WORKPLACE_UNPAID_WORK("Unpaid or unrecognised work"),
    WORKPLACE_POWER_ABUSE("Abuse of authority"),

    PUBLIC_EVE_TEASING("Street harassment"),
    PUBLIC_STALKING("Stalking"),
    PUBLIC_HARASSMENT("Public harassment"),

    EDUCATION_FINANCIAL_DIFFICULTY("Difficulty affording education"),
    EDUCATION_TEACHER_ABUSE("Abuse by a teacher or authority"),
    EDUCATION_LACK_OF_ASSISTANCE("Lack of academic support"),

    PSYCHOLOGICAL_DISTRESS("Psychological distress"),
    OTHER("Something else");

    private final String label;

    IssueCategory(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}
