import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";

export type Theme = "dark" | "mint" | "kawaii";
export type CanonStatus = "draft" | "review" | "canon" | "rejected";

export interface Project {
  id: string;
  title: string;
  summary: string;
  tone: string;
  setting: string;
  genre: string;
  cover?: string;
  pinned?: boolean;
  archived?: boolean;
  updatedAt: number;
  collaborators: string[];
}

export interface Character {
  id: string; projectId: string; name: string; role: string;
  description: string; tags: string[]; status: CanonStatus; updatedAt: number;
}
export interface Location {
  id: string; projectId: string; name: string; description: string;
  tags: string[]; status: CanonStatus; updatedAt: number;
}
export interface Faction {
  id: string; projectId: string; name: string; description: string; status: CanonStatus; updatedAt: number;
}
export interface GlossaryTerm {
  id: string; projectId: string; term: string; definition: string;
  category: string; status: CanonStatus; updatedAt: number;
}
export interface TimelineEvent {
  id: string; projectId: string; title: string; description: string;
  storyDate: string; chapter?: string; characters: string[];
  location?: string; status: CanonStatus; order: number; updatedAt: number;
}
export interface InboxItem {
  id: string; projectId: string; title: string; type: "paste" | "upload" | "manual" | "import";
  content: string; sourceFile?: string; createdAt: number; reviewed: boolean;
  uploadOrder: number; storyOrder: number;
}
export interface PathwayCard {
  id: string; projectId: string; title: string; hook: string; pitch: string;
  summary: string; nextEvents: string[]; tone: string; characters: string[];
  locations: string[]; sourceUploads: string[]; confidence: "low" | "medium" | "high";
  status: "suggested" | "saved" | "confirmed" | "rejected" | "edited";
  createdAt: number;
}
export interface ChangeLog {
  id: string; projectId: string; user: string; action: string;
  itemType: string; itemName: string; timestamp: number; notes?: string;
}

export interface CustomCategory {
  id: string; name: string; slug: string; iconKey: string;
  section: "Cast & Lore" | "Story" | "Custom";
  createdAt: number;
}

export interface LoreEntry {
  id: string; projectId: string; categorySlug: string;
  name: string; description: string; tags: string[];
  status: CanonStatus; updatedAt: number;
}

interface State {
  theme: Theme;
  familyFriendly: boolean;
  currentProjectId: string | null;
  projects: Project[];
  characters: Character[];
  locations: Location[];
  factions: Faction[];
  glossary: GlossaryTerm[];
  timeline: TimelineEvent[];
  inbox: InboxItem[];
  pathways: PathwayCard[];
  changeLog: ChangeLog[];
  customCategories: CustomCategory[];
  loreEntries: LoreEntry[];
  trash: { id: string; type: string; name: string; data: any; deletedAt: number; projectId: string }[];

  addCustomCategory: (c: Omit<CustomCategory, "id" | "createdAt">) => CustomCategory;
  deleteCustomCategory: (id: string) => void;

  addLoreEntry: (c: Omit<LoreEntry, "id" | "updatedAt">) => void;
  updateLoreEntry: (id: string, c: Partial<LoreEntry>) => void;
  deleteLoreEntry: (id: string) => void;

  setTheme: (t: Theme) => void;
  setFamilyFriendly: (v: boolean) => void;
  setCurrentProject: (id: string) => void;

  addProject: (p: Omit<Project, "id" | "updatedAt" | "collaborators">) => string;
  updateProject: (id: string, p: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addCharacter: (c: Omit<Character, "id" | "updatedAt">) => void;
  updateCharacter: (id: string, c: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;

  addLocation: (c: Omit<Location, "id" | "updatedAt">) => void;
  updateLocation: (id: string, c: Partial<Location>) => void;
  deleteLocation: (id: string) => void;

  addFaction: (c: Omit<Faction, "id" | "updatedAt">) => void;
  deleteFaction: (id: string) => void;

  addGlossary: (c: Omit<GlossaryTerm, "id" | "updatedAt">) => void;
  updateGlossary: (id: string, c: Partial<GlossaryTerm>) => void;
  deleteGlossary: (id: string) => void;

  addTimelineEvent: (c: Omit<TimelineEvent, "id" | "updatedAt" | "order">) => void;
  updateTimelineEvent: (id: string, c: Partial<TimelineEvent>) => void;
  deleteTimelineEvent: (id: string) => void;

  addInbox: (c: Omit<InboxItem, "id" | "createdAt" | "uploadOrder" | "storyOrder">) => void;
  updateInbox: (id: string, c: Partial<InboxItem>) => void;
  deleteInbox: (id: string) => void;
  reorderInbox: (projectId: string, ids: string[]) => void;

  addPathway: (c: Omit<PathwayCard, "id" | "createdAt">) => void;
  updatePathway: (id: string, c: Partial<PathwayCard>) => void;
  deletePathway: (id: string) => void;

  log: (entry: Omit<ChangeLog, "id" | "timestamp">) => void;
  restoreFromTrash: (id: string) => void;
  emptyTrash: () => void;
  seedDemo: () => void;
}

const now = () => Date.now();

const DEMO_PROJECT_ID = "demo-alice";

function buildSeed(): Partial<State> {
  const pid = DEMO_PROJECT_ID;
  const u = (n = 0) => now() - n * 60_000;

  const project: Project = {
    id: pid,
    title: "Alice in Wonderland",
    summary:
      "Alice in Wonderland is a whimsical fantasy story about a curious girl who falls into a strange underground world filled with impossible logic, talking animals, royal nonsense, riddles, strange rules, and dreamlike adventures.",
    tone: "Whimsical, surreal, playful, strange, curious, dreamlike, lightly chaotic, and magical.",
    setting: "Wonderland — a dreamlike subterranean realm where logic bends and tea is always brewing.",
    genre: "Whimsical Fantasy",
    pinned: true,
    updatedAt: now(),
    collaborators: ["You", "Lewis C."],
  };

  const characters: Character[] = [
    ["Alice", "Protagonist", "A curious young girl who falls into Wonderland."],
    ["White Rabbit", "Catalyst", "An anxious, well-dressed rabbit always running late."],
    ["Cheshire Cat", "Trickster Guide", "A grinning cat who appears and vanishes at will."],
    ["Mad Hatter", "Companion", "Eccentric host of an endless tea party."],
    ["March Hare", "Companion", "The Hatter's equally mad tea party partner."],
    ["Queen of Hearts", "Antagonist", "A volatile monarch fond of shouting 'Off with their heads!'"],
  ].map(([name, role, description]) => ({
    id: nanoid(), projectId: pid, name, role, description,
    tags: [], status: "canon" as const, updatedAt: u(),
  }));

  const locations: Location[] = [
    ["Wonderland", "The dreamlike realm beneath the rabbit hole."],
    ["Rabbit Hole", "The strange, endless tunnel Alice falls through."],
    ["Mad Tea Party", "An eternal tea party with no end and no rules."],
    ["Queen's Garden", "A garden of painted roses and playing-card gardeners."],
    ["Courtroom", "The chaotic court where Alice is put on trial."],
  ].map(([name, description]) => ({
    id: nanoid(), projectId: pid, name, description, tags: [],
    status: "canon" as const, updatedAt: u(),
  }));

  const factions: Faction[] = [
    ["Queen's Court", "The ruling court of Wonderland, ruled by the Queen of Hearts."],
    ["Playing Card Soldiers", "Living cards that serve the Queen as soldiers and gardeners."],
  ].map(([name, description]) => ({
    id: nanoid(), projectId: pid, name, description,
    status: "canon" as const, updatedAt: u(),
  }));

  const glossary: GlossaryTerm[] = [
    ["Wonderland", "The magical underground realm Alice falls into.", "Place"],
    ["Down the Rabbit Hole", "An idiom for entering a strange, immersive situation.", "Idiom"],
    ["Curiouser and Curiouser", "Alice's signature phrase for increasing strangeness.", "Slang"],
    ["Mad Tea Party", "An infinite tea gathering hosted by the Hatter.", "Event"],
    ["Queen of Hearts", "The volatile ruler of Wonderland's court.", "Title"],
  ].map(([term, definition, category]) => ({
    id: nanoid(), projectId: pid, term, definition, category,
    status: "canon" as const, updatedAt: u(),
  }));

  const timeline: TimelineEvent[] = [
    "Alice follows the White Rabbit",
    "Alice falls down the rabbit hole",
    "Alice enters Wonderland",
    "Alice attends the Mad Tea Party",
    "Alice meets the Queen of Hearts",
    "Alice appears at the trial",
  ].map((title, i) => ({
    id: nanoid(), projectId: pid, title,
    description: title + ".",
    storyDate: `Day 1 — Scene ${i + 1}`,
    characters: ["Alice"], status: "canon" as const,
    order: i, updatedAt: u(),
  }));

  return {
    projects: [project],
    characters,
    locations,
    factions,
    glossary,
    timeline,
    inbox: [],
    pathways: [],
    changeLog: [{
      id: nanoid(), projectId: pid, user: "Demo", action: "seeded",
      itemType: "project", itemName: "Alice in Wonderland", timestamp: now(),
      notes: "Demo data loaded.",
    }],
    trash: [],
    currentProjectId: pid,
  };
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      theme: "dark",
      currentProjectId: null,
      projects: [],
      characters: [],
      locations: [],
      factions: [],
      glossary: [],
      timeline: [],
      inbox: [],
      pathways: [],
      changeLog: [],
      customCategories: [],
      loreEntries: [],
      trash: [],

      addCustomCategory: (c) => {
        const item: CustomCategory = { ...c, id: nanoid(), createdAt: now() };
        set((s) => ({ customCategories: [...s.customCategories, item] }));
        return item;
      },
      deleteCustomCategory: (id) => set((s) => ({
        customCategories: s.customCategories.filter(x => x.id !== id),
      })),

      addLoreEntry: (c) => set((s) => ({
        loreEntries: [...s.loreEntries, { ...c, id: nanoid(), updatedAt: now() }],
      })),
      updateLoreEntry: (id, c) => set((s) => ({
        loreEntries: s.loreEntries.map(x => x.id === id ? { ...x, ...c, updatedAt: now() } : x),
      })),
      deleteLoreEntry: (id) => set((s) => {
        const item = s.loreEntries.find(x => x.id === id); if (!item) return s;
        return {
          loreEntries: s.loreEntries.filter(x => x.id !== id),
          trash: [...s.trash, { id: nanoid(), type: "lore", name: item.name, data: item, deletedAt: now(), projectId: item.projectId }],
        };
      }),

      setTheme: (theme) => set({ theme }),
      setCurrentProject: (id) => set({ currentProjectId: id }),

      addProject: (p) => {
        const id = nanoid();
        set((s) => ({
          projects: [...s.projects, { ...p, id, updatedAt: now(), collaborators: ["You"] }],
          currentProjectId: id,
        }));
        get().log({ projectId: id, user: "You", action: "created", itemType: "project", itemName: p.title });
        return id;
      },
      updateProject: (id, p) => set((s) => ({
        projects: s.projects.map(x => x.id === id ? { ...x, ...p, updatedAt: now() } : x),
      })),
      deleteProject: (id) => set((s) => {
        const proj = s.projects.find(p => p.id === id);
        if (!proj) return s;
        return {
          projects: s.projects.filter(p => p.id !== id),
          trash: [...s.trash, { id: nanoid(), type: "project", name: proj.title, data: proj, deletedAt: now(), projectId: id }],
          currentProjectId: s.currentProjectId === id ? (s.projects.find(p => p.id !== id)?.id ?? null) : s.currentProjectId,
        };
      }),

      addCharacter: (c) => set((s) => ({ characters: [...s.characters, { ...c, id: nanoid(), updatedAt: now() }] })),
      updateCharacter: (id, c) => set((s) => ({
        characters: s.characters.map(x => x.id === id ? { ...x, ...c, updatedAt: now() } : x),
      })),
      deleteCharacter: (id) => set((s) => {
        const item = s.characters.find(x => x.id === id); if (!item) return s;
        return {
          characters: s.characters.filter(x => x.id !== id),
          trash: [...s.trash, { id: nanoid(), type: "character", name: item.name, data: item, deletedAt: now(), projectId: item.projectId }],
        };
      }),

      addLocation: (c) => set((s) => ({ locations: [...s.locations, { ...c, id: nanoid(), updatedAt: now() }] })),
      updateLocation: (id, c) => set((s) => ({
        locations: s.locations.map(x => x.id === id ? { ...x, ...c, updatedAt: now() } : x),
      })),
      deleteLocation: (id) => set((s) => {
        const item = s.locations.find(x => x.id === id); if (!item) return s;
        return {
          locations: s.locations.filter(x => x.id !== id),
          trash: [...s.trash, { id: nanoid(), type: "location", name: item.name, data: item, deletedAt: now(), projectId: item.projectId }],
        };
      }),

      addFaction: (c) => set((s) => ({ factions: [...s.factions, { ...c, id: nanoid(), updatedAt: now() }] })),
      deleteFaction: (id) => set((s) => ({ factions: s.factions.filter(x => x.id !== id) })),

      addGlossary: (c) => set((s) => ({ glossary: [...s.glossary, { ...c, id: nanoid(), updatedAt: now() }] })),
      updateGlossary: (id, c) => set((s) => ({
        glossary: s.glossary.map(x => x.id === id ? { ...x, ...c, updatedAt: now() } : x),
      })),
      deleteGlossary: (id) => set((s) => {
        const item = s.glossary.find(x => x.id === id); if (!item) return s;
        return {
          glossary: s.glossary.filter(x => x.id !== id),
          trash: [...s.trash, { id: nanoid(), type: "glossary", name: item.term, data: item, deletedAt: now(), projectId: item.projectId }],
        };
      }),

      addTimelineEvent: (c) => set((s) => {
        const order = s.timeline.filter(t => t.projectId === c.projectId).length;
        return { timeline: [...s.timeline, { ...c, id: nanoid(), order, updatedAt: now() }] };
      }),
      updateTimelineEvent: (id, c) => set((s) => ({
        timeline: s.timeline.map(x => x.id === id ? { ...x, ...c, updatedAt: now() } : x),
      })),
      deleteTimelineEvent: (id) => set((s) => ({ timeline: s.timeline.filter(x => x.id !== id) })),

      addInbox: (c) => set((s) => {
        const max = s.inbox.filter(i => i.projectId === c.projectId).length;
        return {
          inbox: [...s.inbox, {
            ...c, id: nanoid(), createdAt: now(),
            uploadOrder: max, storyOrder: max,
          }],
        };
      }),
      updateInbox: (id, c) => set((s) => ({
        inbox: s.inbox.map(x => x.id === id ? { ...x, ...c } : x),
      })),
      deleteInbox: (id) => set((s) => ({ inbox: s.inbox.filter(x => x.id !== id) })),
      reorderInbox: (projectId, ids) => set((s) => ({
        inbox: s.inbox.map(item => {
          if (item.projectId !== projectId) return item;
          const idx = ids.indexOf(item.id);
          return idx >= 0 ? { ...item, storyOrder: idx } : item;
        }),
      })),

      addPathway: (c) => set((s) => ({ pathways: [...s.pathways, { ...c, id: nanoid(), createdAt: now() }] })),
      updatePathway: (id, c) => set((s) => ({
        pathways: s.pathways.map(x => x.id === id ? { ...x, ...c } : x),
      })),
      deletePathway: (id) => set((s) => ({ pathways: s.pathways.filter(x => x.id !== id) })),

      log: (entry) => set((s) => ({
        changeLog: [{ ...entry, id: nanoid(), timestamp: now() }, ...s.changeLog].slice(0, 500),
      })),
      restoreFromTrash: (id) => set((s) => {
        const item = s.trash.find(t => t.id === id);
        if (!item) return s;
        const trash = s.trash.filter(t => t.id !== id);
        switch (item.type) {
          case "character": return { trash, characters: [...s.characters, item.data] };
          case "location": return { trash, locations: [...s.locations, item.data] };
          case "glossary": return { trash, glossary: [...s.glossary, item.data] };
          case "project": return { trash, projects: [...s.projects, item.data] };
          default: return { trash };
        }
      }),
      emptyTrash: () => set({ trash: [] }),
      seedDemo: () => {
        const seed = buildSeed();
        set((s) => ({ ...s, ...seed }));
      },
    }),
    {
      name: "writers-assistant-store",
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state && state.projects.length === 0) {
          state.seedDemo();
        }
      },
    }
  )
);

export const useCurrentProject = () => {
  const { projects, currentProjectId } = useStore();
  return projects.find(p => p.id === currentProjectId) ?? projects[0] ?? null;
};
