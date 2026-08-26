package com.kannagi.speech;

import com.kannagi.common.exception.BadRequestException;
import com.kannagi.common.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Turns a recording into text and then forgets the recording.
 *
 * The audio is never written to disk. It is validated, streamed to the
 * transcriber, and dropped — so there is no stored voice of anyone describing
 * the worst thing that has happened to her. The transcript is what she reviews,
 * edits and decides whether to keep.
 */
@RestController
@RequestMapping("/api/speech")
@RequiredArgsConstructor
@Tag(name = "Speech")
@Slf4j
public class SpeechController {

    private final SpeechToTextService speechToTextService;
    private final AudioValidator audioValidator;

    @PostMapping(value = "/transcribe", consumes = "multipart/form-data")
    @Operation(summary = "Transcribe a recording. The audio is not stored.")
    public ApiResponse<TranscriptionResult> transcribe(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "language", required = false) String language) {

        audioValidator.validate(file);

        try (var stream = file.getInputStream()) {
            return ApiResponse.ok(speechToTextService.transcribe(
                    stream, safeName(file.getOriginalFilename()), language));

        } catch (IOException e) {
            log.error("Could not read the uploaded recording", e);
            throw new BadRequestException("We could not read that recording. Try again.");
        }
    }

    /**
     * The provider wants a filename for its multipart part. It gets a generated
     * one — the user's original name is never used, since it can carry a path or
     * her own name.
     */
    private String safeName(String originalName) {
        String extension = "webm";
        if (originalName != null && originalName.contains(".")) {
            String candidate = originalName
                    .substring(originalName.lastIndexOf('.') + 1).toLowerCase();
            if (candidate.matches("[a-z0-9]{1,5}")) {
                extension = candidate;
            }
        }
        return "recording." + extension;
    }
}
