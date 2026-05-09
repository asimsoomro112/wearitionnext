"use client";
import { ClientShell, StoreLayout } from "@/components/ClientShell";
import dynamic from "next/dynamic";
const OrderTracking = dynamic(() => import("@/views/OrderTracking").then(m => ({ default: m.OrderTracking })), { ssr: false });
export default function TrackOrderPage() {
  return <ClientShell><StoreLayout><OrderTracking /></StoreLayout></ClientShell>;
}
