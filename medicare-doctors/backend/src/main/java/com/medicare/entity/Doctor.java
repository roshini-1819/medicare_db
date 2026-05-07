package com.medicare.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Doctor.java (Entity)
 * ─────────────────────
 * Represents a Doctor account in the system.
 * Doctors are created by the Admin. Each doctor gets:
 *   - An auto-generated username (DRXX + number)
 *   - An auto-generated temporary password
 *   - A requirePasswordChange flag so they must set their own password on first login
 *
 * Maps to the "doctors" table in PostgreSQL.
 *
 * Fields:
 *   clinicalId          → Unique clinical identifier (e.g., CLN-ORTHO-1001)
 *   firstName / lastName → Doctor's real name
 *   birthYear           → Optional birth year
 *   username            → Auto-generated login username (e.g., DRXX0001)
 *   temporaryPassword   → Hashed initial password set by admin
 *   email               → Doctor's email (required, unique)
 *   mobileNumber        → Optional phone number
 *   specialization      → Medical specialty (e.g., Orthopedics, Cardiology)
 *   clinicHospital      → Clinic or hospital name
 *   status              → ACTIVE, INACTIVE, or BLOCKED
 *   notes               → Admin notes about this doctor
 *   requirePasswordChange → true until doctor sets a permanent password
 *   lastLogin           → Timestamp of last login
 *   device              → Last device used to login
 *   fps                 → Frame-per-second metric (for exercise platform)
 *   createdAt           → Record creation timestamp
 */
@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "clinical_id", nullable = false, unique = true)
    private String clinicalId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "birth_year")
    private Integer birthYear;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(name = "temporary_password", nullable = false)
    private String temporaryPassword;  // BCrypt hashed

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "mobile_number")
    private String mobileNumber;

    private String specialization;

    @Column(name = "clinic_hospital")
    private String clinicHospital;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DoctorStatus status = DoctorStatus.ACTIVE;

    private String notes;

    @Column(name = "require_password_change", nullable = false)
    @Builder.Default
    private Boolean requirePasswordChange = true;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    private String device;

    private Integer fps;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * DoctorStatus Enum
     * Represents the three possible states of a doctor account.
     */
    public enum DoctorStatus {
        ACTIVE,
        INACTIVE,
        BLOCKED
    }
}
