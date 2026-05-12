import { createFileRoute } from "@tanstack/react-router";
import { LoreList } from "@/components/lore-list";

export const Route = createFileRoute("/families")({
  component: () => <LoreList slug="families" title="Families" eyebrow="Cast & Lore" description="Bloodlines, houses, and chosen kin." iconKey="Heart" />,
  head: () => ({ meta: [{ title: "Families — Writer's Assistant" }] }),
});
