package com.medicare.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Admin.java (Entity)
 * ────────────────────
 * Represents the Admin user in the database.
 * The admin is the only user who can log in to the portal,
 * create doctors, and manage their access.
 *
 * Maps to the "admins" table in PostgreSQL.
 */
@Entity
@Table(name = "admins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;  // BCrypt hashed

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private String role = "ADMIN";
}
