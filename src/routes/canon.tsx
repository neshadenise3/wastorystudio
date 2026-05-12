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
import { pickIconKey, getIcon, slugify } from "@/lib/icon-registry";
import { Plus, ArrowRight, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/canon")({
  component: CanonPage,
  head: () => ({ meta: [{ title: "Story Canon — Writer's Assistant" }] }),
});

const DEFAULT_CATEGORIES: Array<{ name: string; iconKey: string; to: string; params?: Record<string, string> }> = [
  { name: "Characters", iconKey: "Users", to: "/characters" },
  { name: "Locations", iconKey: "MapPin", to: "/locations" },
  { name: "Factions", iconKey: "Flag", to: "/factions" },
  { name: "Families", iconKey: "Heart", to: "/families" },
  { name: "Heritage", iconKey: "BookMarked", to: "/heritage" },
  { name: "Faith", iconKey: "Sun", to: "/faith" },
  { name: "Magic / Powers", iconKey: "Wand2", to: "/magic" },
  { name: "Worldbuilding", iconKey: "Globe", to: "/worldbuilding" },
  { name: "Glossary", iconKey: "BookMarked", to: "/glossary" },
  { name: "Timeline", iconKey: "History", to: "/timeline" },
  { name: "Retcons", iconKey: "RefreshCw", to: "/retcons" },
  { name: "Continuity Notes", iconKey: "AlertTriangle", to: "/continuity" },
];

function CanonPage() {
  const project = useCurrentProject();
  const {
    customCategories, addCustomCategory, deleteCustomCategory,
    characters, locations, glossary, factions, loreEntries,
  } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [previewIcon, setPreviewIcon] = useState("Sparkles");

  if (!project) return null;

  const counts = (cat: { name: string }) => {
    const id = project.id;
    switch (cat.name) {
      case "Characters": return characters.filter(x => x.projectId === id).length;
      case "Locations": return locations.filter(x => x.projectId === id).length;
      case "Factions": return factions.filter(x => x.projectId === id).length;
      case "Glossary": return glossary.filter(x => x.projectId === id).length;
      default: return 0;
    }
  };
  const customCount = (slug: string) =>
    loreEntries.filter(e => e.projectId === project.id && e.categorySlug === slug).length;

  const create = () => {
    const trimmed = name.trim();
    if (!trimmed) { toast.error("Name required"); return; }
    let slug = slugify(trimmed);
    if (!slug) { toast.error("Use letters or numbers"); return; }
    if (customCategories.some(c => c.slug === slug)) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`;
    }
    const iconKey = pickIconKey(trimmed);
    addCustomCategory({ name: trimmed, slug, iconKey, section: "Custom" });
    setName(""); setPreviewIcon("Sparkles"); setOpen(false);
    toast.success(`"${trimmed}" added — appears in the sidebar.`);
  };

  const onNameChange = (v: string) => {
    setName(v);
    setPreviewIcon(pickIconKey(v));
  };

  const PreviewIcon = getIcon(previewIcon);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Story"
        title="Story Canon"
        description="Your story's source of truth — every category, every confirmed fact."
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setName(""); setPreviewIcon("Sparkles"); } }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary rounded-xl text-primary-foreground shadow-glow">
                <Plus className="h-4 w-4" />Add category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New canon category</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={name}
                    onChange={e => onNameChange(e.target.value)}
                    placeholder="e.g. Prophecies, Beasts, Songs"
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
                    <PreviewIcon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p className="flex items-center gap-1 font-medium text-foreground">
                      <Sparkles className="h-3 w-3 text-primary" /> Auto-picked icon
                    </p>
                    <p>Based on the category name. Will appear in the sidebar under <strong>Custom Categories</strong>.</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={create} className="gradient-primary text-primary-foreground">
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {DEFAULT_CATEGORIES.map(cat => {
          const Icon = getIcon(cat.iconKey);
          const c = counts(cat);
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

        {customCategories.map(cat => {
          const Icon = getIcon(cat.iconKey);
          const c = customCount(cat.slug);
          return (
            <Card key={cat.id} className="group relative border-primary/40 bg-card/60 backdrop-blur transition-all hover:shadow-glow">
              <div className="absolute right-2 top-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => { deleteCustomCategory(cat.id); toast.success(`"${cat.name}" removed`); }}
                  aria-label={`Remove ${cat.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <CardContent className="p-4">
                <Link to="/category/$slug" params={{ slug: cat.slug }} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-glow">
                    <Icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 pr-6">
                      <h3 className="truncate text-sm font-semibold">{cat.name}</h3>
                      {c > 0 && <Badge variant="secondary" className="text-[10px]">{c}</Badge>}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-primary/80">
                      <Sparkles className="h-3 w-3" /> Custom
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
