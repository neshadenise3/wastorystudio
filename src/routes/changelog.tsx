import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Construction } from "lucide-react";

export const Route = createFileRoute("/changelog")({
  component: () => (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Team" title="Master Change Log" description="Every meaningful change across the project." />
      <EmptyState
        icon={Construction}
        title="Scaffolded and ready to grow"
        description="This section is wired into the app. Add Lovable Cloud to enable persistence, sync, and collaboration."
      />
    </div>
  ),
  head: () => ({ meta: [{ title: "Master Change Log — Writer's Assistant" }] }),
});
