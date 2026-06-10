'use client';

import { UploadButton } from '@uploadthing/react';
import { Eye, EyeOff, Loader2, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { UploadThingRouter } from '@/app/api/uploadthing/core';
import RichTextEditor from '@/app/components/ui/rich-text-editor';

interface PostEditorProps {
  mode: 'new' | 'edit';
  postId?: string;
  initial?: {
    title: string;
    slug: string;
    excerpt: string;
    content: Record<string, unknown> | null;
    coverImage: string;
    published: boolean;
  };
}

const EMPTY = {
  title: '',
  slug: '',
  excerpt: '',
  content: null as Record<string, unknown> | null,
  coverImage: '',
  published: false,
};

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 200);
}

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

export default function PostEditor({ mode, postId, initial }: PostEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState(initial ?? EMPTY);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(update: Partial<typeof form>) {
    setForm((prev) => ({ ...prev, ...update }));
  }

  function handleTitleChange(title: string) {
    patch({ title, ...(!slugManuallyEdited ? { slug: slugify(title) } : {}) });
  }

  async function handleSave(publish?: boolean) {
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!form.slug.trim()) {
      setError('Slug is required.');
      return;
    }
    if (!form.content) {
      setError('Content is required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const published = publish ?? form.published;

    try {
      type PostResponse = { success: true; post: { id: string; slug: string } } | { success: false; error: string };

      const res = await fetch(mode === 'new' ? '/api/blog' : `/api/blog/${postId}`, {
        method: mode === 'new' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          slug: form.slug.trim(),
          excerpt: form.excerpt.trim() || undefined,
          content: form.content,
          coverImage: form.coverImage || undefined,
          published,
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

  async function handleDelete() {
    if (!postId) return;
    setDeleting(true);
    try {
      await fetch(`/api/blog/${postId}`, { method: 'DELETE' });
      router.push('/admin/blog');
      router.refresh();
    } catch {
      setError('Failed to delete post.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div>
        <Label>Title *</Label>
        <Input value={form.title} onChange={handleTitleChange} placeholder="A New Chapter Begins" maxLength={200} />
      </div>

      {/* Slug */}
      <div>
        <Label hint="Used in the URL: /blog/your-slug — lowercase letters, numbers and hyphens only.">Slug *</Label>
        <Input
          value={form.slug}
          onChange={(v) => {
            setSlugManuallyEdited(true);
            patch({ slug: v });
          }}
          placeholder="a-new-chapter-begins"
          maxLength={200}
        />
      </div>

      {/* Excerpt */}
      <div>
        <Label hint="Short summary shown in listings and the homepage card.">Excerpt</Label>
        <Textarea
          value={form.excerpt}
          onChange={(v) => patch({ excerpt: v })}
          placeholder="A brief description of what this post is about…"
          rows={3}
          maxLength={500}
        />
      </div>

      {/* Cover image */}
      <div>
        <Label>Cover Image</Label>
        {form.coverImage ? (
          <div className="relative h-40 w-full overflow-hidden border border-red-900/25">
            <img src={form.coverImage} alt="Cover" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <button
              type="button"
              onClick={() => patch({ coverImage: '' })}
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center border border-white/20 bg-black/60 text-white/60 transition-colors hover:bg-black/80 hover:text-white">
              <X className="h-3 w-3" strokeWidth={2} />
            </button>
          </div>
        ) : (
          <UploadButton<UploadThingRouter, 'eventBanner'>
            endpoint="eventBanner"
            onClientUploadComplete={(res) => {
              const url = res?.[0]?.ufsUrl;
              if (url) patch({ coverImage: url });
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
                return ready ? 'Upload Cover Image' : 'Getting ready…';
              },
            }}
          />
        )}
      </div>

      {/* Content */}
      <div>
        <Label>Content *</Label>
        <RichTextEditor
          content={form.content}
          onChange={(json) => patch({ content: json })}
          placeholder="Write your post here…"
        />
      </div>

      {error && <p className="text-xs font-light text-red-400/80">{error}</p>}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 border-t border-red-900/15 pt-6">
        {/* Save draft */}
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={submitting}
          className="flex cursor-pointer items-center gap-2 border border-red-900/25 bg-white/[0.02] px-6 py-2.5 text-xs font-light tracking-[0.25em] text-white/40 uppercase transition-all hover:border-red-800/40 hover:text-white/60 disabled:opacity-50">
          {submitting && !form.published ? (
            <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} />
          ) : (
            <EyeOff className="h-3 w-3" strokeWidth={1.5} />
          )}
          Save Draft
        </button>

        {/* Publish */}
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={submitting}
          className="flex cursor-pointer items-center gap-2 border border-red-700/60 bg-red-950/30 px-6 py-2.5 text-xs font-light tracking-[0.25em] text-red-300/90 uppercase transition-all hover:border-red-600/80 hover:bg-red-900/40 disabled:opacity-50">
          {submitting && form.published ? (
            <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} />
          ) : (
            <Eye className="h-3 w-3" strokeWidth={1.5} />
          )}
          {form.published ? 'Update & Keep Published' : 'Publish'}
        </button>

        {/* Delete — edit mode only */}
        {mode === 'edit' && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="ml-auto flex cursor-pointer items-center gap-2 border border-red-900/20 px-4 py-2.5 text-xs font-light tracking-[0.25em] text-red-700/50 uppercase transition-all hover:border-red-700/40 hover:text-red-500/70 disabled:opacity-50">
            {deleting ? (
              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} />
            ) : (
              <Trash2 className="h-3 w-3" strokeWidth={1.5} />
            )}
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
