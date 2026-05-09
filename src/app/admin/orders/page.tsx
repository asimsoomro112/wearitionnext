"use client";
import { ClientShell } from "@/components/ClientShell";
import { AdminShell } from "@/components/AdminShell";
import dynamic from "next/dynamic";
const AdminOrders = dynamic(() => import("@/views/AdminOrders").then(m => ({ default: m.AdminOrders })), { ssr: false });
export default function AdminOrdersPage() {
  return (
    <ClientShell>
      <AdminShell>
        <AdminOrders />
      </AdminShell>
    </ClientShell>
  );
}
