import { createFileRoute } from "@tanstack/react-router";
import { LoreList } from "@/components/lore-list";

export const Route = createFileRoute("/heritage")({
  component: () => <LoreList slug="heritage" title="Heritage" eyebrow="Cast & Lore" description="Cultural backgrounds and lineage notes." iconKey="BookMarked" />,
  head: () => ({ meta: [{ title: "Heritage — Writer's Assistant" }] }),
});
