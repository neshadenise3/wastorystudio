import { useCurrentProject, useStore } from "@/lib/store";
import { CrudList } from "@/components/crud-list";
import { getIcon } from "@/lib/icon-registry";

export function LoreList({
  slug, title, eyebrow, description, iconKey,
}: {
  slug: string;
  title: string;
  eyebrow: string;
  description?: string;
  iconKey: string;
}) {
  const project = useCurrentProject();
  const { loreEntries, addLoreEntry, updateLoreEntry, deleteLoreEntry } = useStore();
  const Icon = getIcon(iconKey);
  if (!project) return null;
  const items = loreEntries.filter(e => e.projectId === project.id && e.categorySlug === slug);

  return (
    <CrudList
      eyebrow={eyebrow}
      title={title}
      description={description}
      icon={Icon}
      items={items}
      fields={[
        { key: "name", label: "Name" },
        { key: "description", label: "Description", type: "textarea" },
      ]}
      primary={(i) => i.name}
      onAdd={(d) => addLoreEntry({
        projectId: project.id, categorySlug: slug,
        name: d.name, description: d.description ?? "",
        tags: [], status: "draft",
      })}
      onUpdate={(id, d) => updateLoreEntry(id, { name: d.name, description: d.description })}
      onDelete={deleteLoreEntry}
    />
  );
}
