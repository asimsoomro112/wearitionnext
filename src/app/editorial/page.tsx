"use client";
import { ClientShell, StoreLayout } from "@/components/ClientShell";
import dynamic from "next/dynamic";
const Editorial = dynamic(() => import("@/views/Editorial").then(m => ({ default: m.Editorial })), { ssr: false });
export default function EditorialPage() {
  return <ClientShell><StoreLayout><Editorial /></StoreLayout></ClientShell>;
}
