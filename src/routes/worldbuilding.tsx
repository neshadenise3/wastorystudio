import { createFileRoute } from "@tanstack/react-router";
import { LoreList } from "@/components/lore-list";

export const Route = createFileRoute("/worldbuilding")({
  component: () => <LoreList slug="worldbuilding" title="Worldbuilding Guide" eyebrow="Story" description="The rules, eras, and shape of your world." iconKey="Globe" />,
  head: () => ({ meta: [{ title: "Worldbuilding — Writer's Assistant" }] }),
});
