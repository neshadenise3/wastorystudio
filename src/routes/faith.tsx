import { createFileRoute } from "@tanstack/react-router";
import { LoreList } from "@/components/lore-list";

export const Route = createFileRoute("/faith")({
  component: () => <LoreList slug="faith" title="Faith" eyebrow="Cast & Lore" description="Religions, beliefs, deities, and rituals." iconKey="Sun" />,
  head: () => ({ meta: [{ title: "Faith — Writer's Assistant" }] }),
});
