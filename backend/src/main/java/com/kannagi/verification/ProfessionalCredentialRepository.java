package com.kannagi.verification;

import com.kannagi.verification.domain.ProfessionalCredential;
import com.kannagi.verification.domain.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfessionalCredentialRepository extends JpaRepository<ProfessionalCredential, UUID> {

    Optional<ProfessionalCredential> findByUserId(UUID userId);

    Optional<ProfessionalCredential> findByProfessionalId(UUID professionalId);

    List<ProfessionalCredential> findByVerificationStatusInOrderBySubmittedAtAsc(
            List<VerificationStatus> statuses);
}
