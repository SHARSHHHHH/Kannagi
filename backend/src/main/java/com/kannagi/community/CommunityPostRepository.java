package com.kannagi.community;

import com.kannagi.community.domain.CommunityPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, UUID> {

    Page<CommunityPost> findByModerationStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
            CommunityPost.ModerationStatus status, Pageable pageable);

    List<CommunityPost> findByModerationStatusInOrderByCreatedAtAsc(
            List<CommunityPost.ModerationStatus> statuses);
}
