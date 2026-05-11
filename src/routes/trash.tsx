import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/trash")({
  component: TrashPage,
  head: () => ({ meta: [{ title: "Trash — Writer's Assistant" }] }),
});

function TrashPage() {
  const { trash, restoreFromTrash, emptyTrash } = useStore();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="System"
        title="Trash"
        description="Deleted items are kept here. Linked records are preserved."
        actions={trash.length > 0 && <Button variant="outline" onClick={() => { emptyTrash(); toast.success("Trash emptied"); }} className="rounded-xl"><Trash2 className="h-4 w-4" />Empty trash</Button>}
      />
      {trash.length === 0 ? (
        <EmptyState icon={Trash2} title="Trash is empty" />
      ) : (
        <div className="space-y-2">
          {trash.map(t => (
            <Card key={t.id} className="border-border/60 bg-card/60 backdrop-blur">
              <CardContent className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.name}</p>
                  <div className="flex gap-1.5 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">{t.type}</Badge>
                    <span>{new Date(t.deletedAt).toLocaleString()}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => { restoreFromTrash(t.id); toast.success("Restored"); }}>
                  <RotateCcw className="h-3.5 w-3.5" />Restore
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
