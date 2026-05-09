"use client";

import { ClientShell, StoreLayout } from "@/components/ClientShell";
import dynamic from "next/dynamic";

const Brands = dynamic(() => import("@/views/Brands").then(m => ({ default: m.Brands })), { ssr: false });

export default function BrandsPage() {
  return (
    <ClientShell>
      <StoreLayout>
        <Brands />
      </StoreLayout>
    </ClientShell>
  );
}
