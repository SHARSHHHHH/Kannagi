package com.kannagi.appointment.dto;

import com.kannagi.appointment.domain.Appointment;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public record CreateAppointmentRequest(

        @NotNull(message = "Choose who you would like to see")
        UUID professionalId,

        UUID caseId,

        @NotNull(message = "Choose a date and time")
        @Future(message = "Choose a time in the future")
        Instant scheduledAt,

        Appointment.Mode mode,

        /** True keeps her identity off the booking entirely. */
        boolean anonymous,

        @Size(max = 2000, message = "Keep the note under 2000 characters")
        String note,

        /** Must be explicitly true. Booking is never implied consent. */
        boolean consentToShare,

        String captchaToken
) {}
