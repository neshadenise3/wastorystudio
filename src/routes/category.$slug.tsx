import { createFileRoute, notFound } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { LoreList } from "@/components/lore-list";
import { PageHeader, EmptyState } from "@/components/page-header";
import { HelpCircle } from "lucide-react";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — Writer's Assistant` }],
  }),
  notFoundComponent: () => (
    <EmptyState icon={HelpCircle} title="Category not found" description="It may have been removed." />
  ),
  errorComponent: ({ error }) => (
    <PageHeader title="Something went wrong" description={error.message} />
  ),
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const cat = useStore((s) => s.customCategories.find((c) => c.slug === slug));
  if (!cat) throw notFound();
  return (
    <LoreList
      slug={cat.slug}
      title={cat.name}
      eyebrow={cat.section}
      description={`Custom canon category — ${cat.name.toLowerCase()}.`}
      iconKey={cat.iconKey}
    />
  );
}
