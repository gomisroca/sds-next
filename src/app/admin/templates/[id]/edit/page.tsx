import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import OrnamentalRule from '@/app/components/ui/ornamental-rule';
import { db } from '@/server/db';

import TemplateEditForm from './template-edit-form';

async function getTemplate(id: string) {
  return db.event.findUnique({
    where: { id, isTemplate: true },
    select: {
      id: true,
      name: true,
      templateName: true,
      description: true,
      location: true,
      imageUrl: true,
    },
  });
}

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = await getTemplate(id);
  if (!template) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-10">
        <Link
          href="/admin/templates"
          className="group mb-8 inline-flex items-center gap-2 text-xs font-light tracking-[0.25em] text-white/30 uppercase transition-colors hover:text-white/60">
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.5} />
          All Templates
        </Link>

        <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/60 uppercase">Admin · Templates</p>
        <h1 className="mb-6 text-3xl font-extralight tracking-wide text-white/85 uppercase">Edit Template</h1>
        <OrnamentalRule className="max-w-xs" />
        <p className="mt-6 text-sm font-light text-white/35">
          Editing <span className="text-white/60">{template.templateName ?? template.name}</span>
        </p>
      </div>

      <TemplateEditForm template={template} />
    </div>
  );
}
