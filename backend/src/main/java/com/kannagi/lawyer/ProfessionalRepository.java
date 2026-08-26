package com.kannagi.lawyer;

import com.kannagi.lawyer.domain.Professional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Filtering happens in the service rather than in JPQL.
 *
 * The previous query used {@code :param is null or ...} against nullable
 * Boolean parameters, which PostgreSQL rejects — it cannot infer the type of a
 * bare null bind. At directory scale the difference between filtering in SQL and
 * filtering in Java is not measurable, and this cannot fail at runtime.
 */
public interface ProfessionalRepository extends JpaRepository<Professional, UUID> {

    List<Professional> findByKindAndAcceptingClientsTrue(Professional.Kind kind);

    long countByKind(Professional.Kind kind);

    /** A professional's own directory row, from the account they signed in with. */
    Optional<Professional> findByUserId(UUID userId);

    List<Professional> findByVerifiedFalseAndIsDemoFalseOrderByCreatedAtAsc();
}
