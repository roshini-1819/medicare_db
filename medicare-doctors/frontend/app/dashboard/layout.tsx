/**
 * app/dashboard/layout.tsx
 * ──────────────────────────
 * Dashboard layout — wraps all /dashboard/* pages.
 *
 * Features:
 *   - Auth guard: Redirects to /login if user is not authenticated
 *   - Renders the Sidebar + main content area
 *   - Flex layout: sidebar (fixed width) + scrollable main content
 *
 * All dashboard pages (Dashboard overview, Doctors, etc.)
 * are rendered inside the {children} slot.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
