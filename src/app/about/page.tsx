"use client";
import { ClientShell, StoreLayout } from "@/components/ClientShell";
import dynamic from "next/dynamic";
const About = dynamic(() => import("@/views/About").then(m => ({ default: m.About })), { ssr: false });
export default function AboutPage() {
  return <ClientShell><StoreLayout><About /></StoreLayout></ClientShell>;
}
