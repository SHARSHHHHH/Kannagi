package com.kannagi.ai.model;

/**
 * How strongly the description points at a category.
 *
 * Deliberately not called a diagnosis, a score, or a probability. It describes
 * the strength of a signal in text, never a fact about the person.
 */
public enum ConcernLevel {
    LOW, MODERATE, HIGH, IMMEDIATE_SAFETY_CONCERN
}
