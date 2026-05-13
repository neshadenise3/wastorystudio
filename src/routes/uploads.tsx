import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useCurrentProject, useStore, type InboxItem } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowDown, ArrowUp, History, RotateCcw, Sparkles, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/uploads")({
  component: UploadsPage,
  head: () => ({ meta: [{ title: "Upload History — Writer's Assistant" }] }),
});

function parseChapterScene(title: string): string {
  // "Chapter 1 — The Cyclone" → "Chapter 1 — The Cyclone"; "Foo bar" → "—"
  const m = title.match(/^(chapter|scene|prologue|epilogue|part)\b[^—\-:]*[—\-:]?\s*(.*)$/i);
  if (!m) return "—";
  const head = m[1];
  const tail = m[2]?.trim();
  return tail ? `${head} — ${tail.slice(0, 40)}` : head;
}

function parseStoryDate(content: string): string {
  // Try to find a year or date-like token near the start
  const sample = content.slice(0, 400);
  const date = sample.match(/\b(\d{1,2}(st|nd|rd|th)?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{0,4})\b/i);
  if (date) return date[1];
  const year = sample.match(/\b(1[5-9]\d{2}|20\d{2}|21\d{2})\b/);
  if (year) return year[1];
  return "—";
}

function generateAdvice(items: InboxItem[]): string[] {
  if (items.length === 0) return [];
  const advice: string[] = [];
  const total = items.length;
  const reviewed = items.filter(i => i.reviewed).length;
  const drafts = total - reviewed;

  advice.push(
    `You have ${total} source${total === 1 ? "" : "s"} selected (${drafts} draft, ${reviewed} reviewed). Run Import Review on the drafts before generating new pathways — uncategorized material weakens canon links.`
  );

  // Detect chapter ordering hints
  const chapterItems = items.filter(i => /chapter\s*\d+/i.test(i.title));
  if (chapterItems.length >= 2) {
    const inOrder = chapterItems.every((it, idx, arr) => {
      if (idx === 0) return true;
      const prev = parseInt(arr[idx - 1].title.match(/chapter\s*(\d+)/i)?.[1] ?? "", 10);
      const cur = parseInt(it.title.match(/chapter\s*(\d+)/i)?.[1] ?? "", 10);
      return cur >= prev;
    });
    if (!inOrder) {
      advice.push("Story order doesn't match chapter numbering. Consider reordering — Pathways and Continuity will follow the story-order column.");
    } else {
      advice.push("Chapter numbering matches story order. Pathway source trails will be chronologically accurate.");
    }
  }

  // Length distribution
  const lengths = items.map(i => i.content.length);
  const avg = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
  const longest = items[lengths.indexOf(Math.max(...lengths))];
  const shortest = items[lengths.indexOf(Math.min(...lengths))];
  if (longest && shortest && lengths.length > 1) {
    advice.push(
      `Sources average ${avg.toLocaleString()} characters. Longest: "${longest.title.slice(0, 32)}" (${longest.content.length.toLocaleString()}). Shortest: "${shortest.title.slice(0, 32)}" (${shortest.content.length.toLocaleString()}). Very short sources often parse as fragments — paste fuller context for better extractions.`
    );
  }

  // Type mix
  const types = new Set(items.map(i => i.type));
  if (types.has("paste") && types.has("upload")) {
    advice.push("Mixed paste + upload sources detected. Uploads carry filenames in source trails; pastes don't — consider renaming pastes to match chapter titles.");
  }

  // Per-source suggestion
  for (const i of items.slice(0, 3)) {
    const wc = i.content.split(/\s+/).filter(Boolean).length;
    const hasDialogue = /["“”]/.test(i.content);
    const hasNames = /\b[A-Z][a-z]+(\s+[A-Z][a-z]+)?\b/.test(i.content);
    const tips: string[] = [];
    if (wc < 50) tips.push("very short — likely needs more context");
    if (hasDialogue) tips.push("contains dialogue — good for character voice extraction");
    if (hasNames) tips.push("proper nouns detected — strong candidate for Import Review");
    if (!i.reviewed) tips.push("not yet reviewed");
    advice.push(`"${i.title.slice(0, 40)}" (${wc} words): ${tips.join("; ") || "looks balanced"}.`);
  }

  return advice;
}

function UploadsPage() {
  const project = useCurrentProject();
  const { inbox, reorderInbox } = useStore();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adviceOpen, setAdviceOpen] = useState(false);
  const [adviceItems, setAdviceItems] = useState<InboxItem[]>([]);

  const items = useMemo(
    () => (project ? inbox.filter(i => i.projectId === project.id).sort((a, b) => a.storyOrder - b.storyOrder) : []),
    [inbox, project]
  );

  if (!project) return null;

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

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const showAdvice = (which: "selected" | "all") => {
    const target = which === "all" ? items : items.filter(i => selected.has(i.id));
    if (target.length === 0) {
      toast.error(which === "selected" ? "Select at least one source first" : "No sources to advise on");
      return;
    }
    setAdviceItems(target);
    setAdviceOpen(true);
  };

  const advice = useMemo(() => generateAdvice(adviceItems), [adviceItems]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Inputs"
        title="Upload History & Source Order"
        description="Original upload order is preserved. Reorder to set corrected story order."
        actions={
          <Button variant="outline" onClick={reset} className="rounded-xl">
            <RotateCcw className="h-4 w-4" />Reset to upload order
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => showAdvice("selected")}
          disabled={selected.size === 0}
        >
          <Sparkles className="h-4 w-4" />AI Advice (selected{selected.size > 0 ? ` · ${selected.size}` : ""})
        </Button>
        <Button
          className="gradient-primary rounded-xl text-primary-foreground shadow-glow"
          onClick={() => showAdvice("all")}
          disabled={items.length === 0}
        >
          <Sparkles className="h-4 w-4" />AI Advice (all)
        </Button>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <p>
          Changing upload story order updates pathway source trails and story-order sorting. No records are deleted.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={History} title="No uploads yet" description="Add files via the Story Info Inbox." />
      ) : (
        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="w-10 p-3"></th>
                    <th className="w-10 p-3 text-left">#</th>
                    <th className="p-3 text-left">Source</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Chapter / Scene</th>
                    <th className="p-3 text-left">Story Date</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Order</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id} className="border-t border-border/40 hover:bg-background/30">
                      <td className="p-3">
                        <Checkbox
                          checked={selected.has(item.id)}
                          onCheckedChange={() => toggle(item.id)}
                          aria-label={`Select ${item.title}`}
                        />
                      </td>
                      <td className="p-3 text-muted-foreground">{idx + 1}</td>
                      <td className="p-3 font-medium">{item.title}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px]">{item.type}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{parseChapterScene(item.title)}</td>
                      <td className="p-3 text-muted-foreground">{parseStoryDate(item.content)}</td>
                      <td className="p-3">
                        <Badge variant={item.reviewed ? "default" : "outline"} className="text-[10px]">
                          {item.reviewed ? "Reviewed" : "Draft"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => move(idx, -1)} disabled={idx === 0}>
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => move(idx, 1)} disabled={idx === items.length - 1}>
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={adviceOpen} onOpenChange={setAdviceOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Advice on {adviceItems.length} source{adviceItems.length === 1 ? "" : "s"}
            </DialogTitle>
            <DialogDescription>
              Heuristic suggestions based on your source order, length, and content.
            </DialogDescription>
          </DialogHeader>
          <ul className="max-h-[60vh] space-y-3 overflow-y-auto pr-2">
            {advice.map((a, i) => (
              <li key={i} className="flex gap-3 rounded-xl border border-border/60 bg-background/40 p-3 text-sm">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full gradient-primary text-[11px] font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{a}</span>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}
