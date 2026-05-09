"use client";
import { ClientShell, StoreLayout } from "@/components/ClientShell";
import dynamic from "next/dynamic";

const Privacy = dynamic(() => import("@/views/Privacy").then(m => ({ default: m.Privacy })), { ssr: false });

export default function PrivacyPage() {
  return (
    <ClientShell>
      <StoreLayout>
        <Privacy />
      </StoreLayout>
    </ClientShell>
  );
}
