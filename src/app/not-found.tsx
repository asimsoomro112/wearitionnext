import { NotFound } from "@/views/NotFound";
import { ClientShell, StoreLayout } from "@/components/ClientShell";

export default function NotFoundPage() {
  return (
    <ClientShell>
      <StoreLayout>
        <NotFound />
      </StoreLayout>
    </ClientShell>
  );
}
