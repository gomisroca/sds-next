'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Check, MapPin } from 'lucide-react';

import { FieldError, Input, Label, Textarea } from './form-fields';
import type { FormData } from './types';

// ── Step 1: Details ───────────────────────────────────────────────────────────
export function StepDetails({
  data,
  errors,
  onChange,
}: {
  data: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  onChange: (patch: Partial<FormData>) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Label>Event Name *</Label>
        <Input value={data.name} onChange={(v) => onChange({ name: v })} placeholder="The Dragonsong Vigil" required />
        <FieldError message={errors.name} />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={data.description}
          onChange={(v) => onChange({ description: v })}
          placeholder="What's happening? Who should come? What should they bring?"
          rows={5}
        />
      </div>
      <div>
        <Label>Location</Label>
        <Input
          value={data.location}
          onChange={(v) => onChange({ location: v })}
          placeholder="Estate Yard, The Goblet"
        />
      </div>
      <div>
        <Label>Banner Image URL</Label>
        <Input value={data.imageUrl} onChange={(v) => onChange({ imageUrl: v })} placeholder="https://..." type="url" />
        <p className="mt-1.5 text-xs font-light text-white/20">Optional - shown on the event detail page.</p>
      </div>
    </div>
  );
}

// ── Step 2: Time ──────────────────────────────────────────────────────────────
export function StepTime({
  data,
  errors,
  onChange,
}: {
  data: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  onChange: (patch: Partial<FormData>) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Label>Start Date *</Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input type="date" value={data.startsAtDate} onChange={(v) => onChange({ startsAtDate: v })} required />
            <FieldError message={errors.startsAtDate} />
          </div>
          <Input type="time" value={data.startsAtTime} onChange={(v) => onChange({ startsAtTime: v })} />
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange({ hasEndTime: !data.hasEndTime })}
            className={`flex h-5 w-5 items-center justify-center border transition-all duration-200 ${
              data.hasEndTime
                ? 'border-red-700/60 bg-red-950/40 text-red-400'
                : 'border-red-900/25 bg-white/[0.02] text-transparent'
            }`}>
            <Check className="h-3 w-3" strokeWidth={2} />
          </button>
          <Label>Add end time</Label>
        </div>

        <AnimatePresence>
          {data.hasEndTime && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}>
              <div className="grid grid-cols-2 gap-3">
                <Input type="date" value={data.endsAtDate} onChange={(v) => onChange({ endsAtDate: v })} />
                <Input type="time" value={data.endsAtTime} onChange={(v) => onChange({ endsAtTime: v })} />
              </div>
              <FieldError message={errors.endsAtDate} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {data.startsAtDate && (
        <div className="border border-red-900/20 bg-white/[0.02] p-4">
          <p className="mb-1 text-xs font-light tracking-[0.2em] text-white/25 uppercase">Preview</p>
          <p className="text-sm font-light text-white/60">
            {new Date(`${data.startsAtDate}T${data.startsAtTime}`).toLocaleString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {data.hasEndTime && data.endsAtDate && (
              <span className="text-white/30">
                {' '}
                →{' '}
                {new Date(`${data.endsAtDate}T${data.endsAtTime}`).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Step 3: Publish ───────────────────────────────────────────────────────────
export function StepPublish({ data, onChange }: { data: FormData; onChange: (patch: Partial<FormData>) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 border border-red-900/20 bg-white/[0.02] p-5">
        <p className="text-xs font-light tracking-[0.25em] text-white/25 uppercase">Summary</p>
        <h3 className="text-xl font-light text-white/80">{data.name}</h3>
        {data.location && (
          <p className="flex items-center gap-2 text-sm font-light text-white/40">
            <MapPin className="h-3 w-3" strokeWidth={1.5} /> {data.location}
          </p>
        )}
        {data.startsAtDate && (
          <p className="flex items-center gap-2 text-sm font-light text-white/40">
            <Calendar className="h-3 w-3" strokeWidth={1.5} />
            {new Date(`${data.startsAtDate}T${data.startsAtTime}`).toLocaleString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
        {data.description && (
          <p className="line-clamp-3 text-sm leading-relaxed font-light text-white/40">{data.description}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-light tracking-[0.25em] text-white/30 uppercase">Discord</p>
        {([true, false] as const).map((isPublish) => {
          const selected = data.publishNow === isPublish;
          return (
            <button
              key={String(isPublish)}
              type="button"
              onClick={() => onChange({ publishNow: isPublish })}
              className={`flex items-start gap-4 border p-4 text-left transition-all duration-200 ${
                selected
                  ? 'border-red-700/50 bg-red-950/25'
                  : 'border-red-900/20 bg-white/[0.02] hover:border-red-900/40'
              }`}>
              <div
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border transition-colors ${selected ? 'border-red-600/70 bg-red-900/40' : 'border-red-900/30'}`}>
                {selected && <div className="h-1.5 w-1.5 bg-red-500" />}
              </div>
              <div>
                <p
                  className={`text-sm font-light tracking-wide transition-colors ${selected ? 'text-white/80' : 'text-white/40'}`}>
                  {isPublish ? 'Publish now' : 'Save as draft'}
                </p>
                <p className="mt-0.5 text-xs font-light text-white/25">
                  {isPublish
                    ? 'Posts to the Discord channel immediately and opens RSVPs.'
                    : 'Saves the event privately. You can publish it later.'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
