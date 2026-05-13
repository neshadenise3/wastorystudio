import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useCurrentProject, useStore } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { FileSearch, Check, X, Edit3, Repeat, ListChecks } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/import-review")({
  component: ImportReview,
  head: () => ({ meta: [{ title: "Import Review — Writer's Assistant" }] }),
});

type BuiltInCat =
  | "character" | "location" | "faction" | "glossary" | "timeline" | "worldbuilding"
  | "family" | "heritage" | "faith" | "magic";

const BUILTIN: BuiltInCat[] = [
  "character", "location", "faction", "glossary", "timeline",
  "family", "heritage", "faith", "magic", "worldbuilding",
];

interface Suggestion {
  id: string;            // stable: inboxId + name
  inboxId: string;
  inboxTitle: string;
  name: string;
  category: string;      // BuiltInCat | custom slug
  confidence: number;    // 0-100
  reason: string;
  excerpt: string;
}

const STOP = new Set([
  "Chapter","Scene","Prologue","Epilogue","Part","The","A","An","And","But","Or","If",
  "When","While","Then","Because","So","Yet","She","He","They","It","We","You","I",
  "Mr","Mrs","Ms","Dr","Lord","Lady","Sir","Madam","Once","Upon","Time","Day","Night",
  "Today","Tomorrow","Yesterday","Here","There","Now","Later",
]);

function extractSuggestions(inboxId: string, inboxTitle: string, content: string): Suggestion[] {
  const out = new Map<string, Suggestion>();
  const text = content.slice(0, 8000); // cap

  // 1. Multi-word capitalized → likely character / proper place
  const multi = text.matchAll(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b/g);
  for (const m of multi) {
    const name = m[1];
    const first = name.split(" ")[0];
    if (STOP.has(first)) continue;
    const key = name.toLowerCase();
    if (out.has(key)) continue;
    const idx = m.index ?? 0;
    const excerpt = text.slice(Math.max(0, idx - 40), Math.min(text.length, idx + 120)).trim();
    // Place hint: "in <Name>", "to <Name>", "from <Name>"
    const before = text.slice(Math.max(0, idx - 8), idx).toLowerCase();
    const isPlace = /\b(in|to|from|at|across|through|near)\s+$/.test(before);
    out.set(key, {
      id: `${inboxId}::${key}`,
      inboxId, inboxTitle,
      name,
      category: isPlace ? "location" : "character",
      confidence: 70,
      reason: "Multi-word proper name",
      excerpt,
    });
  }

  // 2. Single capitalized words after location prepositions → location
  const locs = text.matchAll(/\b(?:in|to|from|at|across|through|near)\s+([A-Z][a-z]{2,})\b/g);
  for (const m of locs) {
    const name = m[1];
    if (STOP.has(name)) continue;
    const key = name.toLowerCase();
    if (out.has(key)) {
      const existing = out.get(key)!;
      if (existing.category === "character") existing.category = "location";
      continue;
    }
    const idx = m.index ?? 0;
    const excerpt = text.slice(Math.max(0, idx - 30), Math.min(text.length, idx + 120)).trim();
    out.set(key, {
      id: `${inboxId}::${key}`,
      inboxId, inboxTitle,
      name,
      category: "location",
      confidence: 60,
      reason: "Follows location preposition",
      excerpt,
    });
  }

  // 3. Single capitalized standalone → worldbuilding (lower confidence)
  const single = text.matchAll(/(?:^|[\.\!\?]\s+)([A-Z][a-z]{3,})\b/g);
  for (const m of single) {
    const name = m[1];
    if (STOP.has(name)) continue;
    const key = name.toLowerCase();
    if (out.has(key)) continue;
    const idx = m.index ?? 0;
    const excerpt = text.slice(Math.max(0, idx - 20), Math.min(text.length, idx + 120)).trim();
    out.set(key, {
      id: `${inboxId}::${key}`,
      inboxId, inboxTitle,
      name,
      category: "worldbuilding",
      confidence: 50,
      reason: "Capitalized name",
      excerpt,
    });
  }

  // Title-derived suggestion (chapter)
  const chapMatch = inboxTitle.match(/^(chapter|scene|prologue|epilogue|part)\b/i);
  if (chapMatch) {
    const key = `__title::${inboxId}`;
    out.set(key, {
      id: `${inboxId}::${key}`,
      inboxId, inboxTitle,
      name: inboxTitle,
      category: "timeline",
      confidence: 60,
      reason: "Source title looks like a chapter",
      excerpt: text.slice(0, 160).trim(),
    });
  }

  return Array.from(out.values()).slice(0, 12);
}

type Status = "pending" | "approved" | "rejected";

function ImportReview() {
  const project = useCurrentProject();
  const {
    inbox, customCategories,
    addCharacter, addLocation, addFaction, addGlossary,
    addTimelineEvent, addLoreEntry,
  } = useStore();

  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [overrides, setOverrides] = useState<Record<string, string>>({}); // suggestion id -> category
  const [renames, setRenames] = useState<Record<string, string>>({});      // suggestion id -> name
  const [editing, setEditing] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSuggestions = useMemo(() => {
    if (!project) return [];
    const projectInbox = inbox.filter(i => i.projectId === project.id);
    return projectInbox.flatMap(i => extractSuggestions(i.id, i.title, i.content));
  }, [inbox, project]);

  if (!project) return null;

  const categoryOptions: { value: string; label: string }[] = [
    ...BUILTIN.map(c => ({ value: c, label: c })),
    ...customCategories.map(c => ({ value: `custom:${c.slug}`, label: c.name })),
  ];

  const statusOf = (id: string): Status => statuses[id] ?? "pending";
  const visible = allSuggestions.filter(s => filter === "all" ? true : statusOf(s.id) === filter);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };
  const selectAll = () => {
    if (selected.size === visible.length) setSelected(new Set());
    else setSelected(new Set(visible.map(s => s.id)));
  };

  const setStatus = (id: string, s: Status) => {
    setStatuses(prev => ({ ...prev, [id]: s }));
  };

  const approve = (s: Suggestion) => {
    const cat = overrides[s.id] ?? s.category;
    const name = (renames[s.id] ?? s.name).trim();
    if (!name) { toast.error("Name can't be empty"); return; }
    if (cat.startsWith("custom:")) {
      const slug = cat.slice(7);
      addLoreEntry({
        projectId: project.id, categorySlug: slug,
        name, description: s.excerpt, tags: ["from-import"], status: "draft",
      });
    } else {
      switch (cat as BuiltInCat) {
        case "character":
          addCharacter({ projectId: project.id, name, role: "Extracted", description: s.excerpt, tags: ["from-import"], status: "draft" });
          break;
        case "location":
          addLocation({ projectId: project.id, name, description: s.excerpt, tags: ["from-import"], status: "draft" });
          break;
        case "faction":
          addFaction({ projectId: project.id, name, description: s.excerpt, status: "draft" });
          break;
        case "glossary":
          addGlossary({ projectId: project.id, term: name, definition: s.excerpt, category: "from-import", status: "draft" });
          break;
        case "timeline":
          addTimelineEvent({ projectId: project.id, title: name, description: s.excerpt, storyDate: "—", characters: [], status: "draft" });
          break;
        case "family":
        case "heritage":
        case "faith":
        case "magic":
        case "worldbuilding":
          addLoreEntry({
            projectId: project.id, categorySlug: cat,
            name, description: s.excerpt, tags: ["from-import"], status: "draft",
          });
          break;
      }
    }
    setStatus(s.id, "approved");
  };

  const reject = (s: Suggestion) => setStatus(s.id, "rejected");

  const bulkApprove = () => {
    const targets = visible.filter(s => selected.has(s.id) && statusOf(s.id) === "pending");
    if (targets.length === 0) { toast.error("Select pending suggestions to approve"); return; }
    targets.forEach(approve);
    toast.success(`Approved ${targets.length} suggestion${targets.length === 1 ? "" : "s"}`);
    setSelected(new Set());
  };
  const bulkReject = () => {
    const targets = visible.filter(s => selected.has(s.id));
    if (targets.length === 0) { toast.error("Select suggestions to reject"); return; }
    targets.forEach(reject);
    toast.success(`Rejected ${targets.length} suggestion${targets.length === 1 ? "" : "s"}`);
    setSelected(new Set());
  };
  const bulkReassign = (cat: string) => {
    const targets = visible.filter(s => selected.has(s.id));
    if (targets.length === 0) { toast.error("Select suggestions first"); return; }
    setOverrides(prev => {
      const next = { ...prev };
      targets.forEach(t => { next[t.id] = cat; });
      return next;
    });
    toast.success(`Reassigned ${targets.length} to ${categoryOptions.find(o => o.value === cat)?.label ?? cat}`);
  };
  const rejectAll = () => {
    if (visible.length === 0) return;
    const next = { ...statuses };
    visible.forEach(s => { next[s.id] = "rejected"; });
    setStatuses(next);
    toast.success(`Rejected ${visible.length} suggestion${visible.length === 1 ? "" : "s"}`);
    setSelected(new Set());
  };

  const startEdit = (id: string) => {
    const next = new Set(editing); next.add(id); setEditing(next);
  };
  const stopEdit = (id: string) => {
    const next = new Set(editing); next.delete(id); setEditing(next);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Inputs"
        title="Import Review"
        description="Review extracted suggestions before they become canon."
      />

      {allSuggestions.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="Nothing to review"
          description="Add files or paste content via the Story Info Inbox to generate suggestions."
        />
      ) : (
        <>
          <Card className="border-border/60 bg-card/60 backdrop-blur">
            <CardContent className="flex flex-wrap items-center gap-2 p-4">
              <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                <SelectTrigger className="h-10 w-auto min-w-[140px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="rounded-xl" onClick={selectAll} disabled={visible.length === 0}>
                <ListChecks className="h-4 w-4" />
                {selected.size === visible.length && visible.length > 0 ? "Deselect all" : "Select all"}
              </Button>

              <Button
                size="sm"
                className="gradient-primary rounded-xl text-primary-foreground"
                onClick={bulkApprove}
                disabled={selected.size === 0}
              >
                <Check className="h-4 w-4" />Approve selected
              </Button>

              <Select onValueChange={bulkReassign} disabled={selected.size === 0}>
                <SelectTrigger className="h-10 w-auto min-w-[180px] rounded-xl">
                  <Repeat className="h-4 w-4" />
                  <SelectValue placeholder="Reassign category…" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button size="sm" variant="outline" onClick={bulkReject} disabled={selected.size === 0}>
                <X className="h-4 w-4" />Reject selected
              </Button>

              <Button size="sm" variant="destructive" className="ml-auto rounded-xl" onClick={rejectAll}>
                <X className="h-4 w-4" />Reject All
              </Button>
            </CardContent>
          </Card>

          {visible.length === 0 ? (
            <EmptyState
              icon={FileSearch}
              title={`No ${filter} suggestions`}
              description="Switch the filter to see other suggestions."
            />
          ) : (
            <div className="space-y-3">
              {visible.map(s => {
                const status = statusOf(s.id);
                const cat = overrides[s.id] ?? s.category;
                const name = renames[s.id] ?? s.name;
                const isEditing = editing.has(s.id);
                return (
                  <Card key={s.id} className="border-border/60 bg-card/60 backdrop-blur">
                    <CardContent className="space-y-3 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Checkbox
                          checked={selected.has(s.id)}
                          onCheckedChange={() => toggleSelect(s.id)}
                          aria-label={`Select ${s.name}`}
                        />
                        {isEditing ? (
                          <Input
                            autoFocus
                            value={name}
                            onChange={(e) => setRenames(prev => ({ ...prev, [s.id]: e.target.value }))}
                            onBlur={() => stopEdit(s.id)}
                            onKeyDown={(e) => { if (e.key === "Enter") stopEdit(s.id); }}
                            className="h-8 max-w-[260px] text-sm"
                          />
                        ) : (
                          <h3 className="font-semibold">{name}</h3>
                        )}
                        <Select value={cat} onValueChange={(v) => setOverrides(prev => ({ ...prev, [s.id]: v }))}>
                          <SelectTrigger className="h-8 w-auto min-w-[140px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions.map(o => (
                              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Badge className="bg-sky-500/20 text-sky-300 hover:bg-sky-500/20 text-[10px]">{s.confidence}%</Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize ${
                            status === "approved" ? "border-emerald-500/60 text-emerald-400" :
                            status === "rejected" ? "border-rose-500/60 text-rose-400" : ""
                          }`}
                        >
                          {status}
                        </Badge>

                        <div className="ml-auto flex gap-1.5">
                          <Button size="sm" variant="ghost" onClick={() => startEdit(s.id)} title="Rename">
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            className="gradient-primary text-primary-foreground"
                            onClick={() => approve(s)}
                            disabled={status === "approved"}
                          >
                            <Check className="h-3.5 w-3.5" />Approve
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => reject(s)} disabled={status === "rejected"}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        From <span className="text-foreground">{s.inboxTitle}</span> · Reason: {s.reason}
                      </p>
                      <p className="rounded-xl border border-border/60 bg-background/40 p-3 text-sm italic text-muted-foreground">
                        "{s.excerpt}"
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
