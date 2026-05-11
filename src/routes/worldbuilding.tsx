import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Construction } from "lucide-react";

export const Route = createFileRoute("/worldbuilding")({
  component: () => (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Story" title="Worldbuilding Guide" description="Build the rules of your world." />
      <EmptyState
        icon={Construction}
        title="Scaffolded and ready to grow"
        description="This section is wired into the app. Add Lovable Cloud to enable persistence, sync, and collaboration."
      />
    </div>
  ),
  head: () => ({ meta: [{ title: "Worldbuilding Guide — Writer's Assistant" }] }),
});
