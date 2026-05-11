import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Construction } from "lucide-react";

export const Route = createFileRoute("/magic")({
  component: () => (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Cast & Lore" title="Magic / Powers" description="Power systems, costs, and rules." />
      <EmptyState
        icon={Construction}
        title="Scaffolded and ready to grow"
        description="This section is wired into the app. Add Lovable Cloud to enable persistence, sync, and collaboration."
      />
    </div>
  ),
  head: () => ({ meta: [{ title: "Magic / Powers — Writer's Assistant" }] }),
});
