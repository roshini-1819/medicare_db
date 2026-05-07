package com.medicare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * MedicareApplication.java
 * ─────────────────────────
 * Entry point for the Spring Boot application.
 * @SpringBootApplication enables auto-configuration, component scanning,
 * and property support all in one annotation.
 */
@SpringBootApplication
public class MedicareApplication {
    public static void main(String[] args) {
        SpringApplication.run(MedicareApplication.class, args);
    }
}
