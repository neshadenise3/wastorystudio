import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCurrentProject, useStore } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Inbox, Upload, FilePlus2, ArrowRight, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/inbox")({
  component: InboxPage,
  head: () => ({ meta: [{ title: "Story Info Inbox — Writer's Assistant" }] }),
});

function InboxPage() {
  const project = useCurrentProject();
  const { inbox, addInbox, deleteInbox, updateInbox } = useStore();
  const [draft, setDraft] = useState({ title: "", content: "" });

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
    for (const f of files) {
      const text = f.type.startsWith("text/") || f.name.match(/\.(md|txt|json|csv|rtf)$/i)
        ? await f.text()
        : `[Uploaded file: ${f.name} — extraction pending]`;
      addInbox({ projectId: project.id, title: f.name, content: text, type: "upload", sourceFile: f.name, reviewed: false });
    }
    if (files.length) toast.success(`${files.length} file(s) uploaded`);
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
            <p className="text-xs text-muted-foreground">Supports MD, TXT, JSON, CSV, RTF, DOC, DOCX, PDF (text-extracted formats parsed inline; binary types stored for review).</p>
            <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 bg-background/40 transition-colors hover:bg-background/60">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to choose files</span>
              <input type="file" multiple onChange={onUpload} className="hidden" />
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
