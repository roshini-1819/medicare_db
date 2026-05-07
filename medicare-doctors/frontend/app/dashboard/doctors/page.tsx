/**
 * app/dashboard/doctors/page.tsx
 * ────────────────────────────────
 * The main Doctors page — matches both reference images exactly.
 *
 * Features:
 *   - "Doctor Accounts Control" heading with "Pro" badge
 *   - 4 stat cards: Total, Active, Inactive, Blocked doctors
 *   - "Doctors Directory" table with columns:
 *       Clinical ID | Doctor | Username | Doctor ID | Status | Password | Last Login | Device | FPS | Actions
 *   - Search bar (searches name, clinical ID, email)
 *   - Status filter dropdown
 *   - "Export" button
 *   - "+ Create Doctor" button (opens modal)
 *   - Empty state: "No doctors found" with "Create your first doctor →"
 *   - Status badges (Active=green, Inactive=yellow, Blocked=red)
 *   - Actions: Change status dropdown + Delete button per row
 *   - Auto-fetches data on mount and after creating/deleting a doctor
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Download,
  Search,
  ChevronDown,
  Users,
  UserCheck,
  UserX,
  UserMinus,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorsAPI } from '@/lib/api';
import { Doctor, DoctorStats } from '@/types';
import CreateDoctorModal from '@/components/CreateDoctorModal';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 border-green-200',
  INACTIVE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  BLOCKED: 'bg-red-100 text-red-700 border-red-200',
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [stats, setStats] = useState<DoctorStats>({
    totalDoctors: 0,
    activeDoctors: 0,
    inactiveDoctors: 0,
    blockedDoctors: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [doctorsRes, statsRes] = await Promise.all([
        doctorsAPI.getAll(search || undefined, statusFilter !== 'ALL' ? statusFilter : undefined),
        doctorsAPI.getStats(),
      ]);
      if (doctorsRes.success) setDoctors(doctorsRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(fetchData, search ? 400 : 0);
    return () => clearTimeout(timeout);
  }, [fetchData]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete Dr. ${name}? This cannot be undone.`)) return;
    try {
      await doctorsAPI.delete(id);
      toast.success('Doctor deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete doctor');
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await doctorsAPI.updateStatus(id, newStatus);
      toast.success('Status updated');
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Clinical ID', 'Name', 'Username', 'Email', 'Specialization', 'Status', 'Clinic', 'Created'],
      ...doctors.map((d) => [
        d.clinicalId,
        d.fullName,
        d.username,
        d.email,
        d.specialization || '',
        d.status,
        d.clinicHospital || '',
        new Date(d.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'doctors.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Doctor Accounts Control</h1>
            <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded-md">Pro</span>
          </div>
          <p className="text-sm text-gray-500 max-w-2xl">
            Admin controls officer's (i.e., doctor) access. Usernames and temporary passwords are
            auto-generated, and the doctor must change password on first login before entering the dashboard.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Doctor
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Total Doctors"
          value={stats.totalDoctors}
          change="+12%"
          positive
          icon={<Users className="w-5 h-5 text-indigo-500" />}
          iconBg="bg-indigo-50"
        />
        <StatCard
          label="Active Doctors"
          value={stats.activeDoctors}
          change="+8%"
          positive
          icon={<UserCheck className="w-5 h-5 text-green-500" />}
          iconBg="bg-green-50"
        />
        <StatCard
          label="Inactive Doctors"
          value={stats.inactiveDoctors}
          change="-4%"
          positive={false}
          icon={<UserMinus className="w-5 h-5 text-yellow-500" />}
          iconBg="bg-yellow-50"
        />
        <StatCard
          label="Blocked Accounts"
          value={stats.blockedDoctors}
          change="+0%"
          positive={true}
          icon={<UserX className="w-5 h-5 text-red-500" />}
          iconBg="bg-red-50"
        />
      </div>

      {/* Doctors Directory */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {/* Table Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Doctors Directory</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing {doctors.length} of {stats.totalDoctors} registered doctors
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <Download className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" onClick={handleExport} />
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-50">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, clinical ID, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-purple-200 focus:border-purple-400 cursor-pointer bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="BLOCKED">Blocked</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-1">No doctors found</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-1"
            >
              Create your first doctor →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Clinical ID', 'Doctor', 'Username', 'Doctor ID', 'Status', 'Password', 'Last Login', 'Device', 'FPS', 'Actions'].map(
                    (col) => (
                      <th
                        key={col}
                        className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                        {doc.clinicalId}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-700 text-xs font-bold">
                            {doc.firstName.charAt(0)}{doc.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.fullName}</p>
                          <p className="text-xs text-gray-500">{doc.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono text-gray-600">{doc.username}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-gray-500">#{doc.id}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[doc.status]}`}
                      >
                        {doc.status.charAt(0) + doc.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-gray-400 font-mono">••••••••</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-gray-500">
                        {doc.lastLogin
                          ? new Date(doc.lastLogin).toLocaleDateString()
                          : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-gray-500">{doc.device || '—'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-gray-500">{doc.fps ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {/* Status Change */}
                        <select
                          value={doc.status}
                          onChange={(e) => handleStatusChange(doc.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 cursor-pointer focus:ring-1 focus:ring-purple-300"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="BLOCKED">Blocked</option>
                        </select>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(doc.id, doc.fullName)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Doctor Modal */}
      <CreateDoctorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => fetchData()}
      />
    </div>
  );
}

// ─── Stat Card Component ──────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  change,
  positive,
  icon,
  iconBg,
}: {
  label: string;
  value: number;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <div className="flex items-center gap-1">
        <span className={`text-xs font-semibold ${positive ? 'text-green-600' : 'text-red-500'}`}>
          {positive ? '↑' : '↓'} {change}
        </span>
        <span className="text-xs text-gray-400">vs last month</span>
      </div>
    </div>
  );
}
