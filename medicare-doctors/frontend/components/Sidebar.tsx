/**
 * components/Sidebar.tsx
 * ───────────────────────
 * Left navigation sidebar matching the MediCare dark theme.
 *
 * Features:
 *   - MediCare logo + "Admin Portal" branding at top
 *   - Navigation links: Dashboard, Doctors (active), Patients, Clinics,
 *     Exercise Library, Analytics, Notifications, Settings
 *   - Active state highlighting with purple accent
 *   - Admin user info at the bottom
 *   - Logout functionality
 *   - "Doctors" menu item has a purple dot indicator (active section)
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  Building2,
  Dumbbell,
  BarChart2,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react';
import { getAdmin, logout } from '@/lib/auth';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Stethoscope, label: 'Doctors', href: '/dashboard/doctors', dot: true },
  { icon: Users, label: 'Patients', href: '/dashboard/patients' },
  { icon: Building2, label: 'Clinics', href: '/dashboard/clinics' },
  { icon: Dumbbell, label: 'Exercise Library', href: '/dashboard/exercises' },
  { icon: BarChart2, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const admin = getAdmin();

  return (
    <aside
      className="w-[160px] min-h-screen flex flex-col"
      style={{ background: '#1a1d2e' }}
    >
      {/* Logo */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">M+</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">MediCare</p>
            <p className="text-gray-500 text-[10px]">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all relative ${
                isActive
                  ? 'bg-purple-600/20 text-purple-300'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
              {item.dot && isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin info + Logout */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {admin?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{admin?.name || 'Admin User'}</p>
            <p className="text-gray-500 text-[10px] truncate">{admin?.email || 'admin@medicare.com'}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
