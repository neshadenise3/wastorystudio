import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCurrentProject, useStore } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Sparkles, Check, X, Bookmark, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";

export const Route = createFileRoute("/pathways")({
  component: PathwaysPage,
  head: () => ({ meta: [{ title: "Pathways — Writer's Assistant" }] }),
});

const TONES = ["Hopeful", "Foreboding", "Whimsical", "Tense", "Bittersweet", "Triumphant", "Mysterious"];
const HOOKS = [
  "A familiar face returns with impossible knowledge",
  "An ally reveals a hidden allegiance",
  "The protagonist must choose between two beloved bonds",
  "A long-buried truth reshapes the rules",
  "A new realm opens beneath the old one",
  "An enemy offers an unexpected alliance",
  "The smallest object holds the greatest power",
];

function PathwaysPage() {
  const project = useCurrentProject();
  const { pathways, addPathway, updatePathway, deletePathway, characters, locations, timeline } = useStore();
  const [seed, setSeed] = useState(0);

  if (!project) return null;
  const cards = pathways.filter(p => p.projectId === project.id);
  const chars = characters.filter(c => c.projectId === project.id).map(c => c.name);
  const locs = locations.filter(l => l.projectId === project.id).map(l => l.name);
  const lastEvent = timeline.filter(t => t.projectId === project.id).slice(-1)[0]?.title ?? "your last canon event";

  const generate = () => {
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const hook = HOOKS[Math.floor(Math.random() * HOOKS.length)];
      const tone = TONES[Math.floor(Math.random() * TONES.length)];
      const c1 = chars[Math.floor(Math.random() * Math.max(1, chars.length))] ?? "the protagonist";
      const c2 = chars[Math.floor(Math.random() * Math.max(1, chars.length))] ?? "an ally";
      const loc = locs[Math.floor(Math.random() * Math.max(1, locs.length))] ?? "an unfamiliar place";
      addPathway({
        projectId: project.id,
        title: `${tone} turn at ${loc}`,
        hook,
        pitch: `Following ${lastEvent}, ${c1} encounters ${c2} in ${loc}.`,
        summary: `${hook}. The scene unfolds with a ${tone.toLowerCase()} undercurrent, revealing new stakes for ${c1}.`,
        nextEvents: [
          `${c1} confronts ${c2}`,
          `Hidden detail surfaces about ${loc}`,
          `A choice changes the next chapter`,
        ],
        tone,
        characters: [c1, c2].filter(Boolean),
        locations: [loc],
        sourceUploads: [],
        confidence: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as any,
        status: "suggested",
      });
    }
    setSeed(s => s + 1);
    toast.success(`${count} pathways generated`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Planning"
        title="Pathways"
        description="The AI story-direction engine. Shuffling possibility cards — nothing becomes canon until you say so."
        actions={
          <>
            <Button variant="outline" onClick={() => { cards.filter(c => c.status === "suggested").forEach(c => deletePathway(c.id)); toast.success("Cleared suggestions"); }} className="rounded-xl">
              <X className="h-4 w-4" />Reject all
            </Button>
            <Button onClick={generate} className="gradient-primary rounded-xl text-primary-foreground shadow-glow">
              <Shuffle className="h-4 w-4" />Shuffle pathways
            </Button>
          </>
        }
      />

      {cards.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="No pathways yet"
          description="Generate possible story directions from your canon, characters, and timeline."
          action={<Button onClick={generate} className="gradient-primary text-primary-foreground"><Sparkles className="h-4 w-4" />Generate pathways</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" key={seed}>
          {cards.map(card => (
            <Card key={card.id} className="group relative overflow-hidden border-border/60 bg-card/60 backdrop-blur transition-all hover:shadow-glow">
              <div className="h-1 gradient-primary" />
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Badge variant="secondary" className="mb-2 text-[10px]">{card.tone}</Badge>
                    <h3 className="font-semibold leading-tight">{card.title}</h3>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px] capitalize">{card.status}</Badge>
                </div>
                <p className="text-sm font-medium text-primary">{card.hook}</p>
                <p className="text-sm text-muted-foreground">{card.pitch}</p>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Suggested next</p>
                  <ul className="mt-1 space-y-0.5 text-sm">
                    {card.nextEvents.map((n, i) => <li key={i} className="text-muted-foreground">• {n}</li>)}
                  </ul>
                </div>
                <div className="flex flex-wrap gap-1">
                  {card.characters.map(c => <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>)}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => { updatePathway(card.id, { status: "confirmed" }); toast.success("Confirmed as canon"); }}>
                    <Check className="h-3.5 w-3.5" />Confirm
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updatePathway(card.id, { status: "saved" })}>
                    <Bookmark className="h-3.5 w-3.5" />Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deletePathway(card.id)}>
                    <X className="h-3.5 w-3.5" />Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
