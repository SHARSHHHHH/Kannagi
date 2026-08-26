package com.kannagi.user;

import com.kannagi.user.domain.User;
import com.kannagi.user.domain.UserProfile;
import com.kannagi.user.dto.ProfileResponse;
import com.kannagi.user.dto.UserResponse;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                toProfileResponse(user.getProfile()),
                user.getCreatedAt()
        );
    }

    public ProfileResponse toProfileResponse(UserProfile profile) {
        if (profile == null) {
            return null;
        }
        return new ProfileResponse(
                profile.getDisplayName(),
                profile.getPhone(),
                profile.getGender(),
                profile.getDateOfBirth(),
                profile.getMaritalStatus(),
                profile.getOccupationStatus(),
                profile.getCity(),
                profile.getDistrict(),
                profile.getState(),
                profile.getPreferredLanguage()
        );
    }
}
