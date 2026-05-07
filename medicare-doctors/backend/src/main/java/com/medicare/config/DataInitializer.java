package com.medicare.config;

import com.medicare.entity.Admin;
import com.medicare.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * DataInitializer.java (Config)
 * ──────────────────────────────
 * Seeds the database with a default admin user on first startup.
 * Implements CommandLineRunner — runs automatically after Spring Boot starts.
 *
 * Default admin credentials:
 *   Email    : admin@medicare.com
 *   Password : Admin@123
 *
 * IMPORTANT: Change these credentials in production!
 *
 * The check `if adminRepository.count() == 0` ensures the seed only runs
 * once on a fresh database, not on every restart.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (adminRepository.count() == 0) {
            Admin admin = Admin.builder()
                    .email("admin@medicare.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .name("Admin User")
                    .role("ADMIN")
                    .build();
            adminRepository.save(admin);
            log.info("Default admin created: admin@medicare.com / Admin@123");
        }
    }
}
