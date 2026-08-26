package com.kannagi.appointment;

import com.kannagi.appointment.domain.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    boolean existsByProfessionalIdAndScheduledAtAndStatusNot(
            UUID professionalId, Instant scheduledAt, Appointment.Status status);

    List<Appointment> findByRequesterUserIdOrderByScheduledAtDesc(UUID requesterUserId);

    List<Appointment> findByProfessionalIdOrderByScheduledAtAsc(UUID professionalId);

    Optional<Appointment> findByReference(String reference);

    List<Appointment> findByProfessionalIdAndScheduledAtBetween(
            UUID professionalId, Instant from, Instant to);
}
