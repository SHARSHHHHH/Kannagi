package com.kannagi.case_management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AddMessageRequest(

        @NotBlank(message = "Write something first")
        @Size(max = 10000, message = "That is longer than we can accept in one message")
        String content,

        @Pattern(regexp = "^(en|ta|hi|te|ml|kn)$", message = "Choose a supported language")
        String language
) {}
