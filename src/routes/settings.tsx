import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Construction } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: () => (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="System" title="Settings" description="Preferences, theme, sync, and account." />
      <EmptyState
        icon={Construction}
        title="Scaffolded and ready to grow"
        description="This section is wired into the app. Add Lovable Cloud to enable persistence, sync, and collaboration."
      />
    </div>
  ),
  head: () => ({ meta: [{ title: "Settings — Writer's Assistant" }] }),
});
