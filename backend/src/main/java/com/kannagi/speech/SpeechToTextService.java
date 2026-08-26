package com.kannagi.speech;

import java.io.InputStream;

public interface SpeechToTextService {

    TranscriptionResult transcribe(InputStream audio, String filename, String language);
}
