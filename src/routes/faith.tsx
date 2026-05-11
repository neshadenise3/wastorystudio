import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Construction } from "lucide-react";

export const Route = createFileRoute("/faith")({
  component: () => (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Cast & Lore" title="Faith" description="Religions, beliefs, and rituals." />
      <EmptyState
        icon={Construction}
        title="Scaffolded and ready to grow"
        description="This section is wired into the app. Add Lovable Cloud to enable persistence, sync, and collaboration."
      />
    </div>
  ),
  head: () => ({ meta: [{ title: "Faith — Writer's Assistant" }] }),
});
