package com.kannagi.user.dto;

import com.kannagi.user.domain.Gender;
import com.kannagi.user.domain.MaritalStatus;
import com.kannagi.user.domain.OccupationStatus;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/** Every field is optional: a user may fill in as much or as little as they want. */
public record UpdateProfileRequest(

        @Size(max = 120, message = "Name can be at most 120 characters")
        String displayName,

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
        String preferredLanguage
) {}
