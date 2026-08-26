package com.kannagi.ai;

import com.kannagi.ai.model.*;
import com.kannagi.common.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "Analysis")
public class AIController {

    private final AIService aiService;

    public record AnalyseRequest(
            @NotBlank(message = "Write something first")
            @Size(max = 10000) String text,
            String language) {}

    public record ChatMessageRequest(
            @NotBlank(message = "Write something first")
            @Size(max = 10000) String message,
            List<ChatTurn> history,
            String language,
            boolean psychologicalMode) {}

    @PostMapping("/analyse")
    @Operation(summary = "Identify possible concern areas in a description")
    public ApiResponse<AIAnalysisResult> analyse(@Valid @RequestBody AnalyseRequest request) {
        return ApiResponse.ok(aiService.analyse(request.text(), request.language()));
    }

    @PostMapping("/chat")
    @Operation(summary = "Send a message and get a reply with analysis attached")
    public ApiResponse<ChatResponse> chat(@Valid @RequestBody ChatMessageRequest request) {
        return ApiResponse.ok(aiService.chat(new ChatRequest(
                request.history() == null ? List.of() : request.history(),
                request.message(),
                request.language(),
                request.psychologicalMode())));
    }
}
