"use client";
import { ClientShell, StoreLayout } from "@/components/ClientShell";
import dynamic from "next/dynamic";
const ProductDetails = dynamic(() => import("@/views/ProductDetails").then(m => ({ default: m.ProductDetails })), { ssr: false });
export default function ProductPage() {
  return <ClientShell><StoreLayout><ProductDetails /></StoreLayout></ClientShell>;
}
