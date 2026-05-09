"use client";
import { ClientShell } from "@/components/ClientShell";
import { AdminShell } from "@/components/AdminShell";
import dynamic from "next/dynamic";
const AdminDashboard = dynamic(() => import("@/views/AdminDashboard").then(m => ({ default: m.AdminDashboard })), { ssr: false });
export default function AdminPage() {
  return (
    <ClientShell>
      <AdminShell>
        <AdminDashboard />
      </AdminShell>
    </ClientShell>
  );
}
