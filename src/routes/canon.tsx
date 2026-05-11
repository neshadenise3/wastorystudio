import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useCurrentProject, useStore } from "@/lib/store";
import {
  Users, MapPin, Flag, Heart, BookMarked, Sun, Wand2, Shield, Cog, Cpu,
  History, Boxes, MessageSquareQuote, Languages, Swords, HelpCircle,
  GitBranch, UserCircle2, BookOpen, Film, RefreshCw, AlertTriangle,
  Plus, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/canon")({
  component: CanonPage,
  head: () => ({ meta: [{ title: "Story Canon — Writer's Assistant" }] }),
});

const DEFAULT_CATEGORIES = [
  { name: "Characters", icon: Users, to: "/characters" },
  { name: "Locations", icon: MapPin, to: "/locations" },
  { name: "Factions", icon: Flag, to: "/factions" },
  { name: "Families", icon: Heart, to: "/families" },
  { name: "Heritage", icon: BookMarked, to: "/heritage" },
  { name: "Faith", icon: Sun, to: "/faith" },
  { name: "Magic / Power System", icon: Wand2, to: "/magic" },
  { name: "Cultural Rules", icon: Shield, to: "/canon" },
  { name: "Social Systems", icon: Cog, to: "/canon" },
  { name: "Technology", icon: Cpu, to: "/canon" },
  { name: "History", icon: History, to: "/canon" },
  { name: "Important Objects", icon: Boxes, to: "/canon" },
  { name: "Vocabulary / Terms", icon: MessageSquareQuote, to: "/glossary" },
  { name: "Glossary", icon: BookMarked, to: "/glossary" },
  { name: "Slang", icon: Languages, to: "/glossary" },
  { name: "Conflicts", icon: Swords, to: "/canon" },
  { name: "Open Questions", icon: HelpCircle, to: "/canon" },
  { name: "Plot Arcs", icon: GitBranch, to: "/canon" },
  { name: "Character Arcs", icon: UserCircle2, to: "/canon" },
  { name: "Chapters", icon: BookOpen, to: "/canon" },
  { name: "Scenes", icon: Film, to: "/canon" },
  { name: "Retcons", icon: RefreshCw, to: "/retcons" },
  { name: "Continuity Notes", icon: AlertTriangle, to: "/continuity" },
];

function CanonPage() {
  const project = useCurrentProject();
  const [extra, setExtra] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { characters, locations, glossary, factions } = useStore();

  if (!project) return null;
  const counts = (cat: string) => {
    const id = project.id;
    switch (cat) {
      case "Characters": return characters.filter(x => x.projectId === id).length;
      case "Locations": return locations.filter(x => x.projectId === id).length;
      case "Factions": return factions.filter(x => x.projectId === id).length;
      case "Glossary":
      case "Vocabulary / Terms": return glossary.filter(x => x.projectId === id).length;
      default: return 0;
    }
  };

  const create = () => {
    if (!name.trim()) { toast.error("Name required"); return; }
    setExtra([...extra, name]);
    setName(""); setOpen(false);
    toast.success(`Category "${name}" added`);
  };

  const all = [...DEFAULT_CATEGORIES, ...extra.map(n => ({ name: n, icon: BookMarked, to: "/canon" }))];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Story"
        title="Story Canon"
        description="Your story's source of truth — every category, every confirmed fact."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary rounded-xl text-primary-foreground shadow-glow">
                <Plus className="h-4 w-4" />Add category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New canon category</DialogTitle></DialogHeader>
              <Label>Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Prophecies" />
              <DialogFooter><Button onClick={create} className="gradient-primary text-primary-foreground">Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {all.map(cat => {
          const Icon = cat.icon;
          const c = counts(cat.name);
          return (
            <Card key={cat.name} className="group border-border/60 bg-card/60 backdrop-blur transition-all hover:shadow-glow">
              <CardContent className="p-4">
                <Link to={cat.to} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-glow">
                    <Icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold">{cat.name}</h3>
                      {c > 0 && <Badge variant="secondary" className="text-[10px]">{c}</Badge>}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
