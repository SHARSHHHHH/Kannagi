package com.kannagi.case_management;

import com.kannagi.case_management.domain.Case;
import com.kannagi.case_management.domain.CaseMessage;
import com.kannagi.case_management.dto.CaseMessageResponse;
import com.kannagi.case_management.dto.CaseResponse;
import com.kannagi.case_management.dto.CaseSummaryResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CaseMapper {

    public CaseResponse toResponse(Case entity, List<CaseMessage> messages) {
        return new CaseResponse(
                entity.getId(),
                entity.getReference(),
                entity.getPrivacyMode(),
                entity.getStatus(),
                entity.getLegalPathway(),
                entity.getTitle(),
                entity.getSummary(),
                entity.getPrimaryLanguage(),
                messages.stream().map(this::toMessageResponse).toList(),
                entity.getLastActivityAt(),
                entity.getCreatedAt()
        );
    }

    public CaseSummaryResponse toSummary(Case entity, long messageCount) {
        return new CaseSummaryResponse(
                entity.getId(),
                entity.getReference(),
                entity.getPrivacyMode(),
                entity.getStatus(),
                entity.getLegalPathway(),
                entity.getTitle(),
                messageCount,
                entity.getLastActivityAt(),
                entity.getCreatedAt()
        );
    }

    public CaseMessageResponse toMessageResponse(CaseMessage message) {
        return new CaseMessageResponse(
                message.getId(),
                message.getSenderType(),
                message.getContent(),
                message.getLanguage(),
                message.getCreatedAt()
        );
    }
}
