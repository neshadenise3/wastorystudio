import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavList } from "@/components/nav-list";
import { useStore, useCurrentProject, type Theme } from "@/lib/store";
import { Menu, ChevronDown, Search, Sparkles, Palette, Pin, Plus, Feather } from "lucide-react";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="relative flex h-8 w-8 items-center justify-center rounded-xl gradient-primary shadow-glow">
        <Feather className="h-4 w-4 text-primary-foreground" />
        <Sparkles className="sparkle absolute -right-1 -top-1 h-3 w-3 text-accent" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-bold tracking-tight">Writer's Assistant</span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Story Studio</span>
      </div>
    </Link>
  );
}

function ProjectSwitcher() {
  const { projects, setCurrentProject, currentProjectId } = useStore();
  const current = useCurrentProject();
  const [search, setSearch] = useState("");
  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) && !p.archived
  );
  const pinned = filtered.filter(p => p.pinned);
  const others = filtered.filter(p => !p.pinned);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 gap-2 rounded-xl border-border/60 bg-card/60 px-3 backdrop-blur">
          <span className="hidden text-xs text-muted-foreground sm:inline">Project</span>
          <span className="max-w-[140px] truncate text-sm font-medium">
            {current?.title ?? "No project"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-7 text-sm"
            />
          </div>
        </div>
        {pinned.length > 0 && (
          <>
            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Pinned
            </DropdownMenuLabel>
            {pinned.map(p => (
              <DropdownMenuItem key={p.id} onClick={() => setCurrentProject(p.id)}>
                <Pin className="h-3 w-3 text-primary" />
                <span className="flex-1 truncate">{p.title}</span>
                {p.id === currentProjectId && <span className="text-xs text-muted-foreground">●</span>}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        {others.map(p => (
          <DropdownMenuItem key={p.id} onClick={() => setCurrentProject(p.id)}>
            <span className="flex-1 truncate">{p.title}</span>
            {p.id === currentProjectId && <span className="text-xs text-muted-foreground">●</span>}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/projects" className="cursor-pointer">
            <Plus className="h-3.5 w-3.5" /> New project
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeSwitcher() {
  const { theme, setTheme } = useStore();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl">
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(v) => setTheme(v as Theme)}
        >
          <DropdownMenuRadioItem value="dark">Neon Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="mint">Mint Garden</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="kawaii">Kawaii Sparkle</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="flex h-14 items-center border-b border-sidebar-border px-4">
            <Logo />
          </div>
          <ScrollArea className="flex-1">
            <NavList />
          </ScrollArea>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border/60 bg-background/80 px-3 backdrop-blur-md sm:px-5">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <VisuallyHidden><SheetTitle>Navigation</SheetTitle></VisuallyHidden>
              <div className="flex h-14 items-center border-b border-border px-4">
                <Logo />
              </div>
              <ScrollArea className="h-[calc(100vh-3.5rem)]">
                <NavList onNavigate={() => setMobileOpen(false)} />
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <div className="lg:hidden"><Logo /></div>

          <div className="ml-auto flex items-center gap-2">
            <ProjectSwitcher />
            <ThemeSwitcher />
          </div>
        </header>

        <main className={cn("flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8")}>
          {children}
        </main>
      </div>
    </div>
  );
}
