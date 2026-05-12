import {
  Users, MapPin, Flag, Heart, BookMarked, Sun, Wand2, Shield, Cog, Cpu,
  History, Boxes, MessageSquareQuote, Languages, Swords, HelpCircle,
  GitBranch, UserCircle2, BookOpen, Film, RefreshCw, AlertTriangle,
  Globe, Library, Crown, Skull, Sparkles, Feather, Anchor, Ship,
  Trees, Mountain, Castle, Home, Music, Coins, Scroll, Eye, Star,
  Compass, Key, Gem, Flame, Snowflake, Cloud, Bird, Cat, Dog,
  Beaker, Microscope, Rocket, Atom, Brain, Zap, Mic2, Palette,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  Users, MapPin, Flag, Heart, BookMarked, Sun, Wand2, Shield, Cog, Cpu,
  History, Boxes, MessageSquareQuote, Languages, Swords, HelpCircle,
  GitBranch, UserCircle2, BookOpen, Film, RefreshCw, AlertTriangle,
  Globe, Library, Crown, Skull, Sparkles, Feather, Anchor, Ship,
  Trees, Mountain, Castle, Home, Music, Coins, Scroll, Eye, Star,
  Compass, Key, Gem, Flame, Snowflake, Cloud, Bird, Cat, Dog,
  Beaker, Microscope, Rocket, Atom, Brain, Zap, Mic2, Palette,
};

const RULES: Array<[RegExp, keyof typeof ICONS]> = [
  [/character|cast|person|people|hero|villain/i, "Users"],
  [/family|families|kin|house|clan|bloodline/i, "Heart"],
  [/heritage|lineage|ancestry|culture/i, "BookMarked"],
  [/faith|religion|deity|god|ritual|prayer|temple/i, "Sun"],
  [/magic|power|spell|arcane|sorcery/i, "Wand2"],
  [/location|place|city|town|region|land/i, "MapPin"],
  [/world|realm|map|geography/i, "Globe"],
  [/faction|guild|order|court|clan/i, "Flag"],
  [/ship|fleet|navy|sail/i, "Ship"],
  [/forest|tree|wood|jungle/i, "Trees"],
  [/mountain|peak|highland/i, "Mountain"],
  [/castle|fort|keep|palace/i, "Castle"],
  [/king|queen|royal|throne|monarch/i, "Crown"],
  [/death|war|battle|fight/i, "Swords"],
  [/sword|weapon|arms/i, "Swords"],
  [/curse|ghost|spirit|skull|undead/i, "Skull"],
  [/prophecy|oracle|vision|dream/i, "Eye"],
  [/star|cosmos|astro|celestial/i, "Star"],
  [/glossary|term|word|vocab|slang|language/i, "Languages"],
  [/quote|saying|idiom|phrase/i, "MessageSquareQuote"],
  [/object|item|artifact|relic|tool/i, "Boxes"],
  [/treasure|coin|wealth|money|gold/i, "Coins"],
  [/scroll|letter|document|note/i, "Scroll"],
  [/key|secret|hidden/i, "Key"],
  [/gem|jewel|crystal/i, "Gem"],
  [/fire|flame|burn|ember/i, "Flame"],
  [/ice|snow|frost|cold/i, "Snowflake"],
  [/sky|cloud|storm|wind/i, "Cloud"],
  [/bird|raven|owl|eagle/i, "Bird"],
  [/cat|feline/i, "Cat"],
  [/dog|wolf|hound/i, "Dog"],
  [/potion|alchemy|brew|elixir/i, "Beaker"],
  [/science|study|research/i, "Microscope"],
  [/space|ship|rocket|launch/i, "Rocket"],
  [/atom|element|particle/i, "Atom"],
  [/mind|thought|memory|psychic/i, "Brain"],
  [/lightning|thunder|electric|spark/i, "Zap"],
  [/song|music|sing|bard/i, "Music"],
  [/art|paint|color/i, "Palette"],
  [/tech|machine|engine|device/i, "Cpu"],
  [/system|rule|law/i, "Cog"],
  [/shield|protect|guard|defense/i, "Shield"],
  [/history|past|chronicle|era/i, "History"],
  [/conflict|tension|rivalry/i, "Swords"],
  [/question|mystery|unknown/i, "HelpCircle"],
  [/arc|plot|thread/i, "GitBranch"],
  [/chapter|book|story/i, "BookOpen"],
  [/scene|act|sequence/i, "Film"],
  [/retcon|revision|change/i, "RefreshCw"],
  [/continuity|consistency|warning/i, "AlertTriangle"],
  [/compass|direction|navigate/i, "Compass"],
  [/library|archive|record/i, "Library"],
  [/anchor|harbor|port/i, "Anchor"],
  [/home|family/i, "Home"],
];

/** Pick an icon name based on category name keywords. */
export function pickIconKey(name: string): string {
  for (const [re, key] of RULES) {
    if (re.test(name)) return key;
  }
  return "Sparkles";
}

export function getIcon(key: string | undefined): LucideIcon {
  if (!key) return Sparkles;
  return ICONS[key] ?? Sparkles;
}

export function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
