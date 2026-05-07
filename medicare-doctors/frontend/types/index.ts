/**
 * types/index.ts
 * ───────────────
 * Shared TypeScript type definitions used across the frontend.
 * Mirrors the backend DTOs for type safety between frontend and backend.
 */

export interface Admin {
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  adminName: string;
  adminEmail: string;
  role: string;
}

export type DoctorStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface Doctor {
  id: number;
  clinicalId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  birthYear?: number;
  username: string;
  temporaryPassword?: string;
  email: string;
  mobileNumber?: string;
  specialization?: string;
  clinicHospital?: string;
  status: DoctorStatus;
  notes?: string;
  requirePasswordChange: boolean;
  lastLogin?: string;
  device?: string;
  fps?: number;
  createdAt: string;
}

export interface DoctorStats {
  totalDoctors: number;
  activeDoctors: number;
  inactiveDoctors: number;
  blockedDoctors: number;
}

export interface CreateDoctorForm {
  clinicalId: string;
  firstName: string;
  lastName: string;
  birthYear?: number | '';
  mobileNumber?: string;
  email: string;
  specialization?: string;
  clinicHospital?: string;
  status: DoctorStatus;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
