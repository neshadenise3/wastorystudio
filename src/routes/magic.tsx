import { createFileRoute } from "@tanstack/react-router";
import { LoreList } from "@/components/lore-list";

export const Route = createFileRoute("/magic")({
  component: () => <LoreList slug="magic" title="Magic / Powers" eyebrow="Cast & Lore" description="Power systems, costs, and rules." iconKey="Wand2" />,
  head: () => ({ meta: [{ title: "Magic / Powers — Writer's Assistant" }] }),
});
