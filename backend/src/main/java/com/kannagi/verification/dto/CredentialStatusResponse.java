package com.kannagi.verification.dto;

import com.kannagi.verification.domain.CredentialKind;
import com.kannagi.verification.domain.VerificationStatus;

import java.time.Instant;
import java.util.UUID;

public record CredentialStatusResponse(
        UUID id,
        UUID professionalId,
        CredentialKind credentialKind,
        String displayIdentifier,   // formatted bar number, or CRR/NMC number
        VerificationStatus verificationStatus,
        String verificationMethod,
        String verificationNotes,
        Instant submittedAt,
        Instant verifiedAt
) {}
