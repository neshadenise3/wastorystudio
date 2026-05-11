import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, useCurrentProject } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import {
  BookOpen, Clock, Users, Inbox, GitBranch, Sparkles,
  ArrowRight, FolderOpen, ListChecks, Plus,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard — Writer's Assistant" },
      { name: "description", content: "Your story studio at a glance: projects, recent canon, timeline, and pathways." },
    ],
  }),
});

function Stat({ icon: Icon, label, value, accent }: any) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card/60 backdrop-blur transition-all hover:shadow-glow">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent ?? "gradient-primary"} shadow-glow`}>
          <Icon className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const project = useCurrentProject();
  const { characters, locations, timeline, glossary, inbox, pathways, changeLog, projects } = useStore();

  if (!project) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <h1 className="text-3xl font-bold text-gradient">Welcome to Writer's Assistant</h1>
        <p className="mt-3 text-muted-foreground">Create your first project to begin organizing your canon.</p>
        <Button asChild className="mt-6 gradient-primary text-primary-foreground shadow-glow">
          <Link to="/projects"><Plus className="h-4 w-4" /> Create project</Link>
        </Button>
      </div>
    );
  }

  const inProj = <T extends { projectId: string }>(arr: T[]) => arr.filter(x => x.projectId === project.id);
  const recent = changeLog.slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Story Studio"
        title={`Welcome back to ${project.title}`}
        description={project.summary}
        actions={
          <>
            <Button variant="outline" asChild className="rounded-xl">
              <Link to="/inbox"><Inbox className="h-4 w-4" /> Add Story Info</Link>
            </Button>
            <Button asChild className="gradient-primary rounded-xl text-primary-foreground shadow-glow">
              <Link to="/pathways"><Sparkles className="h-4 w-4" /> Generate Pathways</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat icon={FolderOpen} label="Projects" value={projects.length} />
        <Stat icon={Users} label="Characters" value={inProj(characters).length} accent="gradient-accent" />
        <Stat icon={Clock} label="Events" value={inProj(timeline).length} />
        <Stat icon={BookOpen} label="Glossary" value={inProj(glossary).length} accent="gradient-accent" />
        <Stat icon={Inbox} label="Inbox" value={inProj(inbox).length} />
        <Stat icon={GitBranch} label="Pathways" value={inProj(pathways).length} accent="gradient-accent" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Story Hub</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/hub">Open <ArrowRight className="h-3 w-3" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Tone</p>
              <p>{project.tone}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Setting</p>
              <p>{project.setting}</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="secondary">{project.genre}</Badge>
              {project.collaborators.map(c => <Badge key={c} variant="outline">{c}</Badge>)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><ListChecks className="h-4 w-4" /> Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {recent.length === 0 && <li className="text-muted-foreground">No activity yet.</li>}
              {recent.map(c => (
                <li key={c.id} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="truncate"><span className="font-medium">{c.user}</span> {c.action} <span className="text-muted-foreground">{c.itemType}</span> {c.itemName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(c.timestamp).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4" /> Timeline preview</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/timeline">Open <ArrowRight className="h-3 w-3" /></Link></Button>
          </CardHeader>
          <CardContent>
            <ol className="relative ml-3 space-y-3 border-l border-border/60 pl-5 text-sm">
              {inProj(timeline).slice(0, 5).map(e => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full gradient-primary shadow-glow" />
                  <p className="font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.storyDate}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> Recent characters</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/characters">Open <ArrowRight className="h-3 w-3" /></Link></Button>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {inProj(characters).slice(0, 6).map(c => (
                <li key={c.id} className="rounded-xl border border-border/60 bg-background/40 p-3">
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.role}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
