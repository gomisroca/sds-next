'use client';

import { UploadButton } from '@uploadthing/react';
import type { Activity, Job, Playstyle } from 'generated/prisma';
import { X } from 'lucide-react';

import type { UploadThingRouter } from '@/app/api/uploadthing/core';
import type { ProfileFormData } from '@/app/members/profile-wizard/types';
import { ACTIVITY_LABEL, JOB_META, PLAYSTYLE_META } from '@/utils/profile';

// ── Shared primitives ─────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-xs font-light tracking-[0.25em] text-white/60 uppercase">{children}</label>;
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
        <span className="absolute right-3 bottom-2.5 text-[10px] font-light text-white/60">
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
            aria-label={`Remove ${label}`}
            className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center border border-white/20 bg-black/60 text-white/80">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <UploadButton<UploadThingRouter, typeof endpoint>
          endpoint={endpoint}
          onClientUploadComplete={(res) => {
            const url = res?.[0]?.ufsUrl;
            if (url) onChange(url);
          }}
          appearance={{
            container: 'flex flex-col items-start w-full',
            button:
              'w-full border border-red-900/30 bg-white/[0.03] px-4 py-2.5 text-xs font-light uppercase text-white/60 hover:text-white/90',
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

// ── STEP 1 ────────────────────────────────────────────────────────────────────
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
    <div data-testid="step-identity" className="flex flex-col gap-6">
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

// ── STEP 2 ────────────────────────────────────────────────────────────────────
export function StepGameplay({
  data,
  errors,
  onChange,
}: {
  data: ProfileFormData;
  errors: Partial<Record<keyof ProfileFormData, string>>;
  onChange: (patch: Partial<ProfileFormData>) => void;
}) {
  // Toggle handler for the activities array wrapper
  const toggleActivity = (activity: Activity) => {
    const current = data.activities || [];
    const updated = current.includes(activity) ? current.filter((a) => a !== activity) : [...current, activity];
    onChange({ activities: updated });
  };

  return (
    <div data-testid="step-gameplay" className="flex flex-col gap-8">
      {/* 1. Main Job Selection */}
      <div>
        <Label>Main Job *</Label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(JOB_META).map(([key, meta]) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ job: key as Job })}
              className={`border px-3 py-1.5 text-xs font-light transition-all ${
                data.job === key
                  ? 'border-red-700 bg-red-950/20 text-white'
                  : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20'
              }`}>
              {meta.label}
            </button>
          ))}
        </div>
        <FieldError message={errors.job} />
      </div>

      {/* 2. Playstyle Selection */}
      <div>
        <Label>Playstyle *</Label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PLAYSTYLE_META).map(([key, meta]) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ playstyle: key as Playstyle })}
              className={`border px-3 py-1.5 text-xs font-light transition-all ${
                data.playstyle === key
                  ? 'border-red-700 bg-red-950/20 text-white'
                  : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20'
              }`}>
              {meta.label}
            </button>
          ))}
        </div>
        <FieldError message={errors.playstyle} />
      </div>

      {/* 3. Activities Multi-Select Badges */}
      <div>
        <Label>Activities</Label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ACTIVITY_LABEL).map(([key, label]) => {
            const isSelected = data.activities?.includes(key as Activity);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleActivity(key as Activity)}
                className={`border px-3 py-1.5 text-xs font-light transition-all ${
                  isSelected
                    ? 'border-yellow-700 bg-yellow-950/20 text-yellow-500'
                    : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20'
                }`}>
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
// ── STEP 3 ────────────────────────────────────────────────────────────────────
export function StepVisuals({
  data,
  onChange,
}: {
  data: ProfileFormData;
  onChange: (patch: Partial<ProfileFormData>) => void;
}) {
  return (
    <div data-testid="step-visuals" className="flex flex-col gap-8">
      <p className="text-sm font-light text-white/60">Both images are optional - you can always add them later.</p>

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
