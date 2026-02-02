"use client";

import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminUsersClient } from "@/components/admin/AdminUsersClient";

export default function AdminUsersPage() {
  return (
    <AdminErrorBoundary>
      <main className="relative mx-auto flex max-w-7xl flex-col px-6 py-10 pb-20">
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-24 top-16 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px] animate-blob" />
          <div className="absolute -right-28 top-24 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px] animate-blob animation-delay-2000" />
        </div>

        <div className="relative z-10">
          <AdminHeader 
            title="Користувачі" 
            subtitle="Керування доступом та ролями учасників клану" 
          />
          <AdminUsersClient />
        </div>
      </main>
    </AdminErrorBoundary>
  );
}