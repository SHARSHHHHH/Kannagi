package com.kannagi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Application entry point.
 *
 * The root package is deliberately brand-neutral in structure: the product
 * name is never read from the package name, only from app.brand.* config.
 * See README, "Renaming the product".
 */
@SpringBootApplication
@ConfigurationPropertiesScan
@EnableScheduling
public class KannagiApplication {

    public static void main(String[] args) {
        SpringApplication.run(KannagiApplication.class, args);
    }
}
