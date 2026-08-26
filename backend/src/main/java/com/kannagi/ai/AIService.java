package com.kannagi.ai;

import com.kannagi.ai.model.AIAnalysisResult;
import com.kannagi.ai.model.ChatRequest;
import com.kannagi.ai.model.ChatResponse;

/**
 * Reading and replying to what someone writes.
 *
 * Behind an interface so the product runs with no API key and no internet. The
 * mock implementation is not a placeholder — it is the one that runs when the
 * network fails, which at a demo is most of the time.
 */
public interface AIService {

    AIAnalysisResult analyse(String text, String language);

    ChatResponse chat(ChatRequest request);
}
