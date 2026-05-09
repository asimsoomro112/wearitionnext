"use client";
import { ClientShell, StoreLayout } from "@/components/ClientShell";
import dynamic from "next/dynamic";
const Checkout = dynamic(() => import("@/views/Checkout").then(m => ({ default: m.Checkout })), { ssr: false });
export default function CheckoutPage() {
  return <ClientShell><StoreLayout><Checkout /></StoreLayout></ClientShell>;
}
