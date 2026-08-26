package com.kannagi.verification.dto;

import jakarta.validation.constraints.*;

/**
 * Registration for the Advocates Act, 1961 identity: enrolled with a State
 * Bar Council, identified by a StateCode/Serial/Year enrolment number.
 */
public record LawyerRegisterRequest(

        @NotBlank @Email(message = "Enter a valid email address")
        String email,

        @NotBlank @Size(min = 10, max = 128, message = "Use at least 10 characters")
        String password,

        @NotBlank(message = "Enter your full name as it appears on your enrolment certificate")
        @Size(max = 200)
        String fullName,

        @NotBlank(message = "Enter your state bar code, e.g. D for Delhi, MAH for Maharashtra & Goa")
        @Size(max = 12)
        String barStateCode,

        @NotBlank(message = "Enter your enrolment serial number")
        @Size(max = 32)
        String barSerialNumber,

        @NotNull(message = "Enter your year of enrolment")
        @Min(1961) @Max(2026)
        Integer barEnrollmentYear,

        boolean certificateOfPractice,

        @Size(max = 300) String qualification,
        @Size(max = 400) String practiceAreas,
        @Size(max = 120) String city,
        @Size(max = 120) String state,
        @Size(max = 40) String languages,

        String captchaToken
) {}
