/**
 * lib/api.ts
 * ───────────
 * Centralized API client using Axios.
 *
 * - Base URL: http://localhost:8081/api (Spring Boot backend)
 * - Request interceptor: Automatically attaches the JWT token from localStorage
 *   to every request's Authorization header.
 * - Response interceptor: On 401 Unauthorized, clears stored auth data
 *   and redirects to login page (handles token expiry).
 *
 * All API functions are exported here for use throughout the app:
 *   authAPI.login()
 *   doctorsAPI.getAll()
 *   doctorsAPI.create()
 *   doctorsAPI.getStats()
 *   doctorsAPI.updateStatus()
 *   doctorsAPI.delete()
 */

import axios from 'axios';
import { LoginResponse, Doctor, DoctorStats, CreateDoctorForm, ApiResponse } from '@/types';

const apiClient = axios.create({
  baseURL: 'http://localhost:8081/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('medicare_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 → redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('medicare_token');
      localStorage.removeItem('medicare_admin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ────────────────────────────────────────────────────────────────

export const authAPI = {
  login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },
};

// ─── Doctors API ─────────────────────────────────────────────────────────────

export const doctorsAPI = {
  getAll: async (search?: string, status?: string): Promise<ApiResponse<Doctor[]>> => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (status && status !== 'ALL') params.status = status;
    const res = await apiClient.get('/doctors', { params });
    return res.data;
  },

  create: async (data: CreateDoctorForm): Promise<ApiResponse<Doctor>> => {
    const res = await apiClient.post('/doctors', data);
    return res.data;
  },

  getStats: async (): Promise<ApiResponse<DoctorStats>> => {
    const res = await apiClient.get('/doctors/stats');
    return res.data;
  },

  updateStatus: async (id: number, status: string): Promise<ApiResponse<Doctor>> => {
    const res = await apiClient.patch(`/doctors/${id}/status`, null, { params: { status } });
    return res.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const res = await apiClient.delete(`/doctors/${id}`);
    return res.data;
  },
};

export default apiClient;
