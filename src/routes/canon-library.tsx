import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Construction } from "lucide-react";

export const Route = createFileRoute("/canon-library")({
  component: () => (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Story" title="Canon Library" description="Browse confirmed canon entries across categories." />
      <EmptyState
        icon={Construction}
        title="Scaffolded and ready to grow"
        description="This section is wired into the app. Add Lovable Cloud to enable persistence, sync, and collaboration."
      />
    </div>
  ),
  head: () => ({ meta: [{ title: "Canon Library — Writer's Assistant" }] }),
});
