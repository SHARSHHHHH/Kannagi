package com.kannagi.user.dto;

import com.kannagi.user.domain.Role;
import com.kannagi.user.domain.UserStatus;

import java.time.Instant;
import java.util.UUID;

/**
 * The shape of a user as the client sees it. There is no password field here
 * and there never should be — entities are not returned directly anywhere.
 */
public record UserResponse(
        UUID id,
        String email,
        Role role,
        UserStatus status,
        ProfileResponse profile,
        Instant createdAt
) {}
