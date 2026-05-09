"use client";
import { ClientShell } from "@/components/ClientShell";
import { AdminShell } from "@/components/AdminShell";
import dynamic from "next/dynamic";
const AdminAnalytics = dynamic(() => import("@/views/AdminAnalytics").then(m => ({ default: m.AdminAnalytics })), { ssr: false });
export default function AdminAnalyticsPage() {
  return (
    <ClientShell>
      <AdminShell>
        <AdminAnalytics />
      </AdminShell>
    </ClientShell>
  );
}
