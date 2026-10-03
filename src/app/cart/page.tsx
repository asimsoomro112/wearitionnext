"use client";
import { ClientShell, StoreLayout } from "@/components/ClientShell";
import dynamic from "next/dynamic";

const Cart = dynamic(() => import("@/views/Cart").then(m => ({ default: m.Cart })), { ssr: false });

export default function CartPage() {
  return (
    <ClientShell>
      <StoreLayout>
        <Cart />
      </StoreLayout>
    </ClientShell>
  );
}
