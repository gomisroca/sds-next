import type { Activity, Job, Playstyle, Role } from 'generated/prisma';

// ── Job metadata ──────────────────────────────────────────────────────────────
export type JobRole = 'Tank' | 'Healer' | 'Melee' | 'Ranged' | 'Caster' | 'Crafter' | 'Gatherer';

interface JobMeta {
  label: string;
  role: JobRole;
  color: string; // tailwind text colour
  bg: string; // tailwind bg colour
}

export const JOB_META: Record<Job, JobMeta> = {
  // Tanks
  PLD: { label: 'Paladin', role: 'Tank', color: 'text-sky-300/80', bg: 'bg-sky-900/30' },
  WAR: { label: 'Warrior', role: 'Tank', color: 'text-sky-300/80', bg: 'bg-sky-900/30' },
  DRK: { label: 'Dark Knight', role: 'Tank', color: 'text-sky-300/80', bg: 'bg-sky-900/30' },
  GNB: { label: 'Gunbreaker', role: 'Tank', color: 'text-sky-300/80', bg: 'bg-sky-900/30' },
  // Healers
  WHM: { label: 'White Mage', role: 'Healer', color: 'text-emerald-300/80', bg: 'bg-emerald-900/30' },
  SCH: { label: 'Scholar', role: 'Healer', color: 'text-emerald-300/80', bg: 'bg-emerald-900/30' },
  AST: { label: 'Astrologian', role: 'Healer', color: 'text-emerald-300/80', bg: 'bg-emerald-900/30' },
  SGE: { label: 'Sage', role: 'Healer', color: 'text-emerald-300/80', bg: 'bg-emerald-900/30' },
  // Melee
  MNK: { label: 'Monk', role: 'Melee', color: 'text-orange-300/80', bg: 'bg-orange-900/30' },
  DRG: { label: 'Dragoon', role: 'Melee', color: 'text-orange-300/80', bg: 'bg-orange-900/30' },
  NIN: { label: 'Ninja', role: 'Melee', color: 'text-orange-300/80', bg: 'bg-orange-900/30' },
  SAM: { label: 'Samurai', role: 'Melee', color: 'text-orange-300/80', bg: 'bg-orange-900/30' },
  RPR: { label: 'Reaper', role: 'Melee', color: 'text-orange-300/80', bg: 'bg-orange-900/30' },
  VPR: { label: 'Viper', role: 'Melee', color: 'text-orange-300/80', bg: 'bg-orange-900/30' },
  // Ranged
  BRD: { label: 'Bard', role: 'Ranged', color: 'text-yellow-300/80', bg: 'bg-yellow-900/30' },
  MCH: { label: 'Machinist', role: 'Ranged', color: 'text-yellow-300/80', bg: 'bg-yellow-900/30' },
  DNC: { label: 'Dancer', role: 'Ranged', color: 'text-yellow-300/80', bg: 'bg-yellow-900/30' },
  // Casters
  BLM: { label: 'Black Mage', role: 'Caster', color: 'text-purple-300/80', bg: 'bg-purple-900/30' },
  SMN: { label: 'Summoner', role: 'Caster', color: 'text-purple-300/80', bg: 'bg-purple-900/30' },
  RDM: { label: 'Red Mage', role: 'Caster', color: 'text-purple-300/80', bg: 'bg-purple-900/30' },
  PCT: { label: 'Pictomancer', role: 'Caster', color: 'text-purple-300/80', bg: 'bg-purple-900/30' },
  BLU: { label: 'Blue Mage', role: 'Caster', color: 'text-purple-300/80', bg: 'bg-purple-900/30' },
  // Crafters
  CRP: { label: 'Carpenter', role: 'Crafter', color: 'text-amber-300/80', bg: 'bg-amber-900/30' },
  BSM: { label: 'Blacksmith', role: 'Crafter', color: 'text-amber-300/80', bg: 'bg-amber-900/30' },
  ARM: { label: 'Armorer', role: 'Crafter', color: 'text-amber-300/80', bg: 'bg-amber-900/30' },
  GSM: { label: 'Goldsmith', role: 'Crafter', color: 'text-amber-300/80', bg: 'bg-amber-900/30' },
  LTW: { label: 'Leatherworker', role: 'Crafter', color: 'text-amber-300/80', bg: 'bg-amber-900/30' },
  WVR: { label: 'Weaver', role: 'Crafter', color: 'text-amber-300/80', bg: 'bg-amber-900/30' },
  ALC: { label: 'Alchemist', role: 'Crafter', color: 'text-amber-300/80', bg: 'bg-amber-900/30' },
  CUL: { label: 'Culinarian', role: 'Crafter', color: 'text-amber-300/80', bg: 'bg-amber-900/30' },
  // Gatherers
  MIN: { label: 'Miner', role: 'Gatherer', color: 'text-stone-300/80', bg: 'bg-stone-900/30' },
  BTN: { label: 'Botanist', role: 'Gatherer', color: 'text-stone-300/80', bg: 'bg-stone-900/30' },
  FSH: { label: 'Fisher', role: 'Gatherer', color: 'text-stone-300/80', bg: 'bg-stone-900/30' },
};

// ── Playstyle metadata ────────────────────────────────────────────────────────
interface PlaystyleMeta {
  label: string;
  color: string;
  bg: string;
}

export const PLAYSTYLE_META: Record<Playstyle, PlaystyleMeta> = {
  CASUAL: { label: 'Casual', color: 'text-green-300/80', bg: 'bg-green-900/25' },
  MIDCORE: { label: 'Midcore', color: 'text-yellow-300/80', bg: 'bg-yellow-900/25' },
  HARDCORE: { label: 'Hardcore', color: 'text-red-300/80', bg: 'bg-red-900/25' },
  ROLEPLAYER: { label: 'Roleplayer', color: 'text-pink-300/80', bg: 'bg-pink-900/25' },
  SOCIAL: { label: 'Social', color: 'text-sky-300/80', bg: 'bg-sky-900/25' },
  COLLECTOR: { label: 'Collector', color: 'text-purple-300/80', bg: 'bg-purple-900/25' },
};

// ── Role metadata ─────────────────────────────────────────────────────────────
export const ROLE_META: Record<Role, { label: string; color: string }> = {
  GUEST: { label: 'Guest', color: 'text-white/30' },
  MEMBER: { label: 'Member', color: 'text-emerald-400/80' },
  OFFICER: { label: 'Officer', color: 'text-red-400/80' },
  LEADER: { label: 'Leader', color: 'text-yellow-400/80' },
};

// ── Activity labels ───────────────────────────────────────────────────────────
export const ACTIVITY_LABEL: Record<Activity, string> = {
  RAIDING: 'Raiding',
  SAVAGE: 'Savage',
  ULTIMATE: 'Ultimate',
  EXTREME_TRIALS: 'Extreme Trials',
  DUNGEONS: 'Dungeons',
  ALLIANCE_RAIDS: 'Alliance Raids',
  DEEP_DUNGEONS: 'Deep Dungeons',
  VARIANT_DUNGEONS: 'Variant Dungeons',
  CRITERION_DUNGEONS: 'Criterion',
  PVP: 'PvP',
  FRONTLINE: 'Frontline',
  CRYSTALLINE_CONFLICT: 'Crystalline Conflict',
  RIVAL_WINGS: 'Rival Wings',
  HUNTS: 'Hunts',
  FATES: 'FATEs',
  BLUE_MAGE: 'Blue Mage',
  ROLEPLAY: 'Roleplay',
  VENUES: 'Venues',
  COMMUNITY_EVENTS: 'Community Events',
  FC_EVENTS: 'FC Events',
  SOCIALIZING: 'Socializing',
  GPOSE: 'GPose',
  MSQ: 'MSQ',
  SIDE_QUESTS: 'Side Quests',
  TREASURE_MAPS: 'Treasure Maps',
  ACHIEVEMENTS: 'Achievements',
  COLLECTION: 'Collection',
  CRAFTING: 'Crafting',
  GATHERING: 'Gathering',
  FISHING: 'Fishing',
  MARKETBOARD: 'Marketboard',
  GOLD_SAUCER: 'Gold Saucer',
  TRIPLE_TRIAD: 'Triple Triad',
  MAHJONG: 'Mahjong',
  CHOCOBO_RACING: 'Chocobo Racing',
  HOUSING: 'Housing',
  ISLAND_SANCTUARY: 'Island Sanctuary',
  MENTORING: 'Mentoring',
  ROULETTES: 'Roulettes',
  GLAMOUR: 'Glamour',
};
