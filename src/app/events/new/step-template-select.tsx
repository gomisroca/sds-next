'use client';

import { motion } from 'framer-motion';
import { FileText, Loader2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { FormData } from './types';

interface Template {
  id: string;
  templateName: string | null;
  name: string;
  description: string | null;
  location: string | null;
  imageUrl: string | null;
}

type TemplatesResponse = { templates: Template[] } | { error: string };

interface StepTemplateSelectProps {
  onSelect: (patch: Partial<FormData>) => void;
}

export function StepTemplateSelect({ onSelect }: StepTemplateSelectProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>(''); // '' = fresh

  useEffect(() => {
    fetch('/api/events/templates')
      .then((r) => r.json())
      .then((data: TemplatesResponse) => {
        if ('templates' in data) setTemplates(data.templates);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleFresh() {
    setSelected('');
    onSelect({ fromTemplateId: '' });
  }

  function handleTemplate(t: Template) {
    setSelected(t.id);
    // Pre-fill form data from the template, leaving dates blank
    onSelect({
      fromTemplateId: t.id,
      name: t.name,
      description: t.description ?? '',
      location: t.location ?? '',
      imageUrl: t.imageUrl ?? '',
      // Dates are intentionally left blank — officer sets them
      startsAtDate: '',
      endsAtDate: '',
      isTemplate: false,
      templateName: '',
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-red-900/40" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Fresh option */}
      <motion.button
        type="button"
        onClick={handleFresh}
        className={`flex items-start gap-4 border p-4 text-left transition-all duration-200 ${
          selected === ''
            ? 'border-red-700/50 bg-red-950/25'
            : 'border-red-900/20 bg-white/[0.02] hover:border-red-900/40'
        }`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}>
        <div
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border transition-colors ${
            selected === '' ? 'border-red-600/70 bg-red-900/40' : 'border-red-900/30'
          }`}>
          {selected === '' && <div className="h-1.5 w-1.5 bg-red-500" />}
        </div>
        <div>
          <div className="mb-0.5 flex items-center gap-2">
            <Plus className="h-3.5 w-3.5 text-white/40" strokeWidth={1.5} />
            <p
              className={`text-sm font-light tracking-wide transition-colors ${selected === '' ? 'text-white/80' : 'text-white/40'}`}>
              Start fresh
            </p>
          </div>
          <p className="text-xs font-light text-white/20">Create a new event from scratch.</p>
        </div>
      </motion.button>

      {/* Template options */}
      {templates.length > 0 && (
        <>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-light tracking-[0.25em] text-white/20 uppercase">Or use a template</span>
            <div className="h-px flex-1 bg-red-900/15" />
          </div>

          {templates.map((t, i) => (
            <motion.button
              key={t.id}
              type="button"
              onClick={() => handleTemplate(t)}
              className={`flex items-start gap-4 border p-4 text-left transition-all duration-200 ${
                selected === t.id
                  ? 'border-red-700/50 bg-red-950/25'
                  : 'border-red-900/20 bg-white/[0.02] hover:border-red-900/40'
              }`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: (i + 1) * 0.06 }}>
              <div
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border transition-colors ${
                  selected === t.id ? 'border-red-600/70 bg-red-900/40' : 'border-red-900/30'
                }`}>
                {selected === t.id && <div className="h-1.5 w-1.5 bg-red-500" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-white/30" strokeWidth={1.5} />
                  <p
                    className={`truncate text-sm font-light tracking-wide transition-colors ${
                      selected === t.id ? 'text-white/80' : 'text-white/40'
                    }`}>
                    {t.templateName ?? t.name}
                  </p>
                </div>
                {t.description && <p className="line-clamp-1 text-xs font-light text-white/20">{t.description}</p>}
                {t.location && (
                  <p className="mt-0.5 text-[10px] font-light tracking-widest text-white/15 uppercase">{t.location}</p>
                )}
              </div>
            </motion.button>
          ))}
        </>
      )}

      {templates.length === 0 && (
        <p className="py-2 text-xs font-light text-white/20 italic">
          No templates saved yet. Create an event and check "Save as reusable template" to add one.
        </p>
      )}
    </div>
  );
}
