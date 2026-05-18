'use client';

import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';

import type { SiteSettings } from '@/utils/settings';

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2">
      <label className="block text-xs font-light tracking-[0.25em] text-white/40 uppercase">{children}</label>
      {hint && <p className="mt-0.5 text-xs font-light text-white/20">{hint}</p>}
    </div>
  );
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

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <span className="text-[10px] font-light tracking-[0.3em] text-red-800/50 uppercase">{label}</span>
      <div className="h-px flex-1 bg-red-900/15" />
    </div>
  );
}

interface SettingsFormProps {
  initialSettings: SiteSettings;
  isLeader: boolean;
}

export default function SettingsForm({ initialSettings, isLeader }: SettingsFormProps) {
  const [form, setForm] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(update: Partial<SiteSettings>) {
    setForm((prev) => ({ ...prev, ...update }));
    setSaved(false);
  }

  async function handleSave() {
    if (!isLeader) return;
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      type SettingsResponse = { success: true } | { success: false; error: string };

      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const json = (await res.json()) as SettingsResponse;
      if (!res.ok || !json.success) {
        setError(!json.success ? json.error : 'Something went wrong.');
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Network error - please check your connection.');
    } finally {
      setSaving(false);
    }
  }

  const fieldProps = (disabled: boolean) => ({
    disabled,
    className: disabled ? 'opacity-50 pointer-events-none' : '',
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Identity */}
      <section className="flex flex-col gap-5">
        <SectionDivider label="Identity" />

        <div>
          <Label hint="Shown in the nav bar logo and page titles.">FC Name</Label>
          <Input
            value={form.fcName}
            onChange={(v) => patch({ fcName: v })}
            placeholder="Sleeping Dragons"
            maxLength={100}
          />
        </div>

        <div>
          <Label hint="The small line below the FC name in the nav bar (e.g. EU · Light · Phoenix).">Subtitle</Label>
          <Input
            value={form.subtitle}
            onChange={(v) => patch({ subtitle: v })}
            placeholder="EU · Light · Phoenix"
            maxLength={100}
          />
        </div>
      </section>

      {/* Homepage */}
      <section className="flex flex-col gap-5">
        <SectionDivider label="Homepage" />

        <div>
          <Label hint="The heading in the welcome section.">Welcome Title</Label>
          <Input
            value={form.welcomeTitle}
            onChange={(v) => patch({ welcomeTitle: v })}
            placeholder="Welcome, Warrior of Light"
            maxLength={100}
          />
        </div>

        <div>
          <Label hint="The paragraph below the welcome heading.">Welcome Text</Label>
          <Textarea
            value={form.welcomeText}
            onChange={(v) => patch({ welcomeText: v })}
            placeholder="Tell visitors about your Free Company…"
            rows={4}
            maxLength={1000}
          />
        </div>
      </section>

      {/* Discord */}
      <section className="flex flex-col gap-5">
        <SectionDivider label="Discord" />

        <div>
          <Label hint="Shown on the Join page as a direct join link.">Discord Invite Link</Label>
          <Input
            value={form.discordInvite ?? ''}
            onChange={(v) => patch({ discordInvite: v || null })}
            placeholder="https://discord.gg/..."
            maxLength={100}
          />
        </div>

        <div>
          <Label hint="The Discord channel ID where the bot posts event embeds.">Event Channel ID</Label>
          <Input
            value={form.eventChannelId ?? ''}
            onChange={(v) => patch({ eventChannelId: v || null })}
            placeholder="123456789012345678"
            maxLength={30}
          />
        </div>
      </section>

      {/* Actions */}
      {!isLeader && (
        <p className="text-xs font-light text-white/25 italic">
          Only leaders can save settings. You can view them but not edit.
        </p>
      )}

      {error && <p className="text-xs font-light text-red-400/80">{error}</p>}

      {isLeader && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 border border-red-700/60 bg-red-950/30 px-8 py-2.5 text-xs font-light tracking-[0.25em] text-red-300/90 uppercase transition-all hover:border-red-600/80 hover:bg-red-900/40 disabled:opacity-50">
            {saving ? (
              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} />
            ) : (
              <Check className="h-3 w-3" strokeWidth={2} />
            )}
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
          {saved && <span className="text-xs font-light tracking-widest text-emerald-400/70 uppercase">✓ Saved</span>}
        </div>
      )}
    </div>
  );
}
