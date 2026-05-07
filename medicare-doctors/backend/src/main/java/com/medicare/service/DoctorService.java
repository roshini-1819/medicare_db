package com.medicare.service;

import com.medicare.dto.DTOs.*;
import com.medicare.entity.Doctor;
import com.medicare.entity.Doctor.DoctorStatus;
import com.medicare.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * DoctorService.java (Service)
 * ─────────────────────────────
 * Core business logic for the Doctors module.
 *
 * Methods:
 *
 *   createDoctor(request)
 *     → Validates that clinicalId and email are unique
 *     → Auto-generates username: "DR" + zero-padded ID (e.g., DR00001)
 *     → Auto-generates temporary password: "Doctor#" + random 7-digit number
 *     → Hashes the temp password with BCrypt before saving
 *     → Sets requirePasswordChange = true
 *     → Returns full DoctorResponse INCLUDING the plain-text temp password
 *       (shown ONCE to the admin — after this, it cannot be recovered)
 *
 *   getAllDoctors()
 *     → Returns all doctors, ordered newest first
 *
 *   searchDoctors(query)
 *     → Full text search across name, clinical ID, email
 *
 *   getDoctorsByStatus(status)
 *     → Filter by ACTIVE / INACTIVE / BLOCKED
 *
 *   getStats()
 *     → Returns counts for dashboard stat cards
 *
 *   updateDoctorStatus(id, status)
 *     → Admin can block/unblock/deactivate a doctor
 *
 *   deleteDoctor(id)
 *     → Hard delete (consider soft delete in production)
 */
@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    public DoctorResponse createDoctor(CreateDoctorRequest request) {
        // Check uniqueness
        if (doctorRepository.findByClinicalId(request.getClinicalId()).isPresent()) {
            throw new RuntimeException("Clinical ID already exists: " + request.getClinicalId());
        }
        if (doctorRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }

        // Auto-generate username
        long count = doctorRepository.count() + 1;
        String username = String.format("DR%05d", count);

        // Auto-generate temporary password
        int randomPart = (int)(Math.random() * 9000000) + 1000000;
        String plainTempPassword = "Doctor#" + randomPart;
        String hashedTempPassword = passwordEncoder.encode(plainTempPassword);

        // Determine status
        DoctorStatus status = request.getStatus() != null ? request.getStatus() : DoctorStatus.ACTIVE;

        Doctor doctor = Doctor.builder()
                .clinicalId(request.getClinicalId())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .birthYear(request.getBirthYear())
                .username(username)
                .temporaryPassword(hashedTempPassword)
                .email(request.getEmail())
                .mobileNumber(request.getMobileNumber())
                .specialization(request.getSpecialization())
                .clinicHospital(request.getClinicHospital())
                .status(status)
                .notes(request.getNotes())
                .requirePasswordChange(true)
                .build();

        Doctor saved = doctorRepository.save(doctor);

        // Map to response — include plain text password ONCE
        DoctorResponse response = mapToResponse(saved);
        response.setTemporaryPassword(plainTempPassword);  // Override with plain text for one-time display
        return response;
    }

    public List<DoctorResponse> getAllDoctors() {
        return doctorRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<DoctorResponse> searchDoctors(String query) {
        return doctorRepository.searchDoctors(query)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<DoctorResponse> getDoctorsByStatus(String status) {
        DoctorStatus doctorStatus = DoctorStatus.valueOf(status.toUpperCase());
        return doctorRepository.findByStatus(doctorStatus)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DoctorStatsResponse getStats() {
        return DoctorStatsResponse.builder()
                .totalDoctors(doctorRepository.count())
                .activeDoctors(doctorRepository.countByStatus(DoctorStatus.ACTIVE))
                .inactiveDoctors(doctorRepository.countByStatus(DoctorStatus.INACTIVE))
                .blockedDoctors(doctorRepository.countByStatus(DoctorStatus.BLOCKED))
                .build();
    }

    public DoctorResponse updateDoctorStatus(Long id, String status) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
        doctor.setStatus(DoctorStatus.valueOf(status.toUpperCase()));
        return mapToResponse(doctorRepository.save(doctor));
    }

    public void deleteDoctor(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new RuntimeException("Doctor not found with id: " + id);
        }
        doctorRepository.deleteById(id);
    }

    private DoctorResponse mapToResponse(Doctor doctor) {
        return DoctorResponse.builder()
                .id(doctor.getId())
                .clinicalId(doctor.getClinicalId())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .fullName(doctor.getFirstName() + " " + doctor.getLastName())
                .birthYear(doctor.getBirthYear())
                .username(doctor.getUsername())
                .temporaryPassword("••••••••")  // Never expose hashed password
                .email(doctor.getEmail())
                .mobileNumber(doctor.getMobileNumber())
                .specialization(doctor.getSpecialization())
                .clinicHospital(doctor.getClinicHospital())
                .status(doctor.getStatus())
                .notes(doctor.getNotes())
                .requirePasswordChange(doctor.getRequirePasswordChange())
                .lastLogin(doctor.getLastLogin())
                .device(doctor.getDevice())
                .fps(doctor.getFps())
                .createdAt(doctor.getCreatedAt())
                .build();
    }
}
