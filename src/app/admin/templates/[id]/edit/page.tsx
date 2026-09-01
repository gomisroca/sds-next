import { notFound } from 'next/navigation';

import { BackLink } from '@/app/components/ui/back-link';
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
        <BackLink href="/admin/templates/">All Templates</BackLink>

        <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/60 uppercase">Admin · Templates</p>
        <h1 className="mb-6 text-3xl font-extralight tracking-wide text-white/90 uppercase">Edit Template</h1>
        <OrnamentalRule className="max-w-xs" />
        <p className="mt-6 text-sm font-light text-white/60">
          Editing <span className="text-white/80">{template.templateName ?? template.name}</span>
        </p>
      </div>

      <TemplateEditForm template={template} />
    </div>
  );
}
