import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCurrentProject, useStore } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/timeline")({
  component: TimelinePage,
  head: () => ({ meta: [{ title: "Timeline — Writer's Assistant" }] }),
});

function TimelinePage() {
  const project = useCurrentProject();
  const { timeline, addTimelineEvent, deleteTimelineEvent } = useStore();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ title: "", description: "", storyDate: "" });

  if (!project) return null;
  const events = timeline.filter(e => e.projectId === project.id).sort((a, b) => a.order - b.order);
  const undated = events.filter(e => !e.storyDate);
  const dated = events.filter(e => e.storyDate);

  const create = () => {
    if (!draft.title.trim()) { toast.error("Title required"); return; }
    addTimelineEvent({ projectId: project.id, title: draft.title, description: draft.description, storyDate: draft.storyDate, characters: [], status: "draft" });
    setDraft({ title: "", description: "", storyDate: "" });
    setOpen(false);
    toast.success("Event added");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Story"
        title="Timeline"
        description="Chronological story events. Undated events live in their own bucket."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gradient-primary rounded-xl text-primary-foreground shadow-glow"><Plus className="h-4 w-4" />Add event</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New timeline event</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title</Label><Input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} /></div>
                <div><Label>Story date</Label><Input value={draft.storyDate} onChange={e => setDraft({ ...draft, storyDate: e.target.value })} placeholder="Day 2 / Year 1023 / Chapter 5" /></div>
                <div><Label>Description</Label><Textarea value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={create} className="gradient-primary text-primary-foreground">Add</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="border-border/60 bg-card/60 backdrop-blur">
        <CardContent className="p-6">
          <ol className="relative space-y-5 border-l-2 border-border/60 pl-6">
            {dated.map(e => (
              <li key={e.id} className="relative">
                <span className="absolute -left-[31px] top-1 flex h-5 w-5 items-center justify-center rounded-full gradient-primary shadow-glow">
                  <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                </span>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">{e.storyDate}</p>
                    <h3 className="font-semibold">{e.title}</h3>
                    <p className="text-sm text-muted-foreground">{e.description}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-[10px]">{e.status}</Badge>
                      {e.characters.map(c => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deleteTimelineEvent(e.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {undated.length > 0 && (
        <Card className="border-border/60 bg-card/40">
          <CardContent className="p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Undated / Needs Placement</h3>
            <ul className="space-y-2">
              {undated.map(e => (
                <li key={e.id} className="rounded-xl border border-dashed border-border/60 p-3">
                  <p className="font-medium">{e.title}</p>
                  <p className="text-sm text-muted-foreground">{e.description}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
