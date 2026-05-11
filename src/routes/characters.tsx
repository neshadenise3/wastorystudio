import { createFileRoute } from "@tanstack/react-router";
import { useCurrentProject, useStore } from "@/lib/store";
import { CrudList } from "@/components/crud-list";
import { Users } from "lucide-react";

export const Route = createFileRoute("/characters")({
  component: CharactersPage,
  head: () => ({ meta: [{ title: "Characters — Writer's Assistant" }] }),
});

function CharactersPage() {
  const project = useCurrentProject();
  const { characters, addCharacter, updateCharacter, deleteCharacter } = useStore();
  if (!project) return null;
  const items = characters.filter(c => c.projectId === project.id);

  return (
    <CrudList
      eyebrow="Cast"
      title="Characters"
      description="Your story's full cast — protagonists, side characters, factions of one."
      icon={Users}
      items={items}
      fields={[
        { key: "name", label: "Name" },
        { key: "role", label: "Role", placeholder: "Protagonist, Antagonist, Companion…" },
        { key: "description", label: "Description", type: "textarea" },
      ]}
      primary={i => i.name}
      secondary={i => i.role}
      onAdd={(d) => addCharacter({ projectId: project.id, name: d.name, role: d.role ?? "", description: d.description ?? "", tags: [], status: "draft" })}
      onUpdate={(id, d) => updateCharacter(id, { name: d.name, role: d.role, description: d.description })}
      onDelete={deleteCharacter}
    />
  );
}
