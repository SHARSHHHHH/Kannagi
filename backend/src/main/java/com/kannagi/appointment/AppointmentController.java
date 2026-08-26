package com.kannagi.appointment;

import com.kannagi.appointment.domain.Appointment;
import com.kannagi.appointment.dto.AppointmentResponse;
import com.kannagi.appointment.dto.CreateAppointmentRequest;
import com.kannagi.common.web.ApiResponse;
import com.kannagi.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Request an appointment, anonymously or under an account")
    public ApiResponse<AppointmentResponse> book(
            @Valid @RequestBody CreateAppointmentRequest request,
            @AuthenticationPrincipal CurrentUser currentUser) {
        return ApiResponse.ok(appointmentService.book(request, currentUser));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "The signed-in user's own appointments")
    public ApiResponse<List<AppointmentResponse>> mine(
            @AuthenticationPrincipal CurrentUser currentUser) {
        return ApiResponse.ok(appointmentService.mine(currentUser));
    }

    @GetMapping("/by-reference/{reference}")
    @Operation(summary = "Look up an anonymous booking by its reference")
    public ApiResponse<AppointmentResponse> byReference(@PathVariable String reference) {
        return ApiResponse.ok(appointmentService.byReference(reference));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('LAWYER','PSYCHOLOGIST','SUPPORT_WORKER','ADMIN')")
    @Operation(summary = "Accept, reject or complete a request")
    public ApiResponse<AppointmentResponse> updateStatus(
            @PathVariable UUID id,
            @RequestParam Appointment.Status status,
            @AuthenticationPrincipal CurrentUser currentUser) {
        return ApiResponse.ok(appointmentService.updateStatus(id, status, currentUser));
    }
}
