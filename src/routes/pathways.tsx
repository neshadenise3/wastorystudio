import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useCurrentProject, useStore, type PathwayCard } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  GitBranch, Sparkles, Check, X, Pin, PinOff, Wand2, Target, ArrowRight,
  HelpCircle, AlertTriangle, ShieldAlert, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pathways")({
  component: PathwaysPage,
  head: () => ({ meta: [{ title: "Story Pathways — Writer's Assistant" }] }),
});

const TONES = ["Surprise me", "Hopeful", "Foreboding", "Whimsical", "Tense", "Bittersweet", "Triumphant", "Mysterious", "Sensual", "Brutal", "Dread", "Depraved"];

type SceneType = {
  value: string;
  label: string;
  mature?: boolean;
  hooks: string[];
  beats?: string[];
};

const SCENE_TYPES: SceneType[] = [
  { value: "any", label: "Any scene", hooks: [] },
  { value: "action", label: "Action / chase", hooks: [
    "A pursuit splinters the group across the map",
    "A planned ambush goes catastrophically sideways",
    "A weapon fails at the worst possible moment",
  ]},
  { value: "dialogue", label: "Dialogue / confrontation", hooks: [
    "A long-rehearsed accusation finally lands",
    "Two allies say the unsayable in one room",
    "A silence stretches longer than the words that follow",
  ]},
  { value: "mystery", label: "Mystery / reveal", hooks: [
    "A clue contradicts the official story",
    "An old letter rewrites a known timeline",
    "The witness everyone trusted was never there",
  ]},
  { value: "emotional", label: "Emotional / quiet", hooks: [
    "A small kindness undoes a long-held grudge",
    "An apology arrives years too late",
    "A character cries for the first time on the page",
  ]},
  { value: "worldbuilding", label: "Worldbuilding / lore", hooks: [
    "A forgotten ritual is performed correctly by accident",
    "A map proves the world is shaped wrong",
    "An object's true name changes who can wield it",
  ]},
  // Mature scene types — only available when familyFriendly is OFF
  { value: "romance", label: "Romance / intimate", mature: true, hooks: [
    "A first kiss arrives in the worst possible setting",
    "Restraint snaps after months of charged proximity",
    "A confession is whispered through a closed door",
  ]},
  { value: "erotic", label: "Erotic (explicit)", mature: true, hooks: [
    "Two characters cross a line they swore they wouldn't",
    "A power dynamic shifts mid-encounter — consent is renegotiated on the page",
    "A clandestine night reframes every conversation that follows",
    "Desire wins over duty, and the cost is named out loud",
  ], beats: [
    "Tension builds through proximity and restraint",
    "A choice is made — explicit, consensual, with stakes",
    "Aftermath: vulnerability, complication, or unwelcome witness",
  ]},
  { value: "crime", label: "Crime / heist", mature: true, hooks: [
    "A clean job leaves one body that wasn't on the plan",
    "An informant flips during the meet",
    "A trail of laundered money leads back to a friend",
    "A heist crew discovers the mark already knew they were coming",
  ], beats: [
    "Plan briefed, contingencies named",
    "Execution — one variable goes wrong",
    "Cover-up or fallout reshapes loyalties",
  ]},
  { value: "drugs", label: "Drugs / addiction", mature: true, hooks: [
    "A relapse is hidden from the person who would forgive it",
    "A first hit changes how a character sees the protagonist",
    "A dealer calls in a debt at the worst hour",
    "Withdrawal cracks open a memory the character had buried",
  ], beats: [
    "The substance is offered, accepted, or refused",
    "Behavior shifts — others begin to notice",
    "A consequence lands: physical, social, or legal",
  ]},
  { value: "horror", label: "Horror / dread", mature: true, hooks: [
    "Something in the room is breathing that shouldn't be",
    "A familiar voice repeats a phrase it could not know",
    "The doors lock from the outside, one by one",
    "A child draws something they have never seen",
  ], beats: [
    "Wrongness is sensed before it's seen",
    "The threat reveals itself — partially",
    "Escape costs something that cannot be returned",
  ]},
  { value: "gore", label: "Gore / body horror", mature: true, hooks: [
    "An injury reveals the body was never quite human",
    "A wound refuses to close, and starts to speak",
    "Flesh remembers what the mind tried to forget",
    "A surgery is performed without anesthetic — and works",
  ], beats: [
    "The body fails in a specific, visceral way",
    "Witnesses react — denial, action, or worse",
    "What remains is no longer what it was",
  ]},
  { value: "violence", label: "Graphic violence", mature: true, hooks: [
    "A retaliation goes three steps further than the insult",
    "A duel ends in a way neither side survives intact",
    "A protector becomes the thing the protected feared",
  ]},
];

const QUESTIONS = [
  "Whose loyalty is being tested?",
  "What rule of the world is about to break?",
  "What does the protagonist gain — and at what cost?",
  "Which secret can no longer stay buried?",
  "Who else benefits if this goes badly?",
  "What line, once crossed, can't be uncrossed?",
];
const RISKS = [
  "Conflicts with established tone",
  "Requires retconning an earlier scene",
  "Pacing — may stall the next chapter",
  "Shifts a character's voice",
  "Introduces a power not yet established",
  "May need a content warning at chapter open",
];
const FAMILY_TONES = new Set(["Surprise me", "Hopeful", "Foreboding", "Whimsical", "Tense", "Bittersweet", "Triumphant", "Mysterious"]);

function pick<T>(arr: T[], n = 1, exclude: T[] = []): T[] {
  const pool = arr.filter(x => !exclude.includes(x));
  const out: T[] = [];
  while (out.length < n && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}

function PathwaysPage() {
  const project = useCurrentProject();
  const {
    pathways, addPathway, updatePathway, deletePathway,
    characters, locations, timeline, inbox, addTimelineEvent,
  } = useStore();

  const [source, setSource] = useState("latest");
  const [tone, setTone] = useState("Surprise me");
  const [mode, setMode] = useState<"brainstorm" | "steer" | "endgoal">("brainstorm");
  const [steer, setSteer] = useState("");

  if (!project) return null;

  const cards = useMemo(
    () => pathways.filter(p => p.projectId === project.id).sort((a, b) => b.createdAt - a.createdAt),
    [pathways, project.id]
  );
  const pinned = cards.filter(c => c.status === "saved" || c.status === "confirmed");
  const fresh = cards.filter(c => c.status === "suggested" || c.status === "edited");

  const chars = characters.filter(c => c.projectId === project.id).map(c => c.name);
  const locs = locations.filter(l => l.projectId === project.id).map(l => l.name);
  const projectInbox = inbox.filter(i => i.projectId === project.id);
  const projectTimeline = timeline.filter(t => t.projectId === project.id);

  const sourceOptions = [
    { value: "latest", label: "From latest upload" },
    { value: "all", label: "From all canon" },
    ...projectInbox.slice(-5).reverse().map(i => ({
      value: `inbox:${i.id}`,
      label: `From: ${i.title.slice(0, 28)}${i.title.length > 28 ? "…" : ""}`,
    })),
  ];

  const lastEvent = projectTimeline[projectTimeline.length - 1]?.title ?? "your last canon event";
  const sourceLabel = sourceOptions.find(s => s.value === source)?.label ?? "your story";

  const generate = () => {
    const used: string[] = [];
    for (let i = 0; i < 4; i++) {
      const hook = pick(HOOKS, 1, used as string[])[0] ?? HOOKS[i % HOOKS.length];
      used.push(hook);
      const cardTone = tone === "Surprise me"
        ? TONES.filter(t => t !== "Surprise me")[Math.floor(Math.random() * (TONES.length - 1))]
        : tone;
      const c1 = chars[Math.floor(Math.random() * Math.max(1, chars.length))] ?? "the protagonist";
      const c2 = pick(chars.filter(c => c !== c1), 1)[0] ?? "an ally";
      const loc = locs[Math.floor(Math.random() * Math.max(1, locs.length))] ?? "an unfamiliar place";

      let title: string;
      let pitch: string;
      if (mode === "endgoal" && steer.trim()) {
        title = `Path toward: ${steer.trim().slice(0, 40)}`;
        pitch = `Working backward from "${steer.trim()}", ${c1} takes a ${cardTone.toLowerCase()} step that makes that ending more inevitable.`;
      } else if (mode === "steer" && steer.trim()) {
        title = `${cardTone} steer at ${loc}`;
        pitch = `Steered by "${steer.trim()}". ${c1} encounters ${c2} in ${loc} — based on ${sourceLabel.toLowerCase()}.`;
      } else {
        title = `${cardTone} turn at ${loc}`;
        pitch = `Following ${lastEvent}, ${c1} encounters ${c2} in ${loc}.`;
      }

      const beats = [
        `${c1} confronts ${c2}`,
        `Hidden detail surfaces about ${loc}`,
        `A choice changes the next chapter`,
      ];
      const questions = pick(QUESTIONS, 2);
      const risks = pick(RISKS, 1);

      addPathway({
        projectId: project.id,
        title,
        hook,
        pitch,
        summary: [
          `${hook}.`,
          ...questions.map(q => `Open question — ${q}`),
          ...risks.map(r => `Continuity risk — ${r}`),
        ].join(" "),
        nextEvents: beats,
        tone: cardTone,
        characters: [c1, c2].filter(Boolean) as string[],
        locations: [loc],
        sourceUploads: source.startsWith("inbox:") ? [source.slice(6)] : [],
        confidence: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as PathwayCard["confidence"],
        status: "suggested",
      });
    }
    toast.success("4 directions generated");
  };

  const continueFrom = (card: PathwayCard) => {
    const c = card.characters[0] ?? "the protagonist";
    const l = card.locations[0] ?? "the next scene";
    addPathway({
      projectId: project.id,
      title: `Continued: ${card.title}`,
      hook: `Following "${card.title}"…`,
      pitch: `${c} pushes deeper after the events at ${l}.`,
      summary: `Branched from a saved pathway. New beats explore the consequences.`,
      nextEvents: [
        `Aftermath of ${card.nextEvents[0] ?? "the previous beat"}`,
        `New stakes emerge for ${c}`,
        `A second pathway opens`,
      ],
      tone: card.tone,
      characters: card.characters,
      locations: card.locations,
      sourceUploads: card.sourceUploads,
      confidence: "medium",
      status: "suggested",
    });
    toast.success("Continued — 1 new pathway added below");
  };

  const saveAsDraft = (card: PathwayCard) => {
    addTimelineEvent({
      projectId: project.id,
      title: card.title,
      description: card.pitch,
      storyDate: "Draft — from Pathways",
      characters: card.characters,
      location: card.locations[0],
      status: "draft",
    });
    updatePathway(card.id, { status: "confirmed" });
    toast.success("Saved as draft event in Timeline");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow={project.title}
        title="Story Pathways"
        description="Brainstorm branches, pin favorites, compare directions, and continue saved pathways further."
      />

      <Card className="border-border/60 bg-card/60 backdrop-blur">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI Pathways
            </p>
            <h2 className="text-xl font-bold sm:text-2xl">
              <span className="text-gradient">Where could the story go next?</span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Brainstorm branching directions. Compare side-by-side, pin favorites, or save beats as draft events.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="h-10 w-auto min-w-[180px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="h-10 w-auto min-w-[150px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={mode === "steer" ? "default" : "outline"}
              className={mode === "steer" ? "gradient-primary text-primary-foreground rounded-xl" : "rounded-xl"}
              onClick={() => setMode(mode === "steer" ? "brainstorm" : "steer")}
            >
              <Wand2 className="h-4 w-4" /> Steer
            </Button>
            <Button
              variant={mode === "endgoal" ? "default" : "outline"}
              className={mode === "endgoal" ? "gradient-primary text-primary-foreground rounded-xl" : "rounded-xl"}
              onClick={() => setMode(mode === "endgoal" ? "brainstorm" : "endgoal")}
            >
              <Target className="h-4 w-4" /> End goal
            </Button>
            <Button onClick={generate} className="gradient-primary rounded-xl text-primary-foreground shadow-glow">
              <Sparkles className="h-4 w-4" /> Brainstorm
            </Button>
          </div>

          {(mode === "steer" || mode === "endgoal") && (
            <input
              type="text"
              value={steer}
              onChange={e => setSteer(e.target.value)}
              placeholder={mode === "endgoal" ? "Where should the story end? (e.g. Alice wakes back home)" : "What direction should the story take?"}
              className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          )}

          <p className="text-xs text-muted-foreground">
            Hit <strong className="text-foreground">Brainstorm</strong> to get 4 distinct directions, each with next beats, open questions, and continuity risks. Pin favorites and continue them later.
          </p>
        </CardContent>
      </Card>

      {pinned.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Pin className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Pinned pathways</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pinned.map(card => (
              <PathwayCardView
                key={card.id} card={card}
                onContinue={() => continueFrom(card)}
                onSaveDraft={() => saveAsDraft(card)}
                onUnpin={() => updatePathway(card.id, { status: "suggested" })}
                onReject={() => deletePathway(card.id)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Latest brainstorm</h3>
        {fresh.length === 0 ? (
          <EmptyState
            icon={GitBranch}
            title="No pathways yet"
            description='Click "Brainstorm" above to generate 4 distinct story directions.'
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {fresh.map(card => (
              <PathwayCardView
                key={card.id} card={card}
                onPin={() => updatePathway(card.id, { status: "saved" })}
                onSaveDraft={() => saveAsDraft(card)}
                onContinue={() => continueFrom(card)}
                onReject={() => deletePathway(card.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PathwayCardView({
  card, onPin, onUnpin, onSaveDraft, onContinue, onReject,
}: {
  card: PathwayCard;
  onPin?: () => void;
  onUnpin?: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
  onReject: () => void;
}) {
  const isPinned = card.status === "saved" || card.status === "confirmed";
  const summaryParts = card.summary.split(" Open question — ");
  const opener = summaryParts[0];
  const restAfterOpener = summaryParts.slice(1).join(" Open question — ");
  const [questionsBlock, ...riskParts] = restAfterOpener.split(" Continuity risk — ");
  const questions = questionsBlock ? questionsBlock.split(" Open question — ").map(q => q.trim()).filter(Boolean) : [];
  const risks = riskParts.map(r => r.trim()).filter(Boolean);

  return (
    <Card className="group relative overflow-hidden border-border/60 bg-card/60 backdrop-blur transition-all hover:shadow-glow">
      <div className="h-1 gradient-primary" />
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Badge variant="secondary" className="mb-2 text-[10px]">{card.tone}</Badge>
            <h3 className="font-semibold leading-tight">{card.title}</h3>
          </div>
          <Badge variant="outline" className="shrink-0 text-[10px] capitalize">{card.confidence}</Badge>
        </div>
        <p className="text-sm font-medium text-primary">{card.hook}</p>
        <p className="text-sm text-muted-foreground">{card.pitch}</p>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Next beats</p>
          <ul className="mt-1 space-y-0.5 text-sm">
            {card.nextEvents.map((n, i) => <li key={i} className="text-muted-foreground">• {n}</li>)}
          </ul>
        </div>

        {questions.length > 0 && (
          <div>
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <HelpCircle className="h-3 w-3" /> Open questions
            </p>
            <ul className="mt-1 space-y-0.5 text-sm">
              {questions.map((q, i) => <li key={i} className="text-muted-foreground">• {q}</li>)}
            </ul>
          </div>
        )}

        {risks.length > 0 && (
          <div>
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-amber-500">
              <AlertTriangle className="h-3 w-3" /> Continuity risks
            </p>
            <ul className="mt-1 space-y-0.5 text-sm">
              {risks.map((r, i) => <li key={i} className="text-muted-foreground">• {r}</li>)}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {card.characters.map(c => <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>)}
        </div>

        <div className="flex flex-wrap gap-1.5 pt-2">
          {isPinned ? (
            <Button size="sm" variant="outline" onClick={onUnpin}>
              <PinOff className="h-3.5 w-3.5" />Unpin
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={onPin}>
              <Pin className="h-3.5 w-3.5" />Pin
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onContinue}>
            <ArrowRight className="h-3.5 w-3.5" />Continue
          </Button>
          <Button size="sm" className="gradient-primary text-primary-foreground" onClick={onSaveDraft}>
            <Check className="h-3.5 w-3.5" />Save as draft
          </Button>
          <Button size="sm" variant="ghost" onClick={onReject}>
            <X className="h-3.5 w-3.5" />Reject
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground/60">{opener}</p>
      </CardContent>
    </Card>
  );
}
