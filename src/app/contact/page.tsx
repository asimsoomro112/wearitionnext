"use client";
import { ClientShell, StoreLayout } from "@/components/ClientShell";
import dynamic from "next/dynamic";
const Contact = dynamic(() => import("@/views/Contact").then(m => ({ default: m.Contact })), { ssr: false });
export default function ContactPage() {
  return <ClientShell><StoreLayout><Contact /></StoreLayout></ClientShell>;
}
