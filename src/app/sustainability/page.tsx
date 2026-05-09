"use client";
import { ClientShell, StoreLayout } from "@/components/ClientShell";
import dynamic from "next/dynamic";

const Sustainability = dynamic(() => import("@/views/Sustainability").then(m => ({ default: m.Sustainability })), { ssr: false });

export default function SustainabilityPage() {
  return (
    <ClientShell>
      <StoreLayout>
        <Sustainability />
      </StoreLayout>
    </ClientShell>
  );
}
