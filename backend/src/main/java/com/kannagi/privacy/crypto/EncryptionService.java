package com.kannagi.privacy.crypto;

/**
 * Authenticated encryption for data at rest.
 *
 * Provider-agnostic on purpose: swapping AES-GCM for a KMS-backed
 * implementation later should not touch a single entity class.
 */
public interface EncryptionService {

    /** @return ciphertext safe to store in a text column, or null for null input. */
    String encrypt(String plaintext);

    /** @return the original plaintext, or null for null input. */
    String decrypt(String ciphertext);
}
