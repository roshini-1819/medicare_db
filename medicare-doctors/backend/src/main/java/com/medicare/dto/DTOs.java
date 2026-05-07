package com.medicare.dto;

import com.medicare.entity.Doctor.DoctorStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;

/**
 * DTOs.java
 * ──────────
 * Data Transfer Objects (DTOs) for request and response payloads.
 * DTOs decouple the API contract from internal entity structure.
 *
 * Contains:
 *   LoginRequest      → Admin email + password for login
 *   LoginResponse     → JWT token + admin info returned after login
 *   CreateDoctorRequest → Fields the admin fills in the "Create Doctor" form
 *   DoctorResponse    → Doctor data returned to the frontend (no raw password)
 *   DoctorStatsResponse → Dashboard statistics (totals, active, inactive, blocked)
 *   ApiResponse       → Generic wrapper for success/error messages
 */
public class DTOs {

    // ─── LOGIN ───────────────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LoginResponse {
        private String token;
        private String adminName;
        private String adminEmail;
        private String role;
    }

    // ─── CREATE DOCTOR ────────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateDoctorRequest {

        @NotBlank(message = "Clinical ID is required")
        private String clinicalId;

        @NotBlank(message = "First name is required")
        private String firstName;

        @NotBlank(message = "Last name is required")
        private String lastName;

        private Integer birthYear;

        private String mobileNumber;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String specialization;

        private String clinicHospital;

        private DoctorStatus status;

        private String notes;
    }

    // ─── DOCTOR RESPONSE ─────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DoctorResponse {
        private Long id;
        private String clinicalId;
        private String firstName;
        private String lastName;
        private String fullName;
        private Integer birthYear;
        private String username;
        private String temporaryPassword;   // Shown only once on creation
        private String email;
        private String mobileNumber;
        private String specialization;
        private String clinicHospital;
        private DoctorStatus status;
        private String notes;
        private Boolean requirePasswordChange;
        private LocalDateTime lastLogin;
        private String device;
        private Integer fps;
        private LocalDateTime createdAt;
    }

    // ─── DASHBOARD STATS ─────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DoctorStatsResponse {
        private long totalDoctors;
        private long activeDoctors;
        private long inactiveDoctors;
        private long blockedDoctors;
    }

    // ─── GENERIC API RESPONSE ────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;

        public static <T> ApiResponse<T> success(String message, T data) {
            return ApiResponse.<T>builder()
                    .success(true)
                    .message(message)
                    .data(data)
                    .build();
        }

        public static <T> ApiResponse<T> error(String message) {
            return ApiResponse.<T>builder()
                    .success(false)
                    .message(message)
                    .build();
        }
    }
}
