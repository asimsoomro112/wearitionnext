"use client";
import { ClientShell } from "@/components/ClientShell";
import { AdminShell } from "@/components/AdminShell";
import dynamic from "next/dynamic";
const AdminUsers = dynamic(() => import("@/views/AdminUsers").then(m => ({ default: m.AdminUsers })), { ssr: false });
export default function AdminUsersPage() {
  return (
    <ClientShell>
      <AdminShell>
        <AdminUsers />
      </AdminShell>
    </ClientShell>
  );
}
