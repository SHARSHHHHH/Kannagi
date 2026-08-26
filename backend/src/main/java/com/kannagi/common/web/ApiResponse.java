package com.kannagi.common.web;

import java.time.Instant;

/** Consistent envelope for every successful API response. */
public record ApiResponse<T>(boolean success, T data, Instant timestamp) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, Instant.now());
    }
}
