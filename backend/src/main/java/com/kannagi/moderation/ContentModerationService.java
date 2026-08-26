package com.kannagi.moderation;

import com.kannagi.community.domain.CommunityPost;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * A first pass over community content.
 *
 * It flags for a human. It never deletes, and it never publishes — a post that
 * looks clean still waits for review, and a post that looks bad is hidden from
 * the feed rather than destroyed. An automated classifier is not allowed to be
 * the last word on whether a woman's account of her own life gets to exist.
 */
@Service
@Slf4j
public class ContentModerationService {

    /** Indian mobile numbers, ten digits with optional country code and spacing. */
    private static final Pattern PHONE = Pattern.compile(
            "(\\+?91[\\s-]?)?[6-9]\\d{2}[\\s-]?\\d{3}[\\s-]?\\d{4}");

    private static final Pattern EMAIL = Pattern.compile(
            "[\\w.+-]+@[\\w-]+\\.[\\w.]{2,}");

    private static final List<String> THREAT_TERMS = List.of(
            "i will kill", "i'll kill", "kill him", "kill her", "burn his",
            "acid attack", "beat him up", "hire someone to");

    private static final List<String> VICTIM_BLAMING = List.of(
            "you asked for it", "your own fault", "what did you expect",
            "you should have known", "women like you", "she deserved");

    private static final List<String> DANGEROUS_ADVICE = List.of(
            "don't tell the police", "dont tell the police", "handle it yourself",
            "take revenge", "poison", "just endure it", "stay quiet and bear");

    private static final List<String> ADDRESS_HINTS = List.of(
            "door no", "flat no", "plot no", "h.no", "house no", "pin code", "pincode");

    public record ModerationVerdict(
            CommunityPost.ModerationStatus status,
            List<String> reasons) {}

    public ModerationVerdict review(String title, String content) {
        String text = (title + " " + content).toLowerCase(Locale.ROOT);
        List<String> reasons = new ArrayList<>();

        if (PHONE.matcher(content).find()) {
            reasons.add("Looks like it contains a phone number");
        }
        if (EMAIL.matcher(content).find()) {
            reasons.add("Looks like it contains an email address");
        }
        if (ADDRESS_HINTS.stream().anyMatch(text::contains)) {
            reasons.add("Looks like it contains an address");
        }
        if (THREAT_TERMS.stream().anyMatch(text::contains)) {
            reasons.add("May contain a threat of violence");
        }
        if (VICTIM_BLAMING.stream().anyMatch(text::contains)) {
            reasons.add("May contain victim-blaming language");
        }
        if (DANGEROUS_ADVICE.stream().anyMatch(text::contains)) {
            reasons.add("May contain advice that could put someone at risk");
        }

        // Naming a specific person alongside an accusation is the pattern that
        // turns a support forum into a defamation problem.
        if (text.matches(".*\\b(mr|mrs|dr|advocate)\\.?\\s+[a-z]{3,}.*")
                && (text.contains("harass") || text.contains("abuse") || text.contains("assault"))) {
            reasons.add("May name a specific person in an accusation");
        }

        return new ModerationVerdict(
                reasons.isEmpty()
                        ? CommunityPost.ModerationStatus.PENDING
                        : CommunityPost.ModerationStatus.FLAGGED,
                reasons);
    }
}
