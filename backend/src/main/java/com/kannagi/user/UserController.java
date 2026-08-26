package com.kannagi.user;

import com.kannagi.common.web.ApiResponse;
import com.kannagi.security.CurrentUser;
import com.kannagi.user.dto.UpdateProfileRequest;
import com.kannagi.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "The signed-in user's own account")
    public ApiResponse<UserResponse> me(@AuthenticationPrincipal CurrentUser currentUser) {
        return ApiResponse.ok(userService.getById(currentUser.id()));
    }

    @PatchMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update the signed-in user's own profile")
    public ApiResponse<UserResponse> updateMe(
            @AuthenticationPrincipal CurrentUser currentUser,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.ok(userService.updateProfile(currentUser.id(), request));
    }

    @DeleteMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete the signed-in user's own account")
    public ResponseEntity<Void> deleteMe(@AuthenticationPrincipal CurrentUser currentUser) {
        userService.deleteAccount(currentUser.id());
        return ResponseEntity.noContent().build();
    }
}
