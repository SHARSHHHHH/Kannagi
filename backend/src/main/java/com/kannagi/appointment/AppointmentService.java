package com.kannagi.appointment;

import com.kannagi.appointment.domain.Appointment;
import com.kannagi.appointment.dto.AppointmentResponse;
import com.kannagi.appointment.dto.CreateAppointmentRequest;
import com.kannagi.audit.AuditAction;
import com.kannagi.audit.AuditService;
import com.kannagi.common.exception.BadRequestException;
import com.kannagi.common.exception.ConflictException;
import com.kannagi.common.exception.NotFoundException;
import com.kannagi.common.util.ReferenceGenerator;
import com.kannagi.lawyer.ProfessionalRepository;
import com.kannagi.lawyer.domain.Professional;
import com.kannagi.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final ProfessionalRepository professionalRepository;
    private final ReferenceGenerator referenceGenerator;
    private final AuditService auditService;

    @Transactional
    public AppointmentResponse book(CreateAppointmentRequest request, CurrentUser currentUser) {
        Professional professional = professionalRepository.findById(request.professionalId())
                .orElseThrow(() -> new NotFoundException("We could not find that profile."));

        if (!professional.isAcceptingClients()) {
            throw new BadRequestException("This person is not taking new requests right now.");
        }

        // Consent is required and is never inferred from the act of booking.
        if (!request.consentToShare()) {
            throw new BadRequestException(
                    "We need your agreement before sending anything to this person.");
        }

        Instant slot = request.scheduledAt().truncatedTo(ChronoUnit.MINUTES);

        if (appointmentRepository.existsByProfessionalIdAndScheduledAtAndStatusNot(
                professional.getId(), slot, Appointment.Status.CANCELLED)) {
            throw new ConflictException("That time has just been taken. Choose another.");
        }

        boolean anonymous = request.anonymous() || currentUser == null;

        Appointment appointment = Appointment.builder()
                .reference(referenceGenerator.generate())
                .caseId(request.caseId())
                .professionalId(professional.getId())
                // An anonymous booking records no requester at all.
                .requesterUserId(anonymous ? null : currentUser.id())
                .anonymous(anonymous)
                .scheduledAt(slot)
                .mode(request.mode() == null ? Appointment.Mode.ONLINE : request.mode())
                .note(request.note())
                .status(Appointment.Status.REQUESTED)
                .build();

        try {
            appointmentRepository.save(appointment);
        } catch (DataIntegrityViolationException e) {
            // Two people picked the same slot at the same moment. The unique
            // constraint decided it; this turns that into a usable message.
            throw new ConflictException("That time has just been taken. Choose another.");
        }

        auditService.record(
                currentUser == null ? null : currentUser.id(),
                currentUser == null ? null : currentUser.role(),
                AuditAction.CASE_SHARED, "Appointment", appointment.getId().toString(), true);

        return toResponse(appointment, professional);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> mine(CurrentUser currentUser) {
        return appointmentRepository
                .findByRequesterUserIdOrderByScheduledAtDesc(currentUser.id())
                .stream()
                .map(appointment -> toResponse(appointment,
                        professionalRepository.findById(appointment.getProfessionalId())
                                .orElse(null)))
                .toList();
    }

    @Transactional(readOnly = true)
    public AppointmentResponse byReference(String reference) {
        Appointment appointment = appointmentRepository.findByReference(reference.trim().toUpperCase())
                .orElseThrow(() -> new NotFoundException("We could not find that booking."));
        return toResponse(appointment,
                professionalRepository.findById(appointment.getProfessionalId()).orElse(null));
    }

    @Transactional
    public AppointmentResponse updateStatus(UUID appointmentId, Appointment.Status status,
                                            CurrentUser currentUser) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NotFoundException("We could not find that booking."));

        appointment.setStatus(status);
        appointmentRepository.save(appointment);

        auditService.record(currentUser.id(), currentUser.role(),
                AuditAction.CASE_SHARED, "Appointment", appointmentId.toString(), true);

        return toResponse(appointment,
                professionalRepository.findById(appointment.getProfessionalId()).orElse(null));
    }

    private AppointmentResponse toResponse(Appointment appointment, Professional professional) {
        return new AppointmentResponse(
                appointment.getId(),
                appointment.getReference(),
                appointment.getProfessionalId(),
                professional == null ? "Unknown" : professional.getFullName(),
                appointment.getScheduledAt(),
                appointment.getDurationMinutes(),
                appointment.getMode(),
                appointment.getStatus(),
                appointment.isAnonymous(),
                // Stated plainly so she can check it against what she expected.
                appointment.isAnonymous()
                        ? "They will see your case reference and the note you wrote. "
                          + "They will not see your name, email or phone number."
                        : "They will see your name and the note you wrote.");
    }
}
