package com.kannagi.verification.dto;

import com.kannagi.verification.domain.CredentialKind;
import jakarta.validation.constraints.*;

/**
 * Registration for either therapist identity this platform recognises:
 * a clinical psychologist (verified against RCI) or a psychiatrist
 * (verified against NMC — psychiatrists are medical doctors first).
 */
public record TherapistRegisterRequest(

        @NotBlank @Email(message = "Enter a valid email address")
        String email,

        @NotBlank @Size(min = 10, max = 128, message = "Use at least 10 characters")
        String password,

        @NotNull(message = "Choose your professional category")
        CredentialKind credentialKind,   // CLINICAL_PSYCHOLOGIST or PSYCHIATRIST

        @NotBlank(message = "Enter your name exactly as it appears on your registration")
        @Size(max = 200)
        String registeredFullName,

        @NotBlank(message = "Enter your registration number")
        @Size(max = 64)
        String licenseNumber,

        @Size(max = 300) String qualification,
        @Size(max = 400) String specialisations,
        @Size(max = 120) String city,
        @Size(max = 120) String state,
        @Size(max = 40) String languages,

        String captchaToken
) {}
