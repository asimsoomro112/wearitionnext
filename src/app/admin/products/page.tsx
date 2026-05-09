"use client";
import { ClientShell } from "@/components/ClientShell";
import { AdminShell } from "@/components/AdminShell";
import dynamic from "next/dynamic";
const AdminProducts = dynamic(() => import("@/views/AdminProducts").then(m => ({ default: m.AdminProducts })), { ssr: false });
export default function AdminProductsPage() {
  return (
    <ClientShell>
      <AdminShell>
        <AdminProducts />
      </AdminShell>
    </ClientShell>
  );
}
