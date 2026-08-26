package com.kannagi.user;

import com.kannagi.audit.AuditAction;
import com.kannagi.audit.AuditService;
import com.kannagi.common.exception.NotFoundException;
import com.kannagi.user.domain.User;
import com.kannagi.user.domain.UserProfile;
import com.kannagi.user.domain.UserStatus;
import com.kannagi.user.dto.UpdateProfileRequest;
import com.kannagi.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public UserResponse getById(UUID id) {
        return userMapper.toResponse(loadUser(id));
    }

    @Transactional
    public UserResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = loadUser(userId);
        UserProfile profile = user.getProfile();

        if (profile == null) {
            profile = UserProfile.builder().user(user).build();
            user.setProfile(profile);
        }

        if (request.displayName() != null)      profile.setDisplayName(blankToNull(request.displayName()));
        if (request.phone() != null)            profile.setPhone(blankToNull(request.phone()));
        if (request.gender() != null)           profile.setGender(request.gender());
        if (request.dateOfBirth() != null)      profile.setDateOfBirth(request.dateOfBirth());
        if (request.maritalStatus() != null)    profile.setMaritalStatus(request.maritalStatus());
        if (request.occupationStatus() != null) profile.setOccupationStatus(request.occupationStatus());
        if (request.city() != null)             profile.setCity(blankToNull(request.city()));
        if (request.district() != null)         profile.setDistrict(blankToNull(request.district()));
        if (request.state() != null)            profile.setState(blankToNull(request.state()));
        if (request.preferredLanguage() != null) profile.setPreferredLanguage(request.preferredLanguage());

        userRepository.save(user);
        auditService.record(user.getId(), user.getRole(), AuditAction.PROFILE_UPDATED,
                "User", user.getId().toString(), true);

        return userMapper.toResponse(user);
    }

    /**
     * Soft-deletes the account and scrubs the profile immediately.
     *
     * The row is retained only so that foreign keys elsewhere stay valid; a
     * scheduled job performs the hard delete once the retention window passes.
     */
    @Transactional
    public void deleteAccount(UUID userId) {
        User user = loadUser(userId);

        user.setStatus(UserStatus.DEACTIVATED);
        user.setDeletedAt(Instant.now());

        UserProfile profile = user.getProfile();
        if (profile != null) {
            profile.setDisplayName(null);
            profile.setPhone(null);
            profile.setDateOfBirth(null);
            profile.setCity(null);
            profile.setDistrict(null);
            profile.setState(null);
        }

        userRepository.save(user);
        auditService.record(user.getId(), user.getRole(), AuditAction.DATA_DELETED,
                "User", user.getId().toString(), true);
    }

    @Transactional(readOnly = true)
    public User loadUser(UUID id) {
        return userRepository.findByIdWithProfile(id)
                .orElseThrow(() -> new NotFoundException("We could not find that account."));
    }

    private String blankToNull(String value) {
        return value.isBlank() ? null : value.trim();
    }
}
