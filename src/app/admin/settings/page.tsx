"use client";

import { ClientShell } from "@/components/ClientShell";
import { AdminShell } from "@/components/AdminShell";
import dynamic from "next/dynamic";

const AdminSettings = dynamic(() => import("@/views/AdminSettings").then(m => ({ default: m.AdminSettings })), { ssr: false });

export default function AdminSettingsPage() {
  return (
    <ClientShell>
      <AdminShell>
        <AdminSettings />
      </AdminShell>
    </ClientShell>
  );
}
