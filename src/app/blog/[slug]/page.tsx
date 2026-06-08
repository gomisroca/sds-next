import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import OrnamentalRule from '@/app/components/ui/ornamental-rule';
import { db } from '@/server/db';

export const revalidate = 60;

async function getPost(slug: string) {
  return db.post.findUnique({
    where: { slug, published: true },
    select: {
      id: true,
      title: true,
      excerpt: true,
      content: true,
      coverImage: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });
}

// Recursively render Tiptap JSON to HTML string
function renderNode(node: Record<string, unknown>): string {
  const type = node.type as string;
  const content = (node.content as Record<string, unknown>[] | undefined) ?? [];
  const attrs = (node.attrs as Record<string, unknown> | undefined) ?? {};

  const inner = content.map(renderNode).join('');

  switch (type) {
    case 'doc':
      return inner;
    case 'paragraph':
      return `<p>${inner}</p>`;
    case 'text': {
      let text = (node.text as string) ?? '';
      const marks = (node.marks as { type: string; attrs?: Record<string, string> }[]) ?? [];
      for (const mark of marks) {
        if (mark.type === 'bold') text = `<strong>${text}</strong>`;
        else if (mark.type === 'italic') text = `<em>${text}</em>`;
        else if (mark.type === 'strike') text = `<s>${text}</s>`;
        else if (mark.type === 'link') text = `<a href="${mark.attrs?.href ?? '#'}">${text}</a>`;
      }
      return text;
    }
    case 'heading': {
      const level = typeof attrs.level === 'number' ? attrs.level : Number(attrs.level) || 1;
      return `<h${level}>${inner}</h${level}>`;
    }
    case 'bulletList':
      return `<ul>${inner}</ul>`;
    case 'orderedList':
      return `<ol>${inner}</ol>`;
    case 'listItem':
      return `<li>${inner}</li>`;
    case 'blockquote':
      return `<blockquote>${inner}</blockquote>`;
    case 'horizontalRule':
      return '<hr>';
    case 'hardBreak':
      return '<br>';
    case 'image': {
      const src = typeof attrs.src === 'string' ? attrs.src : '';
      const alt = typeof attrs.alt === 'string' ? attrs.alt : '';
      return `<img src="${src}" alt="${alt}" />`;
    }
    default:
      return inner;
  }
}

function tiptapToHtml(content: unknown): string {
  if (!content || typeof content !== 'object') return '';
  return renderNode(content as Record<string, unknown>);
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const html = tiptapToHtml(post.content);

  return (
    <main
      className="min-h-screen bg-[#060404] pt-14 text-white"
      style={{ fontFamily: "'Cormorant Garamond', 'Palatino Linotype', serif" }}>
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 90% 75% at 50% 35%, #200504 0%, #0d0202 55%, #030101 100%)' }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(200,50,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,50,0,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-16">
        {/* Back */}
        <Link
          href="/blog"
          className="group mb-10 inline-flex items-center gap-2 text-xs font-light tracking-[0.25em] text-white/30 uppercase transition-colors hover:text-white/60">
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.5} />
          All Posts
        </Link>

        {/* Cover image */}
        {post.coverImage && (
          <div className="mb-10 h-56 w-full overflow-hidden border border-red-900/20 md:h-72">
            <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" />
          </div>
        )}

        {/* Header */}
        <div className="mb-10">
          <p className="mb-3 text-xs font-light tracking-[0.35em] text-white/20 uppercase">
            {post.publishedAt?.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
            {post.author.name && ` · ${post.author.name}`}
          </p>
          <h1 className="mb-6 text-3xl font-extralight tracking-wide text-white/90 md:text-4xl">{post.title}</h1>
          <OrnamentalRule />
          {post.excerpt && (
            <p className="mt-6 text-base leading-relaxed font-light text-white/45 italic">{post.excerpt}</p>
          )}
        </div>

        {/* Content */}
        <div className="post-content" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </main>
  );
}
