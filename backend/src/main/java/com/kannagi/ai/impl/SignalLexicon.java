package com.kannagi.ai.impl;

import com.kannagi.ai.model.IssueCategory;

import java.util.List;
import java.util.Map;

import static com.kannagi.ai.model.IssueCategory.*;

/**
 * The phrases that point at each category.
 *
 * Written out rather than learned, because a hackathon demo has to work with no
 * API key on a bad connection, and because a rule you can read is a rule you can
 * argue with. Every match here can be traced to a specific phrase in her own
 * words, which is what makes the "why we identified this" panel honest.
 *
 * Romanised Tamil, Hindi and Telugu terms are included alongside English, since
 * people type in a mix. Native-script terms are matched too.
 *
 * This is not a good classifier. It is a transparent one. Setting
 * AI_PROVIDER=openai swaps it for a model when a key is available.
 */
final class SignalLexicon {

    private SignalLexicon() {}

    /** Strong signals: a match is worth more than a weak one. */
    static final Map<IssueCategory, List<String>> STRONG = Map.ofEntries(
            Map.entry(DOMESTIC_DOWRY, List.of(
                    "dowry", "varadhatchanai", "seer", "jahez", "katnam",
                    "demand money from my parents", "demands money from my parents",
                    "demanding money from my parents", "money from my parents",
                    "asking my family for money",
                    "gold", "wedding gifts", "\u0BB5\u0BB0\u0BA4\u0B9F\u0B9A\u0BCD\u0B9A\u0BBF\u0BA9\u0BC8")),

            Map.entry(DOMESTIC_IN_LAWS_ABUSE, List.of(
                    "in-laws", "in laws", "mother-in-law", "father-in-law",
                    "mother in law", "sister-in-law", "maamiyar", "athai",
                    "husband's family", "husbands family", "sasural")),

            Map.entry(DOMESTIC_VIOLENCE, List.of(
                    "hits me", "hit me", "beats me", "beat me", "beating",
                    "slapped", "slap me", "pushed me", "hurt me physically",
                    "throws things", "adikkiraar", "maarthaal", "physically hurt")),

            Map.entry(DOMESTIC_EMOTIONAL_ABUSE, List.of(
                    "insults me", "humiliates me", "shouts at me", "calls me names",
                    "makes me feel worthless", "blames me for everything",
                    "threatens me", "threaten me", "threatening me",
                    "controls what i", "isolates me",
                    "not allowed to see", "won't let me meet")),

            Map.entry(DOMESTIC_FINANCIAL_ABUSE, List.of(
                    "takes my salary", "controls my money", "not allowed to work",
                    "won't give me money", "no access to money", "my own bank account",
                    "took my jewellery", "took my jewelry")),

            Map.entry(DOMESTIC_CONSENT, List.of(
                    "without my consent", "forces me", "forced me", "made me do",
                    "against my will", "i said no", "i say no but")),

            Map.entry(DOMESTIC_SEXUAL_ABUSE, List.of(
                    "sexually", "touches me", "touched me inappropriately",
                    "marital rape", "forces himself")),

            Map.entry(DOMESTIC_PARENTAL_ABUSE, List.of(
                    "my parents hit", "my father hits", "my mother hits",
                    "my brother hits", "my family beats", "locked me in")),

            Map.entry(WORKPLACE_SEXUAL_HARASSMENT, List.of(
                    "inappropriate messages", "inappropriate texts", "sexual messages",
                    "sending me inappropriate", "sends me inappropriate",
                    "asked me out repeatedly", "meet him privately", "meet me privately",
                    "meeting him privately", "meeting me privately", "him privately",
                    "touched me at work", "comments about my body", "sexual favour",
                    "sexual favor", "uncomfortable messages", "vulgar messages",
                    "late night messages", "asking for photos")),

            Map.entry(WORKPLACE_POWER_ABUSE, List.of(
                    "my promotion depends", "promotion depends on", "threatens my job",
                    "threatened my job", "will fire me", "fire me if",
                    "my manager", "my boss", "my supervisor", "my hod", "my professor")),

            Map.entry(WORKPLACE_RAGGING, List.of(
                    "ragging", "seniors force", "seniors made me", "initiation")),

            Map.entry(WORKPLACE_BULLYING, List.of(
                    "bullying at work", "colleagues exclude", "targeted at work",
                    "humiliated in meetings", "shouted at in front of")),

            Map.entry(WORKPLACE_INEQUALITY, List.of(
                    "paid less than", "passed over for promotion", "because i am a woman",
                    "male colleagues get", "not taken seriously because")),

            Map.entry(WORKPLACE_UNPAID_WORK, List.of(
                    "not paid for", "unpaid overtime", "no salary", "salary not paid",
                    "working without pay", "extra work without")),

            Map.entry(PUBLIC_STALKING, List.of(
                    "following me", "follows me", "waits outside", "waiting outside",
                    "stalking", "shows up wherever", "keeps appearing")),

            Map.entry(PUBLIC_EVE_TEASING, List.of(
                    "eve teasing", "eve-teasing", "catcall", "comments on the street",
                    "whistles at me", "passes comments", "on the bus", "in the train")),

            Map.entry(PUBLIC_HARASSMENT, List.of(
                    "harassed in public", "groped", "touched me on the",
                    "obscene", "flashed")),

            Map.entry(EDUCATION_FINANCIAL_DIFFICULTY, List.of(
                    "cannot pay fees", "can't pay fees", "cannot afford fees",
                    "afford my fees", "college fees", "school fees", "scholarship",
                    "drop out because of money", "no money for education")),

            Map.entry(EDUCATION_TEACHER_ABUSE, List.of(
                    "my teacher", "my lecturer", "my professor", "my principal",
                    "asked me to come to his", "marks depend on", "fail me if")),

            Map.entry(EDUCATION_LACK_OF_ASSISTANCE, List.of(
                    "no one helps me study", "no academic support", "falling behind",
                    "no guidance"))
    );

    /** Distress language. Reported as indicators, never as a condition. */
    static final Map<String, List<String>> DISTRESS = Map.of(
            "sleep disruption", List.of(
                    "can't sleep", "cannot sleep", "not sleeping", "sleepless",
                    "wake up at night", "nightmares", "thookam varala"),
            "persistent fear or anxiety", List.of(
                    "scared", "afraid", "anxious", "panic", "terrified", "frightened",
                    "bayama", "dar lagta"),
            "persistent low mood", List.of(
                    "depressed", "hopeless", "empty", "crying every day", "no energy",
                    "don't want to do anything"),
            "withdrawal from others", List.of(
                    "stopped talking to", "avoid everyone", "no one to talk to",
                    "alone", "isolated", "cut off from"),
            "difficulty concentrating", List.of(
                    "can't concentrate", "cannot focus", "can't focus", "mind is blank"),
            "physical symptoms of stress", List.of(
                    "headaches", "stomach pain", "not eating", "losing weight",
                    "chest tightness", "shaking")
    );

    /**
     * Language suggesting immediate danger.
     *
     * Never triggers an automatic report. It changes what she is offered, and
     * that is all it is allowed to do.
     */
    static final List<String> SAFETY_HIGH = List.of(
            "he will kill me", "going to kill me", "kill me", "threatened to kill",
            "i am not safe", "i'm not safe", "not safe at home", "afraid he will",
            "has a weapon", "knife", "acid", "burn me", "locked me in",
            "won't let me leave", "wont let me leave", "i want to die",
            "end my life", "kill myself", "no point living", "harm myself"
    );

    static final List<String> SAFETY_MODERATE = List.of(
            "escalating", "getting worse", "worse every day", "threatens me",
            "scared of what he", "scared of what they", "afraid to go home"
    );

    /** Follow-ups. Open, non-leading, and never demanding proof. */
    static final Map<IssueCategory, List<String>> FOLLOW_UPS = Map.of(
            WORKPLACE_SEXUAL_HARASSMENT, List.of(
                    "Do you still have the messages, or a note of when they arrived?",
                    "Does your workplace have an internal complaints committee, if you know?",
                    "Is there someone at work you would feel safe telling?"),
            DOMESTIC_DOWRY, List.of(
                    "How long have the demands been going on?",
                    "Does anyone outside the household know what is happening?",
                    "Is there somewhere you could go if you needed to leave quickly?"),
            DOMESTIC_VIOLENCE, List.of(
                    "Do you have somewhere safe you could go if you needed to?",
                    "Is there a person you trust who knows what is happening?"),
            PUBLIC_STALKING, List.of(
                    "Have you noticed a pattern in when or where this happens?",
                    "Have you been able to tell anyone who travels with you?"),
            EDUCATION_FINANCIAL_DIFFICULTY, List.of(
                    "Which year of study are you in?",
                    "Has your institution been told about the difficulty?")
    );
}
