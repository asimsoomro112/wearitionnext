"use client";
import { ClientShell, StoreLayout } from "@/components/ClientShell";
import dynamic from "next/dynamic";
const OrderSuccess = dynamic(() => import("@/views/OrderSuccess").then(m => ({ default: m.OrderSuccess })), { ssr: false });
export default function OrderSuccessPage() {
  return <ClientShell><StoreLayout><OrderSuccess /></StoreLayout></ClientShell>;
}
