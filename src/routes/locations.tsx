import { createFileRoute } from "@tanstack/react-router";
import { useCurrentProject, useStore } from "@/lib/store";
import { CrudList } from "@/components/crud-list";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/locations")({
  component: LocationsPage,
  head: () => ({ meta: [{ title: "Locations — Writer's Assistant" }] }),
});

function LocationsPage() {
  const project = useCurrentProject();
  const { locations, addLocation, updateLocation, deleteLocation } = useStore();
  if (!project) return null;
  const items = locations.filter(c => c.projectId === project.id);

  return (
    <CrudList
      eyebrow="World"
      title="Locations"
      description="Cities, regions, dreamscapes, and every place your story visits."
      icon={MapPin}
      items={items}
      fields={[
        { key: "name", label: "Name" },
        { key: "description", label: "Description", type: "textarea" },
      ]}
      primary={i => i.name}
      onAdd={(d) => addLocation({ projectId: project.id, name: d.name, description: d.description ?? "", tags: [], status: "draft" })}
      onUpdate={(id, d) => updateLocation(id, { name: d.name, description: d.description })}
      onDelete={deleteLocation}
    />
  );
}
