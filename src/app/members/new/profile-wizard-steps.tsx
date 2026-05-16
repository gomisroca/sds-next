'use client';

import { UploadButton } from '@uploadthing/react';
import type { Activity, Job, Playstyle } from 'generated/prisma';
import { X } from 'lucide-react';

import type { UploadThingRouter } from '@/app/api/uploadthing/core';
import { ACTIVITY_LABEL, JOB_META, PLAYSTYLE_META } from '@/utils/profile';

import type { ProfileFormData } from './types';

// ── Shared primitives ─────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-xs font-light tracking-[0.25em] text-white/40 uppercase">{children}</label>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-light text-red-400/80">{message}</p>;
}

function Input({
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full border border-red-900/25 bg-white/[0.03] px-4 py-2.5 text-sm font-light text-white/80 placeholder-white/20 transition-colors outline-none focus:border-red-700/50 focus:bg-white/[0.05]"
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full resize-none border border-red-900/25 bg-white/[0.03] px-4 py-2.5 text-sm font-light text-white/80 placeholder-white/20 transition-colors outline-none focus:border-red-700/50 focus:bg-white/[0.05]"
      />
      {maxLength && (
        <span className="absolute right-3 bottom-2.5 text-[10px] font-light text-white/15">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}

// ── Image upload field ────────────────────────────────────────────────────────
function ImageUploadField({
  label,
  value,
  onChange,
  endpoint,
  aspectClass,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  endpoint: 'profilePortrait' | 'profileBanner';
  aspectClass: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {value ? (
        <div className={`relative w-full overflow-hidden border border-red-900/25 ${aspectClass}`}>
          <img src={value} alt={label} className="h-full w-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center border border-white/20 bg-black/60 text-white/60 transition-colors hover:bg-black/80 hover:text-white">
            <X className="h-3 w-3" strokeWidth={2} />
          </button>
        </div>
      ) : (
        <UploadButton<UploadThingRouter, typeof endpoint>
          endpoint={endpoint}
          onClientUploadComplete={(res) => {
            const url = res?.[0]?.ufsUrl;
            if (url) onChange(url);
          }}
          onUploadError={(err) => console.error('Upload error:', err)}
          appearance={{
            container: 'flex flex-col items-start w-full',
            button:
              'w-full border border-red-900/30 bg-white/[0.03] px-4 py-2.5 text-xs font-light tracking-[0.2em] text-white/40 uppercase transition-colors hover:border-red-800/50 hover:bg-white/[0.05] hover:text-white/60 ut-uploading:opacity-50 ut-uploading:cursor-not-allowed',
            allowedContent: 'text-xs font-light text-white/20 mt-1.5',
          }}
          content={{
            button({ ready, isUploading }) {
              if (isUploading) return 'Uploading…';
              return ready ? `Upload ${label}` : 'Getting ready…';
            },
          }}
        />
      )}
    </div>
  );
}

// ── Step 1: Identity ──────────────────────────────────────────────────────────
export function StepIdentity({
  data,
  errors,
  onChange,
}: {
  data: ProfileFormData;
  errors: Partial<Record<keyof ProfileFormData, string>>;
  onChange: (patch: Partial<ProfileFormData>) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Label>Character Name *</Label>
        <Input
          value={data.name}
          onChange={(v) => onChange({ name: v })}
          placeholder="Firstname Lastname"
          maxLength={100}
        />
        <FieldError message={errors.name} />
      </div>
      <div>
        <Label>Bio</Label>
        <Textarea
          value={data.bio}
          onChange={(v) => onChange({ bio: v })}
          placeholder="Tell the FC a little about yourself and your character…"
          rows={5}
          maxLength={500}
        />
      </div>
    </div>
  );
}

// ── Step 2: Gameplay ──────────────────────────────────────────────────────────
// Jobs grouped by role for a cleaner picker
const JOB_GROUPS: { label: string; jobs: Job[] }[] = [
  { label: 'Tank', jobs: ['PLD', 'WAR', 'DRK', 'GNB'] },
  { label: 'Healer', jobs: ['WHM', 'SCH', 'AST', 'SGE'] },
  { label: 'Melee', jobs: ['MNK', 'DRG', 'NIN', 'SAM', 'RPR', 'VPR'] },
  { label: 'Ranged', jobs: ['BRD', 'MCH', 'DNC'] },
  { label: 'Caster', jobs: ['BLM', 'SMN', 'RDM', 'PCT', 'BLU'] },
  { label: 'Crafter', jobs: ['CRP', 'BSM', 'ARM', 'GSM', 'LTW', 'WVR', 'ALC', 'CUL'] },
  { label: 'Gatherer', jobs: ['MIN', 'BTN', 'FSH'] },
];

const PLAYSTYLE_ORDER: Playstyle[] = ['CASUAL', 'MIDCORE', 'HARDCORE', 'ROLEPLAYER', 'SOCIAL', 'COLLECTOR'];

// Activity groups for multi-select
const ACTIVITY_GROUPS: { label: string; activities: Activity[] }[] = [
  {
    label: 'Combat',
    activities: [
      'RAIDING',
      'SAVAGE',
      'ULTIMATE',
      'EXTREME_TRIALS',
      'DUNGEONS',
      'ALLIANCE_RAIDS',
      'DEEP_DUNGEONS',
      'VARIANT_DUNGEONS',
      'CRITERION_DUNGEONS',
      'HUNTS',
      'FATES',
    ],
  },
  { label: 'PvP', activities: ['PVP', 'FRONTLINE', 'CRYSTALLINE_CONFLICT', 'RIVAL_WINGS'] },
  { label: 'Social', activities: ['ROLEPLAY', 'VENUES', 'COMMUNITY_EVENTS', 'FC_EVENTS', 'SOCIALIZING', 'GPOSE'] },
  { label: 'Casual', activities: ['MSQ', 'SIDE_QUESTS', 'TREASURE_MAPS', 'ACHIEVEMENTS', 'COLLECTION', 'ROULETTES'] },
  { label: 'Crafting & Gathering', activities: ['CRAFTING', 'GATHERING', 'FISHING', 'MARKETBOARD', 'BLUE_MAGE'] },
  { label: 'Gold Saucer', activities: ['GOLD_SAUCER', 'TRIPLE_TRIAD', 'MAHJONG', 'CHOCOBO_RACING'] },
  { label: 'Housing & Island', activities: ['HOUSING', 'ISLAND_SANCTUARY'] },
  { label: 'Misc', activities: ['MENTORING', 'GLAMOUR'] },
];

export function StepGameplay({
  data,
  errors,
  onChange,
}: {
  data: ProfileFormData;
  errors: Partial<Record<keyof ProfileFormData, string>>;
  onChange: (patch: Partial<ProfileFormData>) => void;
}) {
  function toggleActivity(act: Activity) {
    const current = data.activities;
    onChange({
      activities: current.includes(act) ? current.filter((a) => a !== act) : [...current, act],
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Main job */}
      <div>
        <Label>Main Job *</Label>
        <FieldError message={errors.job} />
        <div className="mt-2 flex flex-col gap-3">
          {JOB_GROUPS.map(({ label, jobs }) => (
            <div key={label}>
              <p className="mb-2 text-[10px] font-light tracking-[0.2em] text-white/20 uppercase">{label}</p>
              <div className="flex flex-wrap gap-2">
                {jobs.map((job) => {
                  const meta = JOB_META[job];
                  const selected = data.job === job;
                  return (
                    <div key={job} className="group relative">
                      <button
                        type="button"
                        onClick={() => onChange({ job })}
                        className={`border px-3 py-1 text-xs font-light tracking-[0.15em] uppercase transition-all duration-150 ${
                          selected
                            ? `${meta.bg} ${meta.color} border-current/30`
                            : 'border-red-900/20 bg-white/[0.02] text-white/30 hover:border-red-900/40 hover:text-white/50'
                        }`}>
                        <img src={`/job-icons/${meta.label}.png`} alt={meta.label} className="h-8 w-8 rounded-full" />
                      </button>

                      {/* Tooltip */}
                      <div className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                        <div className="border border-red-700/50 bg-red-950/60 px-2 py-1 text-[10px] tracking-[0.15em] whitespace-nowrap text-white/80 uppercase shadow-lg">
                          {meta.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Playstyle */}
      <div>
        <Label>Playstyle *</Label>
        <FieldError message={errors.playstyle} />
        <div className="mt-2 flex flex-wrap gap-2">
          {PLAYSTYLE_ORDER.map((ps) => {
            const meta = PLAYSTYLE_META[ps];
            const selected = data.playstyle === ps;
            return (
              <button
                key={ps}
                type="button"
                onClick={() => onChange({ playstyle: ps })}
                className={`border px-4 py-1.5 text-xs font-light tracking-[0.2em] uppercase transition-all duration-150 ${
                  selected
                    ? `${meta.bg} ${meta.color} border-current/30`
                    : 'border-red-900/20 bg-white/[0.02] text-white/30 hover:border-red-900/40 hover:text-white/50'
                }`}>
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Activities */}
      <div>
        <Label>
          Activities <span className="tracking-normal text-white/20 normal-case">(pick all that apply)</span>
        </Label>
        <div className="mt-2 flex flex-col gap-4">
          {ACTIVITY_GROUPS.map(({ label, activities }) => (
            <div key={label}>
              <p className="mb-2 text-[10px] font-light tracking-[0.2em] text-white/20 uppercase">{label}</p>
              <div className="flex flex-wrap gap-2">
                {activities.map((act) => {
                  const selected = data.activities.includes(act);
                  return (
                    <button
                      key={act}
                      type="button"
                      onClick={() => toggleActivity(act)}
                      className={`border px-2.5 py-1 text-xs font-light tracking-wide transition-all duration-150 ${
                        selected
                          ? 'border-red-700/50 bg-red-950/30 text-red-300/80'
                          : 'border-red-900/20 bg-white/[0.02] text-white/30 hover:border-red-900/40 hover:text-white/50'
                      }`}>
                      {ACTIVITY_LABEL[act]}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Visuals ───────────────────────────────────────────────────────────

export function StepVisuals({
  data,
  onChange,
}: {
  data: ProfileFormData;
  onChange: (patch: Partial<ProfileFormData>) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm font-light text-white/40">Both images are optional — you can always add them later.</p>

      <ImageUploadField
        label="Portrait"
        value={data.portrait}
        onChange={(v) => onChange({ portrait: v })}
        endpoint="profilePortrait"
        aspectClass="h-64"
      />

      <ImageUploadField
        label="Banner"
        value={data.banner}
        onChange={(v) => onChange({ banner: v })}
        endpoint="profileBanner"
        aspectClass="h-36"
      />
    </div>
  );
}
