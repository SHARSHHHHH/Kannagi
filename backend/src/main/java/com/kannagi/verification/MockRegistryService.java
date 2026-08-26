package com.kannagi.verification;

import com.kannagi.verification.domain.CredentialKind;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Map;

/**
 * Stands in for three real government registers this application cannot
 * actually call:
 *
 *   - The Bar Council of India's "Advocate Search" (barcouncilofindia.org),
 *     which is a manual web lookup with no public API.
 *   - The Rehabilitation Council of India's registration check
 *     (rciregistration.nic.in), for clinical psychologists.
 *   - The National Medical Commission's Doctor Register, for psychiatrists.
 *
 * A real integration would replace this class with one that calls those
 * systems, or a DigiLocker document-verification API, or scans the QR code
 * printed on the certificate of practice. All three are named directly in
 * how the credential was described to us, and all three are out of reach
 * for a prototype without institutional API access — so this service checks
 * against a small seeded registry instead, and says so honestly in every
 * verification record it produces via {@code verificationMethod}.
 *
 * The seeded entries are the exact example numbers used when this feature
 * was specified (Delhi D/2345/2023, UP UP/1102/2022, Maharashtra & Goa
 * MAH/5678/2021, Tamil Nadu MS/4321/2020, Punjab & Haryana P&H/3456/2024),
 * so a demo account created with any of those numbers verifies instantly.
 * Anything else falls through to NEEDS_REVIEW rather than an automatic
 * REJECTED — a registry this small failing to recognise a real advocate
 * is far more likely than the advocate being fraudulent, and the honest
 * response to "I don't know" is a human review, not a refusal.
 */
@Service
@Slf4j
public class MockRegistryService {

    public record LookupResult(boolean matched, String registeredName, String notes) {}

    // ── Bar Council of India (mock) ────────────────────────────────
    // Keyed by the full "STATE/SERIAL/YEAR" enrolment number.
    private static final Map<String, String> BAR_REGISTRY = Map.of(
            "D/2345/2023", "Demo Advocate — Delhi",
            "UP/1102/2022", "Demo Advocate — Uttar Pradesh",
            "MAH/5678/2021", "Demo Advocate — Maharashtra & Goa",
            "MS/4321/2020", "Demo Advocate — Tamil Nadu",
            "P&H/3456/2024", "Demo Advocate — Punjab & Haryana"
    );

    /** One enrolment number is valid for exactly one state, per Bar Council rules. */
    private static final Map<String, String> BAR_STATE_NAMES = Map.of(
            "D", "Delhi", "UP", "Uttar Pradesh", "MAH", "Maharashtra & Goa",
            "MS", "Tamil Nadu", "P&H", "Punjab & Haryana"
    );

    // ── Rehabilitation Council of India (mock) — clinical psychologists ──
    private static final Map<String, String> RCI_REGISTRY = Map.of(
            "CRR-2019-00457", "Dr. Demo Psychologist",
            "CRR-2021-01983", "Dr. Demo Clinical Psychologist"
    );

    // ── National Medical Commission (mock) — psychiatrists ──────────
    private static final Map<String, String> NMC_REGISTRY = Map.of(
            "NMC-MH-88213", "Dr. Demo Psychiatrist",
            "NMC-TN-40217", "Dr. Demo Consultant Psychiatrist"
    );

    public boolean isKnownStateCode(String stateCode) {
        return stateCode != null && BAR_STATE_NAMES.containsKey(stateCode.trim().toUpperCase(Locale.ROOT));
    }

    public String stateNameFor(String stateCode) {
        return BAR_STATE_NAMES.get(stateCode == null ? "" : stateCode.trim().toUpperCase(Locale.ROOT));
    }

    public LookupResult checkBarEnrollment(String stateCode, String serial, Integer year) {
        if (stateCode == null || serial == null) {
            return new LookupResult(false, null, "Enrolment number is incomplete.");
        }
        String key = stateCode.trim().toUpperCase(Locale.ROOT) + "/" + serial.trim()
                + (year != null ? "/" + year : "");

        String match = BAR_REGISTRY.get(key);
        if (match != null) {
            log.info("Mock BCI lookup matched: {}", key);
            return new LookupResult(true, match,
                    "Matched the demo Bar Council registry for " + key + ".");
        }
        return new LookupResult(false, null,
                "No match in the demo Bar Council registry for " + key
                + ". A real deployment would query barcouncilofindia.org here.");
    }

    public LookupResult checkRciRegistration(String crrNumber, String fullName) {
        if (crrNumber == null || crrNumber.isBlank()) {
            return new LookupResult(false, null, "CRR number is required.");
        }
        String match = RCI_REGISTRY.get(crrNumber.trim().toUpperCase(Locale.ROOT));
        if (match != null) {
            log.info("Mock RCI lookup matched: {}", crrNumber);
            return new LookupResult(true, match,
                    "Matched the demo RCI registry for " + crrNumber + ".");
        }
        return new LookupResult(false, null,
                "No match in the demo RCI registry for " + crrNumber
                + ". A real deployment would query rciregistration.nic.in here.");
    }

    public LookupResult checkNmcRegistration(String registrationNumber, String fullName) {
        if (registrationNumber == null || registrationNumber.isBlank()) {
            return new LookupResult(false, null, "NMC registration number is required.");
        }
        String match = NMC_REGISTRY.get(registrationNumber.trim().toUpperCase(Locale.ROOT));
        if (match != null) {
            log.info("Mock NMC lookup matched: {}", registrationNumber);
            return new LookupResult(true, match,
                    "Matched the demo NMC registry for " + registrationNumber + ".");
        }
        return new LookupResult(false, null,
                "No match in the demo NMC registry for " + registrationNumber
                + ". A real deployment would query the NMC Doctor Register here.");
    }

    public String demoNumbersFor(CredentialKind kind) {
        return switch (kind) {
            case LAWYER -> "D/2345/2023, UP/1102/2022, MAH/5678/2021, MS/4321/2020, P&H/3456/2024";
            case CLINICAL_PSYCHOLOGIST -> "CRR-2019-00457, CRR-2021-01983";
            case PSYCHIATRIST -> "NMC-MH-88213, NMC-TN-40217";
        };
    }
}
