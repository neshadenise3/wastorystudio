import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCurrentProject, useStore } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Inbox, Upload, FilePlus2, ArrowRight, Trash2, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { extractTextFromFile } from "@/lib/extract";
import { toast } from "sonner";
import { useRef } from "react";

const SAMPLE_UPLOADS: { title: string; type: "paste" | "upload"; sourceFile?: string; content: string }[] = [
  {
    title: "Chapter 1 — Down the Rabbit Hole",
    type: "upload",
    sourceFile: "ch01-rabbit-hole.txt",
    content:
      "Alice was beginning to get very tired of sitting by her sister on the bank. Suddenly a White Rabbit with pink eyes ran close by her, muttering 'Oh dear! I shall be late!' Burning with curiosity, Alice ran across the field after it and was just in time to see it pop down a large rabbit-hole under the hedge. In another moment, down went Alice after it.",
  },
  {
    title: "Chapter 2 — The Pool of Tears",
    type: "upload",
    sourceFile: "ch02-pool-of-tears.docx",
    content:
      "'Curiouser and curiouser!' cried Alice. She was now more than nine feet high, and at once took up the little golden key and hurried off to the garden door. Poor Alice! Tears streamed down until there was a large pool, reaching half down the hall.",
  },
  {
    title: "Scene notes — Mad Tea Party",
    type: "paste",
    content:
      "The Hatter and the March Hare are stuck at six o'clock forever. Tone: chaotic, riddling, slightly menacing. Alice grows impatient. The Dormouse keeps falling asleep mid-sentence. Use this scene to introduce the Queen's reach: a soldier card delivers a summons.",
  },
  {
    title: "Worldbuilding — Queen's Court politics",
    type: "paste",
    content:
      "The Queen of Hearts rules through fear of beheading, but executions rarely happen — the King quietly pardons most. The card soldiers are organized by suit: Spades dig, Clubs guard, Diamonds carry, Hearts attend the Queen.",
  },
];

export const Route = createFileRoute("/inbox")({
  component: InboxPage,
  head: () => ({ meta: [{ title: "Story Info Inbox — Writer's Assistant" }] }),
});

function InboxPage() {
  const project = useCurrentProject();
  const { inbox, addInbox, deleteInbox, updateInbox } = useStore();
  const [draft, setDraft] = useState({ title: "", content: "" });
  const [extracting, setExtracting] = useState(false);

  if (!project) return null;
  const items = inbox.filter(i => i.projectId === project.id);

  const onPaste = () => {
    if (!draft.title.trim() || !draft.content.trim()) { toast.error("Title and content required"); return; }
    addInbox({ projectId: project.id, title: draft.title, content: draft.content, type: "paste", reviewed: false });
    setDraft({ title: "", content: "" });
    toast.success("Sent to Inbox");
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setExtracting(true);
    let ok = 0;
    for (const f of files) {
      try {
        const text = await extractTextFromFile(f);
        addInbox({
          projectId: project.id, title: f.name, content: text,
          type: "upload", sourceFile: f.name, reviewed: false,
        });
        ok++;
      } catch (err) {
        console.error("Extraction failed for", f.name, err);
        toast.error(`Couldn't extract ${f.name}`);
      }
    }
    setExtracting(false);
    if (ok) toast.success(`${ok} file(s) extracted into Inbox`);
    e.target.value = "";
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Inputs"
        title="Story Info Inbox"
        description="Paste, upload, or drop in raw story material. Nothing becomes canon until reviewed."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold"><FilePlus2 className="h-4 w-4 text-primary" /> Paste content</div>
            <Input placeholder="Title (e.g. Chapter 3 draft)" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} />
            <Textarea rows={8} placeholder="Paste chapter, scene, notes…" value={draft.content} onChange={e => setDraft({ ...draft, content: e.target.value })} />
            <Button onClick={onPaste} className="gradient-primary text-primary-foreground"><Inbox className="h-4 w-4" />Send to Inbox</Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold"><Upload className="h-4 w-4 text-primary" /> Upload files</div>
            <p className="text-xs text-muted-foreground">PDF, DOCX, MD, TXT, JSON, CSV, RTF — text is extracted automatically in your browser.</p>
            <label className={`flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 bg-background/40 transition-colors hover:bg-background/60 ${extracting ? "pointer-events-none opacity-60" : ""}`}>
              {extracting ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
              <span className="text-sm text-muted-foreground">{extracting ? "Extracting…" : "Click to choose files"}</span>
              <input type="file" multiple accept=".pdf,.docx,.doc,.md,.txt,.json,.csv,.rtf,.html,.xml,.yaml,.yml,text/*" onChange={onUpload} className="hidden" disabled={extracting} />
            </label>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Inbox queue ({items.length})</h2>
        {items.length === 0 ? (
          <EmptyState icon={Inbox} title="Inbox empty" description="Paste or upload story material to get started." />
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <Card key={item.id} className="border-border/60 bg-card/60 backdrop-blur">
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold">{item.title}</h3>
                      <Badge variant={item.reviewed ? "default" : "secondary"} className="text-[10px]">{item.reviewed ? "Reviewed" : "Pending"}</Badge>
                      <Badge variant="outline" className="text-[10px]">{item.type}</Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.content}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Upload #{item.uploadOrder + 1} · {new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => updateInbox(item.id, { reviewed: !item.reviewed })}>
                      <ArrowRight className="h-3.5 w-3.5" />Review
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteInbox(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
