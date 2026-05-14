import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FolderOpen, Home, Inbox, History, FileSearch,
  Clock, BookOpen, Globe, Library, Users, MapPin, Flag, Heart,
  Sun, Wand2, BookMarked, GitBranch, AlertTriangle,
  RefreshCw, UsersRound, ListChecks, FileText, Download, Trash2,
  Settings, Plus, ChevronDown, ChevronRight, type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { getIcon } from "@/lib/icon-registry";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: React.ReactNode;
  params?: Record<string, string>;
};
type NavSection = { label: string; items: NavItem[]; customItems?: NavItem[] };

const baseSections: NavSection[] = [
  {
    label: "Workspace",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/projects", label: "Projects", icon: FolderOpen },
      { to: "/hub", label: "Story Hub", icon: Home },
    ],
  },
  {
    label: "Inputs",
    items: [
      { to: "/inbox", label: "Story Info Inbox", icon: Inbox },
      { to: "/uploads", label: "Upload History", icon: History },
      { to: "/import-review", label: "Import Review", icon: FileSearch },
    ],
  },
  {
    label: "Story",
    items: [
      { to: "/timeline", label: "Timeline", icon: Clock },
      { to: "/canon", label: "Story Canon", icon: BookOpen, badge: <Plus className="h-3 w-3" /> },
      { to: "/worldbuilding", label: "Worldbuilding", icon: Globe },
      { to: "/canon-library", label: "Canon Library", icon: Library },
    ],
  },
  {
    label: "Cast & Lore",
    items: [
      { to: "/characters", label: "Characters", icon: Users },
      { to: "/locations", label: "Locations", icon: MapPin },
      { to: "/factions", label: "Factions", icon: Flag },
      { to: "/families", label: "Families", icon: Heart },
      { to: "/heritage", label: "Heritage", icon: BookMarked },
      { to: "/faith", label: "Faith", icon: Sun },
      { to: "/magic", label: "Magic / Powers", icon: Wand2 },
      { to: "/glossary", label: "Glossary", icon: BookMarked },
    ],
  },
  {
    label: "Planning",
    items: [
      { to: "/pathways", label: "Pathways", icon: GitBranch },
      { to: "/continuity", label: "Continuity Issues", icon: AlertTriangle },
      { to: "/retcons", label: "Retcons", icon: RefreshCw },
    ],
  },
  {
    label: "Team & Files",
    items: [
      { to: "/collaborators", label: "Collaborators", icon: UsersRound },
      { to: "/changelog", label: "Master Change Log", icon: ListChecks },
      { to: "/templates", label: "Templates", icon: FileText },
      { to: "/exports", label: "Exports", icon: Download },
      { to: "/trash", label: "Trash", icon: Trash2 },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

function useDynamicSections(): NavSection[] {
  const customCategories = useStore((s) => s.customCategories);
  if (customCategories.length === 0) return baseSections;

  const customItems: NavItem[] = customCategories.map((c) => ({
    to: "/category/$slug",
    params: { slug: c.slug },
    label: c.name,
    icon: getIcon(c.iconKey),
  }));

  return baseSections.map((section) =>
    section.label === "Cast & Lore"
      ? { ...section, customItems }
      : section
  );
}

export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sections = useDynamicSections();
  const collapsed = useStore((s) => s.customCategoriesCollapsed);
  const toggleCollapsed = useStore((s) => s.toggleCustomCategoriesCollapsed);

  const renderItem = (item: NavItem) => {
    const resolved = item.params?.slug ? `/category/${item.params.slug}` : item.to;
    const active = pathname === resolved;
    const Icon = item.icon;
    return (
      <li key={resolved}>
        <Link
          to={item.to}
          params={item.params as never}
          onClick={onNavigate}
          className={cn(
            "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-all",
            active
              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          )}
        >
          <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {item.badge}
            </span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <nav className="flex flex-col gap-5 px-3 py-4">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {section.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {section.items.map(renderItem)}
            {section.customItems && section.customItems.length > 0 && (
              <>
                <li>
                  <button
                    type="button"
                    onClick={toggleCollapsed}
                    className="mt-1 flex w-full items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                    aria-expanded={!collapsed}
                  >
                    {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    <span className="flex-1 text-left">Custom ({section.customItems.length})</span>
                  </button>
                </li>
                {!collapsed && section.customItems.map(renderItem)}
              </>
            )}
          </ul>
        </div>
      ))}
    </nav>
  );
}
