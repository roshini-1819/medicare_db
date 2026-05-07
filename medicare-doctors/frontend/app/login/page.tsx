/**
 * app/login/page.tsx
 * ───────────────────
 * Admin login page.
 *
 * Features:
 *   - Email + password form
 *   - Calls POST /api/auth/login via authAPI
 *   - Saves JWT + admin info to localStorage on success
 *   - Redirects to /dashboard on successful login
 *   - Shows toast notifications for errors
 *   - Show/hide password toggle
 *   - Loading state during API call
 *
 * Default credentials (seeded by DataInitializer.java):
 *   Email:    admin@medicare.com
 *   Password: Admin@123
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/api';
import { saveAuth, isAuthenticated } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) router.replace('/dashboard');
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      if (response.success) {
        saveAuth(response.data);
        toast.success(`Welcome back, ${response.data.adminName}!`);
        router.push('/dashboard');
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#f0f2f8' }}>
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: '#1a1d2e' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">M+</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">MediCare</h1>
            <p className="text-gray-400 text-xs">Admin Portal</p>
          </div>
        </div>

        {/* Center content */}
        <div>
          <div className="mb-8">
            <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-6">
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-white text-3xl font-bold mb-4 leading-tight">
              Doctor Account<br />Management System
            </h2>
            <p className="text-gray-400 text-base leading-relaxed">
              Manage doctor profiles, control access, and monitor activity from a single unified dashboard.
            </p>
          </div>

          {/* Feature bullets */}
          <div className="space-y-3">
            {[
              'Auto-generated secure credentials',
              'Real-time access control',
              'Comprehensive audit trail',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                </div>
                <span className="text-gray-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-gray-600 text-xs">© 2024 MediCare. All rights reserved.</p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M+</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">MediCare</h1>
              <p className="text-gray-500 text-xs">Admin Portal</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 text-sm mt-1">Sign in to your admin account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@medicare.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Hint */}
            <div className="mt-6 p-3 bg-purple-50 rounded-xl border border-purple-100">
              <p className="text-xs text-purple-700 text-center">
                <strong>Default credentials:</strong> admin@medicare.com / Admin@123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
