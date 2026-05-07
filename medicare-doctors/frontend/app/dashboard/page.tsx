/**
 * app/dashboard/page.tsx
 * ──────────────────────────
 * Main dashboard landing page.
 * Shows a welcome message and quick stats overview.
 * Clicking "Doctors" from the sidebar takes you to /dashboard/doctors.
 */

'use client';

import Link from 'next/link';
import { Stethoscope, Users, Building2, ArrowRight } from 'lucide-react';
import { getAdmin } from '@/lib/auth';

export default function DashboardPage() {
  const admin = getAdmin();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {admin?.name || 'Admin'} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening in your portal today.</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link href="/dashboard/doctors">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Stethoscope className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Doctors</h3>
            <p className="text-sm text-gray-500 mb-4">Manage doctor accounts and access control</p>
            <div className="flex items-center gap-1 text-purple-600 text-sm font-medium group-hover:gap-2 transition-all">
              Go to Doctors <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm opacity-60">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Patients</h3>
          <p className="text-sm text-gray-500 mb-4">View and manage patient records</p>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Coming soon</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm opacity-60">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Clinics</h3>
          <p className="text-sm text-gray-500 mb-4">Manage clinic and hospital profiles</p>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Coming soon</span>
        </div>
      </div>
    </div>
  );
}
