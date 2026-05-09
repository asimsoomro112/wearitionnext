"use client";
import { ClientShell, StoreLayout } from "@/components/ClientShell";
import dynamic from "next/dynamic";
const Shop = dynamic(() => import("@/views/Shop").then(m => ({ default: m.Shop })), { ssr: false });
export default function ShopPage() {
  return <ClientShell><StoreLayout><Shop /></StoreLayout></ClientShell>;
}
