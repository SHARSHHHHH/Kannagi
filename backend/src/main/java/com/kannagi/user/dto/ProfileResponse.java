package com.kannagi.user.dto;

import com.kannagi.user.domain.Gender;
import com.kannagi.user.domain.MaritalStatus;
import com.kannagi.user.domain.OccupationStatus;

import java.time.LocalDate;

public record ProfileResponse(
        String displayName,
        String phone,
        Gender gender,
        LocalDate dateOfBirth,
        MaritalStatus maritalStatus,
        OccupationStatus occupationStatus,
        String city,
        String district,
        String state,
        String preferredLanguage
) {}
