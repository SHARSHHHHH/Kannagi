package com.kannagi.speech;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.Map;

/**
 * Stands in for a transcription provider when none is configured.
 *
 * It returns a fixed sentence per language rather than pretending to have heard
 * anything, and the transcript says so. A demo that silently invents words a
 * person did not say would be exactly the failure this product is built to
 * avoid.
 */
@Service
@ConditionalOnProperty(name = "app.speech.provider", havingValue = "mock", matchIfMissing = true)
@Slf4j
public class MockSpeechService implements SpeechToTextService {

    private static final Map<String, String> SAMPLES = Map.of(
            "ta", "\u0B8E\u0BA9\u0BCD \u0BAE\u0BC7\u0BB2\u0BBE\u0BB3\u0BB0\u0BCD "
                + "\u0BA4\u0BCA\u0B9F\u0BB0\u0BCD\u0BA8\u0BCD\u0BA4\u0BC1 "
                + "\u0BA4\u0BC6\u0BB0\u0BBF\u0BAF\u0BBE\u0BA4 \u0B9A\u0BC6\u0BAF\u0BCD\u0BA4\u0BBF"
                + "\u0B95\u0BB3\u0BCD \u0B85\u0BA9\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BBF\u0BB1\u0BBE\u0BB0\u0BCD. "
                + "[DEMO TRANSCRIPT \u2014 no transcription provider configured]",
            "hi", "\u092E\u0947\u0930\u093E \u092E\u0948\u0928\u0947\u091C\u0930 \u092E\u0941\u091D\u0947 "
                + "\u0917\u0932\u0924 \u0938\u0902\u0926\u0947\u0936 \u092D\u0947\u091C\u0924\u093E \u0939\u0948\u0964 "
                + "[DEMO TRANSCRIPT \u2014 no transcription provider configured]",
            "en", "My manager keeps sending me inappropriate messages and says my promotion "
                + "depends on meeting him privately. [DEMO TRANSCRIPT — no transcription "
                + "provider configured]");

    public MockSpeechService() {
        log.warn("Speech provider: MOCK. Recordings are not transcribed — a sample "
               + "transcript is returned, clearly labelled. Set SPEECH_PROVIDER=whisper "
               + "with a key for real transcription.");
    }

    @Override
    public TranscriptionResult transcribe(InputStream audio, String filename, String language) {
        String code = (language == null || !SAMPLES.containsKey(language)) ? "en" : language;
        return new TranscriptionResult(SAMPLES.get(code), code, 0.0, 0);
    }
}
