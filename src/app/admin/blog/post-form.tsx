'use client';

import { UploadButton } from '@uploadthing/react';
import { Check, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { UploadThingRouter } from '@/app/api/uploadthing/core';
import RichTextEditor from '@/app/components/ui/rich-text-editor';

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
  rows = 3,
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

export interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: Record<string, unknown>;
  coverImage: string;
  published: boolean;
}

interface PostFormProps {
  mode: 'create' | 'edit';
  postId?: string;
  initialData?: Partial<PostFormData>;
}

type PostResponse = { success: true; post: { id: string; slug: string } } | { success: false; error: string };

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function PostForm({ mode, postId, initialData }: PostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '');
  const [content, setContent] = useState<Record<string, unknown>>(initialData?.content ?? {});
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? '');
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugManuallyEdited) setSlug(slugify(value));
  }

  async function handleSave(publish?: boolean) {
    const shouldPublish = publish ?? published;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(mode === 'create' ? '/api/blog' : `/api/blog/${postId}`, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim() || undefined,
          content,
          coverImage: coverImage || undefined,
          published: shouldPublish,
        }),
      });

      const json = (await res.json()) as PostResponse;
      if (!res.ok || !json.success) {
        setError(!json.success ? json.error : 'Something went wrong.');
        return;
      }

      router.push('/admin/blog');
      router.refresh();
    } catch {
      setError('Network error — please check your connection.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Title */}
      <div>
        <Label>Title *</Label>
        <Input value={title} onChange={handleTitleChange} placeholder="A Merry Starlight Celebration" maxLength={200} />
      </div>

      {/* Slug */}
      <div>
        <Label hint="Used in the URL: /blog/your-slug. Lowercase letters, numbers and hyphens only.">Slug *</Label>
        <Input
          value={slug}
          onChange={(v) => {
            setSlug(v);
            setSlugManuallyEdited(true);
          }}
          placeholder="a-merry-starlight-celebration"
          maxLength={200}
        />
      </div>

      {/* Excerpt */}
      <div>
        <Label hint="Short summary shown in the blog listing and on the homepage card.">Excerpt</Label>
        <Textarea value={excerpt} onChange={setExcerpt} placeholder="A short summary of the post…" rows={2} />
      </div>

      {/* Cover image */}
      <div>
        <Label hint="Optional banner image shown at the top of the post.">Cover Image</Label>
        {coverImage ? (
          <div className="relative h-40 w-full overflow-hidden border border-red-900/25">
            <img src={coverImage} alt="Cover" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <button
              type="button"
              onClick={() => setCoverImage('')}
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center border border-white/20 bg-black/60 text-white/60 hover:bg-black/80 hover:text-white">
              <X className="h-3 w-3" strokeWidth={2} />
            </button>
          </div>
        ) : (
          <UploadButton<UploadThingRouter, 'eventBanner'>
            endpoint="eventBanner"
            onClientUploadComplete={(res) => {
              const url = res?.[0]?.ufsUrl;
              if (url) setCoverImage(url);
            }}
            onUploadError={(err) => setError(`Upload failed: ${err.message}`)}
            appearance={{
              container: 'flex flex-col items-start w-full',
              button:
                'w-full border border-red-900/30 bg-white/[0.03] px-4 py-2.5 text-xs font-light tracking-[0.2em] text-white/40 uppercase transition-colors hover:border-red-800/50 hover:text-white/60 ut-uploading:opacity-50',
              allowedContent: 'text-xs font-light text-white/20 mt-1.5',
            }}
            content={{
              button({ ready, isUploading }) {
                if (isUploading) return 'Uploading…';
                return ready ? 'Upload Cover Image' : 'Getting ready…';
              },
            }}
          />
        )}
      </div>

      {/* Content */}
      <div>
        <Label>Content</Label>
        <RichTextEditor
          content={Object.keys(content).length > 0 ? content : null}
          onChange={setContent}
          placeholder="Write your post here…"
        />
      </div>

      {error && <p className="text-xs font-light text-red-400/80">{error}</p>}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 border-t border-red-900/15 pt-6">
        <button
          type="button"
          onClick={() => router.push('/admin/blog')}
          className="text-xs font-light tracking-[0.25em] text-white/25 uppercase transition-colors hover:text-white/50">
          Cancel
        </button>

        <div className="flex-1" />

        {/* Save draft */}
        {!published && (
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={submitting}
            className="flex items-center gap-2 border border-red-900/25 bg-white/[0.02] px-6 py-2.5 text-xs font-light tracking-[0.25em] text-white/35 uppercase transition-all hover:border-red-800/40 hover:text-white/60 disabled:opacity-50">
            {submitting ? <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} /> : null}
            Save Draft
          </button>
        )}

        {/* Publish / update */}
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={submitting}
          className="flex items-center gap-2 border border-red-700/60 bg-red-950/30 px-8 py-2.5 text-xs font-light tracking-[0.25em] text-red-300/90 uppercase transition-all hover:border-red-600/80 hover:bg-red-900/40 disabled:opacity-50">
          {submitting ? (
            <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} />
          ) : (
            <Check className="h-3 w-3" strokeWidth={2} />
          )}
          {published ? 'Save Changes' : 'Publish'}
        </button>
      </div>
    </div>
  );
}
