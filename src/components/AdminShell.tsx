"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { WearitionSpinner } from "@/components/layout/WearitionSpinner";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push("/account");
    }
  }, [user, isAdmin, isLoading, router]);

  if (isLoading || !user || !isAdmin) {
    return <WearitionSpinner />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
