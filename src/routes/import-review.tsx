import { createFileRoute } from "@tanstack/react-router";
import { useCurrentProject, useStore } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSearch, Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/import-review")({
  component: ImportReview,
  head: () => ({ meta: [{ title: "Import Review — Writer's Assistant" }] }),
});

function ImportReview() {
  const project = useCurrentProject();
  const { inbox, updateInbox, addCharacter } = useStore();
  if (!project) return null;
  const pending = inbox.filter(i => i.projectId === project.id && !i.reviewed);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Inputs"
        title="Import Review"
        description="Review extracted material before promoting to canon. Nothing is added automatically."
      />

      {pending.length === 0 ? (
        <EmptyState icon={FileSearch} title="Nothing to review" description="All inbox items have been reviewed." />
      ) : (
        <div className="space-y-3">
          {pending.map(item => (
            <Card key={item.id} className="border-border/60 bg-card/60 backdrop-blur">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{item.title}</h3>
                    <Badge variant="outline" className="mt-1 text-[10px]">{item.type}</Badge>
                  </div>
                </div>
                <p className="line-clamp-3 rounded-xl border border-border/60 bg-background/40 p-3 text-sm">{item.content}</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => {
                    updateInbox(item.id, { reviewed: true });
                    toast.success("Marked reviewed");
                  }}><Check className="h-3.5 w-3.5" />Mark reviewed</Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    addCharacter({ projectId: project.id, name: item.title.slice(0, 40), role: "Extracted", description: item.content.slice(0, 200), tags: ["from-import"], status: "draft" });
                    toast.success("Created character draft");
                  }}>+ Character</Button>
                  <Button size="sm" variant="ghost" onClick={() => updateInbox(item.id, { reviewed: true })}><X className="h-3.5 w-3.5" />Skip</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
