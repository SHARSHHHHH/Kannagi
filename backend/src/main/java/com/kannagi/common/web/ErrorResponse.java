package com.kannagi.common.web;

import java.time.Instant;
import java.util.List;

/**
 * Error envelope. Deliberately free of stack traces, SQL and internal class
 * names — nothing here should help an attacker map the system.
 */
public record ErrorResponse(
        boolean success,
        String code,
        String message,
        List<FieldError> fieldErrors,
        Instant timestamp
) {
    public record FieldError(String field, String message) {}

    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(false, code, message, null, Instant.now());
    }

    public static ErrorResponse of(String code, String message, List<FieldError> fieldErrors) {
        return new ErrorResponse(false, code, message, fieldErrors, Instant.now());
    }
}
