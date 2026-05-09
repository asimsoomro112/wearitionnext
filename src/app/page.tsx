"use client";

import { ClientShell, StoreLayout } from "@/components/ClientShell";
import dynamic from "next/dynamic";

const Home = dynamic(() => import("@/views/Home").then(m => ({ default: m.Home })), { ssr: false });

export default function HomePage() {
  return (
    <ClientShell>
      <StoreLayout>
        <Home />
      </StoreLayout>
    </ClientShell>
  );
}
