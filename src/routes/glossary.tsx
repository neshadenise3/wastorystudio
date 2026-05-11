import { createFileRoute } from "@tanstack/react-router";
import { useCurrentProject, useStore } from "@/lib/store";
import { CrudList } from "@/components/crud-list";
import { BookMarked } from "lucide-react";

export const Route = createFileRoute("/glossary")({
  component: GlossaryPage,
  head: () => ({ meta: [{ title: "Glossary — Writer's Assistant" }] }),
});

function GlossaryPage() {
  const project = useCurrentProject();
  const { glossary, addGlossary, updateGlossary, deleteGlossary } = useStore();
  if (!project) return null;
  const items = glossary.filter(c => c.projectId === project.id);

  return (
    <CrudList
      eyebrow="Reference"
      title="Glossary"
      description="Slang, religious terms, cultural notes, magic words, and uncommon vocabulary."
      icon={BookMarked}
      items={items}
      fields={[
        { key: "term", label: "Term" },
        { key: "category", label: "Category", placeholder: "Slang, Place, Idiom, Title…" },
        { key: "definition", label: "Definition", type: "textarea" },
      ]}
      primary={i => i.term}
      secondary={i => i.category}
      onAdd={(d) => addGlossary({ projectId: project.id, term: d.term, category: d.category ?? "General", definition: d.definition ?? "", status: "draft" })}
      onUpdate={(id, d) => updateGlossary(id, { term: d.term, category: d.category, definition: d.definition })}
      onDelete={deleteGlossary}
    />
  );
}
