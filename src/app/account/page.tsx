"use client";
import { ClientShell, StoreLayout } from "@/components/ClientShell";
import dynamic from "next/dynamic";
const Account = dynamic(() => import("@/views/Account").then(m => ({ default: m.Account })), { ssr: false });
export default function AccountPage() {
  return <ClientShell><StoreLayout><Account /></StoreLayout></ClientShell>;
}
