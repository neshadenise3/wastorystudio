import { createFileRoute, Link } from "@tanstack/react-router";
import { useCurrentProject, useStore } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Inbox, Upload, Clock, Users, Plus, Sparkles, Download } from "lucide-react";

export const Route = createFileRoute("/hub")({
  component: HubPage,
  head: () => ({ meta: [{ title: "Story Hub — Writer's Assistant" }] }),
});

function HubPage() {
  const project = useCurrentProject();
  const { updateProject, timeline, characters, glossary, inbox, changeLog } = useStore();
  const [edit, setEdit] = useState({ summary: "", tone: "", setting: "" });
  const [dyn, setDyn] = useState({ summary: true, tone: true, setting: false });

  useEffect(() => {
    if (project) setEdit({ summary: project.summary, tone: project.tone, setting: project.setting });
  }, [project?.id]);

  if (!project) return <div className="py-20 text-center text-muted-foreground">No project selected.</div>;
  const inProj = <T extends { projectId: string }>(arr: T[]) => arr.filter(x => x.projectId === project.id);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Story Hub"
        title={project.title}
        description="The heart of your writers room — summary, tone, and live story state."
        actions={
          <>
            <Button variant="outline" asChild className="rounded-xl"><Link to="/inbox"><Plus className="h-4 w-4" />Add info</Link></Button>
            <Button asChild className="gradient-primary rounded-xl text-primary-foreground shadow-glow"><Link to="/pathways"><Sparkles className="h-4 w-4" />Pathways</Link></Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60 bg-card/60 backdrop-blur">
          <CardHeader><CardTitle>Story summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Dynamic story summary</span>
              <Switch checked={dyn.summary} onCheckedChange={v => setDyn({ ...dyn, summary: v })} />
            </div>
            <Textarea rows={4} value={edit.summary} onChange={e => setEdit({ ...edit, summary: e.target.value })} />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Dynamic tone notes</span>
              <Switch checked={dyn.tone} onCheckedChange={v => setDyn({ ...dyn, tone: v })} />
            </div>
            <Input value={edit.tone} onChange={e => setEdit({ ...edit, tone: e.target.value })} />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Dynamic setting summary</span>
              <Switch checked={dyn.setting} onCheckedChange={v => setDyn({ ...dyn, setting: v })} />
            </div>
            <Input value={edit.setting} onChange={e => setEdit({ ...edit, setting: e.target.value })} />
            <Button onClick={() => updateProject(project.id, edit)} className="gradient-primary text-primary-foreground">Save</Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Quick actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" asChild className="h-auto justify-start rounded-xl py-3"><Link to="/inbox"><Inbox className="h-4 w-4" />Add info</Link></Button>
            <Button variant="outline" asChild className="h-auto justify-start rounded-xl py-3"><Link to="/uploads"><Upload className="h-4 w-4" />Upload</Link></Button>
            <Button variant="outline" asChild className="h-auto justify-start rounded-xl py-3"><Link to="/timeline"><Clock className="h-4 w-4" />Timeline</Link></Button>
            <Button variant="outline" asChild className="h-auto justify-start rounded-xl py-3"><Link to="/characters"><Users className="h-4 w-4" />Characters</Link></Button>
            <Button variant="outline" asChild className="h-auto justify-start rounded-xl py-3"><Link to="/canon"><Plus className="h-4 w-4" />Canon</Link></Button>
            <Button variant="outline" asChild className="h-auto justify-start rounded-xl py-3"><Link to="/exports"><Download className="h-4 w-4" />Export</Link></Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          { title: "Timeline", count: inProj(timeline).length, items: inProj(timeline).slice(0, 4).map(t => t.title), to: "/timeline" },
          { title: "Characters", count: inProj(characters).length, items: inProj(characters).slice(0, 4).map(t => t.name), to: "/characters" },
          { title: "Glossary", count: inProj(glossary).length, items: inProj(glossary).slice(0, 4).map(t => t.term), to: "/glossary" },
        ].map(s => (
          <Card key={s.title} className="border-border/60 bg-card/60 backdrop-blur">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">{s.title}</CardTitle>
              <Badge variant="secondary">{s.count}</Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 text-sm">
                {s.items.map(i => <li key={i} className="truncate text-muted-foreground">• {i}</li>)}
              </ul>
              <Button variant="ghost" size="sm" asChild className="mt-3 px-0 text-primary"><Link to={s.to}>Open →</Link></Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60 bg-card/60 backdrop-blur">
        <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {inProj(changeLog).slice(0, 8).map(c => (
              <li key={c.id} className="flex items-center justify-between gap-3 border-b border-border/40 pb-2 last:border-0">
                <span><span className="font-medium">{c.user}</span> {c.action} {c.itemType} <span className="text-muted-foreground">{c.itemName}</span></span>
                <span className="text-xs text-muted-foreground">{new Date(c.timestamp).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
