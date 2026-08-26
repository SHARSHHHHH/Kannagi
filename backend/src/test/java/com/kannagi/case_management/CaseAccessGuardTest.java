package com.kannagi.case_management;

import com.kannagi.TestFixtures;
import com.kannagi.assignment.CaseAssignmentRepository;
import com.kannagi.assignment.domain.AssignmentStatus;
import com.kannagi.assignment.domain.CaseAssignment;
import com.kannagi.audit.AuditService;
import com.kannagi.case_management.domain.Case;
import com.kannagi.case_management.domain.PrivacyMode;
import com.kannagi.common.exception.NotFoundException;
import com.kannagi.lawyer.ProfessionalRepository;
import com.kannagi.lawyer.domain.Professional;
import com.kannagi.privacy.crypto.TokenHasher;
import com.kannagi.security.CurrentUser;
import com.kannagi.user.domain.Role;
import com.kannagi.user.domain.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * The security tests the specification calls the most important ones.
 *
 * Everything here is about one question: can somebody open a case that is not
 * theirs? If any of these ever start passing when they should fail, the product
 * has stopped being safe to use.
 */
class CaseAccessGuardTest {

    private TokenHasher tokenHasher;
    private ProfessionalRepository professionalRepository;
    private CaseAssignmentRepository caseAssignmentRepository;
    private CaseAccessGuard guard;

    private final UUID userAId = UUID.randomUUID();
    private final UUID userBId = UUID.randomUUID();

    private final CurrentUser userA = new CurrentUser(userAId, Role.USER);
    private final CurrentUser userB = new CurrentUser(userBId, Role.USER);

    @BeforeEach
    void setUp() {
        tokenHasher = new TokenHasher();
        professionalRepository = Mockito.mock(ProfessionalRepository.class);
        caseAssignmentRepository = Mockito.mock(CaseAssignmentRepository.class);
        guard = new CaseAccessGuard(tokenHasher, Mockito.mock(AuditService.class),
                professionalRepository, caseAssignmentRepository);
    }

    private Case ownedBy(UUID ownerId) {
        User owner = User.builder().id(ownerId).build();
        return Case.builder()
                .id(UUID.randomUUID())
                .reference("KN-TESTCASE")
                .owner(owner)
                .privacyMode(PrivacyMode.CONFIDENTIAL)
                .build();
    }

    private Case anonymousWithKey(String accessKey) {
        return Case.builder()
                .id(UUID.randomUUID())
                .reference("KN-ANONCASE")
                .privacyMode(PrivacyMode.ANONYMOUS)
                .accessKeyHash(tokenHasher.hash(accessKey))
                .build();
    }

    @Nested
    @DisplayName("Cases belonging to an account")
    class OwnedCases {

        @Test
        @DisplayName("USER A MUST NOT ACCESS USER B'S CASE")
        void userACannotOpenUserBsCase() {
            Case usersBCase = ownedBy(userBId);

            assertThatThrownBy(() -> guard.requireAccess(usersBCase, userA, null))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        @DisplayName("the owner can open her own case")
        void ownerCanOpenTheirOwn() {
            assertThatCode(() -> guard.requireAccess(ownedBy(userAId), userA, null))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("refusal says 'not found', so a reference cannot be confirmed by probing")
        void refusalDoesNotConfirmExistence() {
            // A 403 would tell the caller the case is real. The message for a
            // case that exists but is not theirs must match the message for a
            // case that does not exist at all.
            assertThatThrownBy(() -> guard.requireAccess(ownedBy(userBId), userA, null))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("could not find");

            assertThatThrownBy(() -> guard.requireAccess(null, userA, null))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("could not find");
        }

        @Test
        @DisplayName("a signed-out caller cannot open an owned case")
        void anonymousCallerCannotOpenOwnedCase() {
            assertThatThrownBy(() -> guard.requireAccess(ownedBy(userAId), null, null))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        @DisplayName("an access key does not open an owned case")
        void accessKeyDoesNotBypassOwnership() {
            Case usersBCase = ownedBy(userBId);
            usersBCase.setAccessKeyHash(tokenHasher.hash("stolen-key"));

            assertThatThrownBy(() -> guard.requireAccess(usersBCase, userA, "stolen-key"))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        @DisplayName("being an administrator does not make you an owner")
        void adminIsNotAnOwner() {
            CurrentUser admin = new CurrentUser(UUID.randomUUID(), Role.ADMIN);

            assertThatThrownBy(() -> guard.requireAccess(ownedBy(userAId), admin, null))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        @DisplayName("a lawyer cannot reach a case just by being a lawyer")
        void lawyerHasNoImplicitAccess() {
            CurrentUser lawyer = new CurrentUser(UUID.randomUUID(), Role.LAWYER);

            assertThatThrownBy(() -> guard.requireAccess(ownedBy(userAId), lawyer, null))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        @DisplayName("a deleted case cannot be opened by anyone, including its owner")
        void deletedCaseIsGone() {
            Case deleted = ownedBy(userAId);
            deleted.setDeletedAt(Instant.now());

            assertThatThrownBy(() -> guard.requireAccess(deleted, userA, null))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Anonymous cases")
    class AnonymousCases {

        @Test
        @DisplayName("the right access key opens the case")
        void correctKeyOpensIt() {
            String key = tokenHasher.newToken();

            assertThatCode(() -> guard.requireAccess(anonymousWithKey(key), null, key))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("a wrong access key does not")
        void wrongKeyIsRefused() {
            Case anonymous = anonymousWithKey(tokenHasher.newToken());

            assertThatThrownBy(() -> guard.requireAccess(anonymous, null, "wrong-key"))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        @DisplayName("no access key at all does not")
        void missingKeyIsRefused() {
            Case anonymous = anonymousWithKey(tokenHasher.newToken());

            assertThatThrownBy(() -> guard.requireAccess(anonymous, null, null))
                    .isInstanceOf(NotFoundException.class);
            assertThatThrownBy(() -> guard.requireAccess(anonymous, null, "   "))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        @DisplayName("being signed in does not open somebody else's anonymous case")
        void signedInCallerStillNeedsTheKey() {
            Case anonymous = anonymousWithKey(tokenHasher.newToken());

            assertThatThrownBy(() -> guard.requireAccess(anonymous, userA, null))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        @DisplayName("an administrator holding no key is refused like anyone else")
        void adminCannotOpenAnonymousCase() {
            CurrentUser admin = new CurrentUser(UUID.randomUUID(), Role.ADMIN);
            Case anonymous = anonymousWithKey(tokenHasher.newToken());

            assertThatThrownBy(() -> guard.requireAccess(anonymous, admin, null))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        @DisplayName("a key that is right up to the last character is still wrong")
        void nearMissIsRefused() {
            String key = tokenHasher.newToken();
            String nearMiss = key.substring(0, key.length() - 1) + "X";
            Case anonymous = anonymousWithKey(key);

            assertThatThrownBy(() -> guard.requireAccess(anonymous, null, nearMiss))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Professional access")
    class ProfessionalAccess {

        @Test
        @DisplayName("a professional with no accepted assignment cannot reach the case")
        void noAssignmentMeansNoAccess() {
            Case caseEntity = ownedBy(userAId);

            for (Role role : new Role[]{Role.LAWYER, Role.PSYCHOLOGIST, Role.SUPPORT_WORKER}) {
                CurrentUser professional = new CurrentUser(UUID.randomUUID(), role);
                assertThatThrownBy(() -> guard.requireAccess(caseEntity, professional, null))
                        .as("%s with no assignment must not reach the case", role)
                        .isInstanceOf(NotFoundException.class);
            }
        }

        @Test
        @DisplayName("a professional with an ACCEPTED assignment can reach the case")
        void acceptedAssignmentGrantsAccess() {
            Case caseEntity = ownedBy(userAId);
            UUID professionalUserId = UUID.randomUUID();
            CurrentUser lawyer = new CurrentUser(professionalUserId, Role.LAWYER);

            Professional professional = Professional.builder()
                    .id(UUID.randomUUID()).userId(professionalUserId).build();
            when(professionalRepository.findByUserId(professionalUserId))
                    .thenReturn(Optional.of(professional));
            when(caseAssignmentRepository.findFirstByCaseIdAndProfessionalIdAndStatus(
                    caseEntity.getId(), professional.getId(), AssignmentStatus.ACCEPTED))
                    .thenReturn(Optional.of(CaseAssignment.builder().build()));

            assertThatCode(() -> guard.requireAccess(caseEntity, lawyer, null))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("an OFFERED (not yet accepted) assignment does not grant access")
        void offeredOnlyIsNotEnough() {
            Case caseEntity = ownedBy(userAId);
            UUID professionalUserId = UUID.randomUUID();
            CurrentUser lawyer = new CurrentUser(professionalUserId, Role.LAWYER);

            Professional professional = Professional.builder()
                    .id(UUID.randomUUID()).userId(professionalUserId).build();
            when(professionalRepository.findByUserId(professionalUserId))
                    .thenReturn(Optional.of(professional));
            // No stub for ACCEPTED lookup -> defaults to Optional.empty()

            assertThatThrownBy(() -> guard.requireAccess(caseEntity, lawyer, null))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Test
    @DisplayName("test configuration is wired")
    void fixturesLoad() {
        org.assertj.core.api.Assertions.assertThat(TestFixtures.props().caseRef().referencePrefix())
                .isEqualTo("KN");
    }
}
