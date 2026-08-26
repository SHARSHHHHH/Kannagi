package com.kannagi.privacy.crypto;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

/**
 * Applies field-level encryption transparently at the JPA layer.
 *
 * Annotate a field with {@code @Convert(converter = EncryptedStringConverter.class)}
 * and it is encrypted on write and decrypted on read. Entity code stays clean and
 * nobody can forget to encrypt.
 *
 * Hibernate instantiates converters itself, so the service is held statically and
 * injected once at startup.
 */
@Component
@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    private static EncryptionService encryptionService;

    @Autowired
    public void setEncryptionService(@Lazy EncryptionService service) {
        EncryptedStringConverter.encryptionService = service;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return service().encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return service().decrypt(dbData);
    }

    private static EncryptionService service() {
        if (encryptionService == null) {
            throw new IllegalStateException(
                    "EncryptionService is not initialised yet — the application context "
                    + "must be started before entities are persisted.");
        }
        return encryptionService;
    }
}
