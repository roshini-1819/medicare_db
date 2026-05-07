package com.medicare.controller;

import com.medicare.dto.DTOs.*;
import com.medicare.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * DoctorController.java (Controller)
 * ─────────────────────────────────────
 * REST controller for all Doctor management endpoints.
 * All endpoints require a valid JWT (enforced by JwtAuthFilter + SecurityConfig).
 *
 * Endpoints:
 *
 *   POST   /api/doctors              → Create a new doctor
 *   GET    /api/doctors              → Get all doctors (optional ?search= or ?status=)
 *   GET    /api/doctors/stats        → Get dashboard statistics
 *   PATCH  /api/doctors/{id}/status  → Update doctor status (ACTIVE/INACTIVE/BLOCKED)
 *   DELETE /api/doctors/{id}         → Delete a doctor
 *
 * Query params for GET /api/doctors:
 *   ?search=<query>   → Search by name, clinical ID, or email
 *   ?status=ACTIVE    → Filter by status
 *   (no params)       → Return all doctors
 */
@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping
    public ResponseEntity<ApiResponse<DoctorResponse>> createDoctor(
            @Valid @RequestBody CreateDoctorRequest request) {
        try {
            DoctorResponse doctor = doctorService.createDoctor(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Doctor created successfully", doctor));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getDoctors(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        try {
            List<DoctorResponse> doctors;
            if (search != null && !search.isBlank()) {
                doctors = doctorService.searchDoctors(search);
            } else if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
                doctors = doctorService.getDoctorsByStatus(status);
            } else {
                doctors = doctorService.getAllDoctors();
            }
            return ResponseEntity.ok(ApiResponse.success("Doctors fetched", doctors));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DoctorStatsResponse>> getStats() {
        return ResponseEntity.ok(
                ApiResponse.success("Stats fetched", doctorService.getStats())
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            DoctorResponse updated = doctorService.updateDoctorStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("Status updated", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable Long id) {
        try {
            doctorService.deleteDoctor(id);
            return ResponseEntity.ok(ApiResponse.success("Doctor deleted", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
