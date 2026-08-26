package com.kannagi.appointment.dto;

import com.kannagi.appointment.domain.Appointment;

import java.time.Instant;
import java.util.UUID;

public record AppointmentResponse(
        UUID id,
        String reference,
        UUID professionalId,
        String professionalName,
        Instant scheduledAt,
        int durationMinutes,
        Appointment.Mode mode,
        Appointment.Status status,
        boolean anonymous,
        String whatTheyWillSee
) {}
