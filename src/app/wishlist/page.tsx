"use client";
import { ClientShell, StoreLayout } from "@/components/ClientShell";
import dynamic from "next/dynamic";
const Wishlist = dynamic(() => import("@/views/Wishlist").then(m => ({ default: m.Wishlist })), { ssr: false });
export default function WishlistPage() {
  return <ClientShell><StoreLayout><Wishlist /></StoreLayout></ClientShell>;
}
