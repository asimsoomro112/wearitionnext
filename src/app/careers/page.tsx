"use client";
import { ClientShell, StoreLayout } from "@/components/ClientShell";
import dynamic from "next/dynamic";

const Careers = dynamic(() => import("@/views/Careers").then(m => ({ default: m.Careers })), { ssr: false });

export default function CareersPage() {
  return (
    <ClientShell>
      <StoreLayout>
        <Careers />
      </StoreLayout>
    </ClientShell>
  );
}
