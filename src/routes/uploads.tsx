import { createFileRoute } from "@tanstack/react-router";
import { useCurrentProject, useStore } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, History, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/uploads")({
  component: UploadsPage,
  head: () => ({ meta: [{ title: "Upload History — Writer's Assistant" }] }),
});

function UploadsPage() {
  const project = useCurrentProject();
  const { inbox, reorderInbox } = useStore();
  if (!project) return null;
  const items = inbox.filter(i => i.projectId === project.id).sort((a, b) => a.storyOrder - b.storyOrder);

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    reorderInbox(project.id, next.map(n => n.id));
  };

  const reset = () => {
    reorderInbox(project.id, [...items].sort((a, b) => a.uploadOrder - b.uploadOrder).map(n => n.id));
    toast.success("Reset to original upload order");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Inputs"
        title="Upload History & Source Order"
        description="Reorder uploads to reflect actual story order. Original upload order is preserved."
        actions={<Button variant="outline" onClick={reset} className="rounded-xl"><RotateCcw className="h-4 w-4" />Reset to upload order</Button>}
      />

      {items.length === 0 ? (
        <EmptyState icon={History} title="No uploads yet" description="Add files via the Story Info Inbox." />
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <Card key={item.id} className="border-border/60 bg-card/60 backdrop-blur">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-primary text-sm font-bold text-primary-foreground shadow-glow">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.title}</p>
                  <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                    <span>Upload #{item.uploadOrder + 1}</span>
                    <span>·</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    <Badge variant="outline" className="text-[10px]">{item.type}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => move(idx, -1)} disabled={idx === 0}><ArrowUp className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => move(idx, 1)} disabled={idx === items.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
