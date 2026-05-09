"use client";
import { ClientShell, StoreLayout } from "@/components/ClientShell";
import dynamic from "next/dynamic";

const Shipping = dynamic(() => import("@/views/Shipping").then(m => ({ default: m.Shipping })), { ssr: false });

export default function ShippingPage() {
  return (
    <ClientShell>
      <StoreLayout>
        <Shipping />
      </StoreLayout>
    </ClientShell>
  );
}
