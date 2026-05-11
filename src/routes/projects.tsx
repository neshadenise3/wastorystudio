import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { Plus, Pin, Archive, Trash2, FolderOpen, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
  head: () => ({ meta: [{ title: "Projects — Writer's Assistant" }] }),
});

function ProjectsPage() {
  const { projects, addProject, updateProject, deleteProject, setCurrentProject } = useStore();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ title: "", summary: "", tone: "", setting: "", genre: "" });

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const create = () => {
    if (!draft.title.trim()) { toast.error("Title required"); return; }
    addProject(draft);
    setDraft({ title: "", summary: "", tone: "", setting: "", genre: "" });
    setOpen(false);
    toast.success("Project created");
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Workspace"
        title="Projects"
        description="Switch between worlds, pin favorites, and start new stories."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary rounded-xl text-primary-foreground shadow-glow">
                <Plus className="h-4 w-4" /> New project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create project</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title</Label><Input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} /></div>
                <div><Label>Genre</Label><Input value={draft.genre} onChange={e => setDraft({ ...draft, genre: e.target.value })} placeholder="Fantasy, sci-fi…" /></div>
                <div><Label>Story summary</Label><Textarea value={draft.summary} onChange={e => setDraft({ ...draft, summary: e.target.value })} /></div>
                <div><Label>Tone</Label><Input value={draft.tone} onChange={e => setDraft({ ...draft, tone: e.target.value })} /></div>
                <div><Label>Setting</Label><Input value={draft.setting} onChange={e => setDraft({ ...draft, setting: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={create} className="gradient-primary text-primary-foreground">Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(p => (
          <Card key={p.id} className="group overflow-hidden border-border/60 bg-card/60 backdrop-blur transition-all hover:shadow-glow">
            <div className="h-24 gradient-primary" />
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{p.title}</h3>
                  <p className="text-xs text-muted-foreground">{p.genre || "Unspecified genre"}</p>
                </div>
                {p.pinned && <Pin className="h-4 w-4 text-primary" />}
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">{p.summary || "No summary yet."}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.collaborators.slice(0, 3).map(c => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <Button size="sm" variant="default" className="gradient-primary text-primary-foreground" onClick={() => { setCurrentProject(p.id); toast.success(`Opened ${p.title}`); }}>
                  <FolderOpen className="h-3.5 w-3.5" /> Open
                </Button>
                <Button size="sm" variant="ghost" onClick={() => updateProject(p.id, { pinned: !p.pinned })}>
                  <Pin className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => updateProject(p.id, { archived: !p.archived })}>
                  <Archive className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { deleteProject(p.id); toast.success("Moved to trash"); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
