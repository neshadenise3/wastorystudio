import { createFileRoute } from "@tanstack/react-router";
import { useCurrentProject, useStore } from "@/lib/store";
import { CrudList } from "@/components/crud-list";
import { Flag } from "lucide-react";

export const Route = createFileRoute("/factions")({
  component: FactionsPage,
  head: () => ({ meta: [{ title: "Factions — Writer's Assistant" }] }),
});

function FactionsPage() {
  const project = useCurrentProject();
  const { factions, addFaction, deleteFaction } = useStore();
  if (!project) return null;
  const items = factions.filter(c => c.projectId === project.id);

  return (
    <CrudList
      eyebrow="World"
      title="Factions"
      description="Courts, guilds, rebellions, secret societies."
      icon={Flag}
      items={items}
      fields={[
        { key: "name", label: "Name" },
        { key: "description", label: "Description", type: "textarea" },
      ]}
      primary={i => i.name}
      onAdd={(d) => addFaction({ projectId: project.id, name: d.name, description: d.description ?? "", status: "draft" })}
      onDelete={deleteFaction}
    />
  );
}
