"use client";

import { ClientShell, StoreLayout } from "@/components/ClientShell";
import dynamic from "next/dynamic";

const Returns = dynamic(() => import("@/views/Returns").then(m => ({ default: m.Returns })), { ssr: false });

export default function ReturnsPage() {
  return (
    <ClientShell>
      <StoreLayout>
        <Returns />
      </StoreLayout>
    </ClientShell>
  );
}
