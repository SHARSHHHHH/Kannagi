package com.kannagi.speech;

import com.fasterxml.jackson.databind.JsonNode;
import com.kannagi.common.config.AppProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;

/** Whisper, or any API speaking the same shape. */
@Service
@ConditionalOnProperty(name = "app.speech.provider", havingValue = "whisper")
@Slf4j
public class WhisperSpeechService implements SpeechToTextService {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String baseUrl;

    public WhisperSpeechService(RestTemplate restTemplate, AppProperties props) {
        this.restTemplate = restTemplate;
        this.apiKey = props.speech().apiKey();
        this.baseUrl = props.speech().baseUrl();
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("SPEECH_API_KEY must be set when SPEECH_PROVIDER=whisper");
        }
    }

    @Override
    public TranscriptionResult transcribe(InputStream audio, String filename, String language) {
        try {
            byte[] bytes = audio.readAllBytes();

            MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
            form.add("file", new ByteArrayResource(bytes) {
                @Override
                public String getFilename() {
                    return filename;
                }
            });
            form.add("model", "whisper-1");
            form.add("response_format", "verbose_json");
            if (language != null && !language.isBlank()) {
                form.add("language", language);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.setBearerAuth(apiKey);

            JsonNode body = restTemplate.exchange(
                    baseUrl + "/audio/transcriptions", HttpMethod.POST,
                    new HttpEntity<>(form, headers), JsonNode.class).getBody();

            return new TranscriptionResult(
                    body.path("text").asText(""),
                    body.path("language").asText(language == null ? "en" : language),
                    1.0,
                    (int) body.path("duration").asDouble(0));

        } catch (Exception e) {
            log.error("Transcription failed", e);
            throw new IllegalStateException("Transcription failed", e);
        }
    }
}
