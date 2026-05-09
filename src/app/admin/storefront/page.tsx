"use client";
import { ClientShell } from "@/components/ClientShell";
import { AdminShell } from "@/components/AdminShell";
import dynamic from "next/dynamic";
const AdminStorefront = dynamic(() => import("@/views/AdminStorefront").then(m => ({ default: m.AdminStorefront })), { ssr: false });
export default function AdminStorefrontPage() {
  return (
    <ClientShell>
      <AdminShell>
        <AdminStorefront />
      </AdminShell>
    </ClientShell>
  );
}
