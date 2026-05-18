'use client';

import { UploadButton } from '@uploadthing/react';
import { Check, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { UploadThingRouter } from '@/app/api/uploadthing/core';

interface TemplateEditFormProps {
  template: {
    id: string;
    name: string;
    templateName: string | null;
    description: string | null;
    location: string | null;
    imageUrl: string | null;
  };
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-xs font-light tracking-[0.25em] text-white/40 uppercase">{children}</label>;
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-red-900/25 bg-white/[0.03] px-4 py-2.5 text-sm font-light text-white/80 placeholder-white/20 transition-colors outline-none focus:border-red-700/50 focus:bg-white/[0.05]"
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none border border-red-900/25 bg-white/[0.03] px-4 py-2.5 text-sm font-light text-white/80 placeholder-white/20 transition-colors outline-none focus:border-red-700/50 focus:bg-white/[0.05]"
    />
  );
}

export default function TemplateEditForm({ template }: TemplateEditFormProps) {
  const router = useRouter();
  const [name, setName] = useState(template.name);
  const [templateName, setTemplateName] = useState(template.templateName ?? '');
  const [description, setDescription] = useState(template.description ?? '');
  const [location, setLocation] = useState(template.location ?? '');
  const [imageUrl, setImageUrl] = useState(template.imageUrl ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name.trim()) {
      setError('Event name is required.');
      return;
    }
    if (!templateName.trim()) {
      setError('Template name is required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      type UpdateResponse = { success: true; event: { id: string } } | { success: false; error: string };

      const res = await fetch(`/api/events/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          templateName: templateName.trim(),
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          imageUrl: imageUrl || undefined,
        }),
      });

      const json = (await res.json()) as UpdateResponse;
      if (!res.ok || !json.success) {
        setError(!json.success ? json.error : 'Something went wrong.');
        return;
      }

      router.push('/admin/templates');
      router.refresh();
    } catch {
      setError('Network error - please check your connection.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Label>Template Name *</Label>
        <Input value={templateName} onChange={setTemplateName} placeholder="e.g. Monthly Social Night" />
        <p className="mt-1.5 text-xs font-light text-white/20">
          Shown in the template picker when creating a new event.
        </p>
      </div>

      <div>
        <Label>Event Name *</Label>
        <Input value={name} onChange={setName} placeholder="The Dragonsong Vigil" />
        <p className="mt-1.5 text-xs font-light text-white/20">
          Pre-filled as the event name when this template is used.
        </p>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={setDescription}
          placeholder="What's happening? Who should come?"
          rows={5}
        />
      </div>

      <div>
        <Label>Location</Label>
        <Input value={location} onChange={setLocation} placeholder="Estate Yard, The Goblet" />
      </div>

      <div>
        <Label>Banner Image</Label>
        {imageUrl ? (
          <div className="relative h-40 w-full overflow-hidden border border-red-900/25">
            <img src={imageUrl} alt="Banner" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center border border-white/20 bg-black/60 text-white/60 transition-colors hover:bg-black/80 hover:text-white">
              <X className="h-3 w-3" strokeWidth={2} />
            </button>
          </div>
        ) : (
          <UploadButton<UploadThingRouter, 'eventBanner'>
            endpoint="eventBanner"
            onClientUploadComplete={(res) => {
              const url = res?.[0]?.ufsUrl;
              if (url) setImageUrl(url);
            }}
            onUploadError={(err) => setError(`Upload failed: ${err.message}`)}
            appearance={{
              container: 'flex flex-col items-start w-full',
              button:
                'w-full border border-red-900/30 bg-white/[0.03] px-4 py-2.5 text-xs font-light tracking-[0.2em] text-white/40 uppercase transition-colors hover:border-red-800/50 hover:bg-white/[0.05] hover:text-white/60 ut-uploading:opacity-50 ut-uploading:cursor-not-allowed',
              allowedContent: 'text-xs font-light text-white/20 mt-1.5',
            }}
            content={{
              button({ ready, isUploading }) {
                if (isUploading) return 'Uploading…';
                return ready ? 'Upload Banner' : 'Getting ready…';
              },
            }}
          />
        )}
      </div>

      {error && <p className="text-xs font-light text-red-400/80">{error}</p>}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="button"
          onClick={() => router.push('/admin/templates')}
          className="text-xs font-light tracking-[0.25em] text-white/25 uppercase transition-colors hover:text-white/50">
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={submitting}
          className="flex items-center gap-2 border border-red-700/60 bg-red-950/30 px-8 py-2.5 text-xs font-light tracking-[0.25em] text-red-300/90 uppercase transition-all hover:border-red-600/80 hover:bg-red-900/40 disabled:opacity-50">
          {submitting ? (
            <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} />
          ) : (
            <Check className="h-3 w-3" strokeWidth={2} />
          )}
          {submitting ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
