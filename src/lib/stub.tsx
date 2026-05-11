import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Construction } from "lucide-react";

function makeStub(path: string, title: string, eyebrow: string, description: string) {
  return {
    Route: createFileRoute(path as any)({
      component: () => (
        <div className="mx-auto max-w-5xl">
          <PageHeader eyebrow={eyebrow} title={title} description={description} />
          <EmptyState
            icon={Construction}
            title="Coming next"
            description="This area is scaffolded and ready to grow. Add Lovable Cloud to enable persistence, auth, and collaboration."
          />
        </div>
      ),
      head: () => ({ meta: [{ title: `${title} — Writer's Assistant` }] }),
    }),
  };
}

export { makeStub };
