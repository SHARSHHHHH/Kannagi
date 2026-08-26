package com.kannagi.community;

import com.kannagi.common.exception.NotFoundException;
import com.kannagi.common.web.ApiResponse;
import com.kannagi.community.domain.CommunityPost;
import com.kannagi.moderation.ContentModerationService;
import com.kannagi.security.CurrentUser;
import com.kannagi.security.captcha.CaptchaService;
import com.kannagi.common.exception.BadRequestException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
@Tag(name = "Community")
public class CommunityController {

    private final CommunityPostRepository postRepository;
    private final ContentModerationService moderationService;
    private final CaptchaService captchaService;

    public record CreatePostRequest(
            @NotBlank(message = "Give your post a title") @Size(max = 200) String title,
            @NotBlank(message = "Write something first") @Size(max = 5000) String content,
            @NotBlank(message = "Choose a category") @Size(max = 64) String category,
            boolean anonymous,
            String captchaToken) {}

    public record PostCreatedResponse(
            CommunityPost post,
            List<String> moderationReasons,
            String notice) {}

    @GetMapping("/posts")
    @Operation(summary = "Approved community posts")
    public ApiResponse<Page<CommunityPost>> posts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(postRepository
                .findByModerationStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
                        CommunityPost.ModerationStatus.APPROVED,
                        PageRequest.of(page, Math.min(size, 50))));
    }

    @PostMapping("/posts")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Write a post. Every post is reviewed before it appears.")
    public ApiResponse<PostCreatedResponse> create(
            @Valid @RequestBody CreatePostRequest request,
            @AuthenticationPrincipal CurrentUser currentUser,
            HttpServletRequest http) {

        if (currentUser == null && !captchaService.verify(request.captchaToken(), clientIp(http))) {
            throw new BadRequestException(
                    "We could not confirm that request came from a person. Try again.");
        }

        var verdict = moderationService.review(request.title(), request.content());

        CommunityPost post = postRepository.save(CommunityPost.builder()
                .authorUserId(request.anonymous() || currentUser == null
                        ? null : currentUser.id())
                .anonymous(request.anonymous() || currentUser == null)
                .title(request.title().trim())
                .content(request.content().trim())
                .category(request.category())
                .moderationStatus(verdict.status())
                .moderationNote(verdict.reasons().isEmpty()
                        ? null : String.join("; ", verdict.reasons()))
                .build());

        return ApiResponse.ok(new PostCreatedResponse(
                post,
                verdict.reasons(),
                verdict.reasons().isEmpty()
                        ? "Your post is waiting for review and will appear once a moderator "
                          + "has read it."
                        : "Your post is waiting for review. A moderator will look at it "
                          + "because of the points listed above — they may be wrong, and "
                          + "nothing has been deleted."));
    }

    @PostMapping("/posts/{id}/helpful")
    @Operation(summary = "Mark a post as helpful")
    public ApiResponse<CommunityPost> markHelpful(@PathVariable UUID id) {
        CommunityPost post = postRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("We could not find that post."));
        post.setHelpfulCount(post.getHelpfulCount() + 1);
        return ApiResponse.ok(postRepository.save(post));
    }

    @GetMapping("/moderation/queue")
    @PreAuthorize("hasAnyRole('MODERATOR','ADMIN')")
    @Operation(summary = "Posts waiting for a moderator")
    public ApiResponse<List<CommunityPost>> queue() {
        return ApiResponse.ok(postRepository.findByModerationStatusInOrderByCreatedAtAsc(
                List.of(CommunityPost.ModerationStatus.PENDING,
                        CommunityPost.ModerationStatus.FLAGGED)));
    }

    @PatchMapping("/moderation/{id}")
    @PreAuthorize("hasAnyRole('MODERATOR','ADMIN')")
    @Operation(summary = "Approve or hide a post")
    public ApiResponse<CommunityPost> moderate(
            @PathVariable UUID id,
            @RequestParam CommunityPost.ModerationStatus status) {
        CommunityPost post = postRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("We could not find that post."));
        post.setModerationStatus(status);
        return ApiResponse.ok(postRepository.save(post));
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return (forwarded != null && !forwarded.isBlank())
                ? forwarded.split(",")[0].trim() : request.getRemoteAddr();
    }
}
