package com.kannagi.speech;

import com.kannagi.common.exception.BadRequestException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Checks an upload really is audio before anything touches it.
 *
 * Extension and declared MIME type are both attacker-controlled, so the file's
 * own leading bytes are checked as well. The original filename is never used as
 * a path.
 */
@Component
public class AudioValidator {

    private static final long MAX_BYTES = 15L * 1024 * 1024;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("wav", "mp3", "m4a", "webm", "ogg");

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "audio/wav", "audio/x-wav", "audio/wave",
            "audio/mpeg", "audio/mp3",
            "audio/mp4", "audio/x-m4a",
            "audio/webm", "video/webm",
            "audio/ogg", "application/ogg");

    /** Leading bytes that identify each accepted container. */
    private static final List<byte[]> SIGNATURES = List.of(
            new byte[]{'R', 'I', 'F', 'F'},                       // wav
            new byte[]{'I', 'D', '3'},                            // mp3 with tag
            new byte[]{(byte) 0xFF, (byte) 0xFB},                 // mp3 frame
            new byte[]{(byte) 0xFF, (byte) 0xF3},                 // mp3 frame
            new byte[]{(byte) 0xFF, (byte) 0xF2},                 // mp3 frame
            new byte[]{(byte) 0x1A, 0x45, (byte) 0xDF, (byte) 0xA3}, // webm / matroska
            new byte[]{'O', 'g', forgivingByte()});               // ogg

    private static byte forgivingByte() {
        return 'g';
    }

    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No recording was received. Try again.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new BadRequestException("That recording is longer than we can accept. "
                    + "Try recording in shorter pieces.");
        }

        String extension = extensionOf(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("That file type is not supported.");
        }

        String contentType = file.getContentType() == null
                ? "" : file.getContentType().toLowerCase(Locale.ROOT).split(";")[0].trim();
        if (!ALLOWED_MIME_TYPES.contains(contentType)) {
            throw new BadRequestException("That file type is not supported.");
        }

        if (!hasAudioSignature(file)) {
            throw new BadRequestException("That file does not look like an audio recording.");
        }
    }

    private boolean hasAudioSignature(MultipartFile file) {
        try {
            byte[] head = new byte[12];
            int read = file.getInputStream().read(head);
            if (read < 4) {
                return false;
            }
            // m4a identifies itself a few bytes in rather than at position zero.
            if (head[4] == 'f' && head[5] == 't' && head[6] == 'y' && head[7] == 'p') {
                return true;
            }
            return SIGNATURES.stream().anyMatch(signature -> startsWith(head, signature));
        } catch (IOException e) {
            return false;
        }
    }

    private boolean startsWith(byte[] data, byte[] prefix) {
        if (data.length < prefix.length) {
            return false;
        }
        for (int i = 0; i < prefix.length; i++) {
            if (data[i] != prefix[i]) {
                return false;
            }
        }
        return true;
    }

    private String extensionOf(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }
}
