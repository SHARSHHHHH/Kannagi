package com.kannagi.user;

import com.kannagi.user.domain.Role;
import com.kannagi.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    /** Lookup is always by blind index — plaintext email is never queried. */
    Optional<User> findByEmailIndexAndDeletedAtIsNull(String emailIndex);

    boolean existsByEmailIndexAndDeletedAtIsNull(String emailIndex);

    Optional<User> findByIdAndDeletedAtIsNull(UUID id);

    List<User> findByRoleAndDeletedAtIsNull(Role role);

    @Query("select u from User u left join fetch u.profile where u.id = :id and u.deletedAt is null")
    Optional<User> findByIdWithProfile(@Param("id") UUID id);
}
