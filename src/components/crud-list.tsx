import { useState, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Plus, Search, Trash2, Edit2, Copy, Archive } from "lucide-react";
import { toast } from "sonner";

export interface Field {
  key: string;
  label: string;
  type?: "text" | "textarea";
  placeholder?: string;
}

export function CrudList<T extends { id: string }>({
  eyebrow, title, description, items, fields, icon: Icon,
  primary, secondary, onAdd, onUpdate, onDelete,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  items: T[];
  fields: Field[];
  icon: React.ComponentType<{ className?: string }>;
  primary: (i: T) => string;
  secondary?: (i: T) => string | undefined;
  onAdd: (data: Record<string, string>) => void;
  onUpdate?: (id: string, data: Record<string, string>) => void;
  onDelete: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<string | null>(null);

  const filtered = items.filter(i => primary(i).toLowerCase().includes(search.toLowerCase()));

  const reset = () => { setDraft({}); setEditing(null); };

  const submit = () => {
    const required = fields[0].key;
    if (!draft[required]?.trim()) { toast.error(`${fields[0].label} required`); return; }
    if (editing && onUpdate) onUpdate(editing, draft);
    else onAdd(draft);
    reset();
    setOpen(false);
    toast.success(editing ? "Updated" : "Created");
  };

  const startEdit = (i: T) => {
    const d: Record<string, string> = {};
    fields.forEach(f => { d[f.key] = (i as any)[f.key] ?? ""; });
    setDraft(d);
    setEditing(i.id);
    setOpen(true);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary rounded-xl text-primary-foreground shadow-glow"><Plus className="h-4 w-4" />Add</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} {title.replace(/s$/, "")}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                {fields.map(f => (
                  <div key={f.key}>
                    <Label>{f.label}</Label>
                    {f.type === "textarea"
                      ? <Textarea value={draft[f.key] ?? ""} onChange={e => setDraft({ ...draft, [f.key]: e.target.value })} placeholder={f.placeholder} />
                      : <Input value={draft[f.key] ?? ""} onChange={e => setDraft({ ...draft, [f.key]: e.target.value })} placeholder={f.placeholder} />}
                  </div>
                ))}
              </div>
              <DialogFooter><Button onClick={submit} className="gradient-primary text-primary-foreground">{editing ? "Save" : "Create"}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={`Search ${title.toLowerCase()}…`} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Icon} title={`No ${title.toLowerCase()} yet`} description={`Click "Add" to create your first.`} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(item => (
            <Card key={item.id} className="group border-border/60 bg-card/60 backdrop-blur transition-all hover:shadow-glow">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{primary(item)}</h3>
                    {secondary?.(item) && <p className="text-xs text-muted-foreground">{secondary(item)}</p>}
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px]">{(item as any).status ?? "draft"}</Badge>
                </div>
                {(item as any).description && <p className="line-clamp-3 text-sm text-muted-foreground">{(item as any).description}</p>}
                {(item as any).definition && <p className="line-clamp-3 text-sm text-muted-foreground">{(item as any).definition}</p>}
                <div className="flex gap-1 pt-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {onUpdate && <Button size="sm" variant="ghost" onClick={() => startEdit(item)}><Edit2 className="h-3.5 w-3.5" /></Button>}
                  <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(primary(item)); toast.success("Copied"); }}><Copy className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost"><Archive className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function ExtraSlot({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
