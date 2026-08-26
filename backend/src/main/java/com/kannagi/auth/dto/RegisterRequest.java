package com.kannagi.auth.dto;

import com.kannagi.user.domain.Gender;
import com.kannagi.user.domain.MaritalStatus;
import com.kannagi.user.domain.OccupationStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

/**
 * Only email and password are required. Everything below them is optional, in
 * keeping with data minimisation — someone in a hurry, or someone who does not
 * want to be identifiable, can still create an account.
 */
public record RegisterRequest(

        @NotBlank(message = "Enter your email address")
        @Email(message = "Enter a valid email address")
        @Size(max = 254)
        String email,

        @NotBlank(message = "Choose a password")
        @Size(min = 10, max = 128, message = "Use at least 10 characters")
        String password,

        @Size(max = 120) String displayName,

        @Pattern(regexp = "^$|^[0-9+\\-\\s]{7,20}$", message = "Enter a valid phone number")
        String phone,

        Gender gender,

        @Past(message = "Date of birth must be in the past")
        LocalDate dateOfBirth,

        MaritalStatus maritalStatus,
        OccupationStatus occupationStatus,

        @Size(max = 120) String city,
        @Size(max = 120) String district,
        @Size(max = 120) String state,

        @Pattern(regexp = "^(en|ta|hi|te|ml|kn)$", message = "Choose a supported language")
        String preferredLanguage,

        /** Turnstile response token from the browser widget. */
        String captchaToken
) {}
