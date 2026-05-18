'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calendar, Check, FileText, Loader2, Send, Type } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { StepTemplateSelect } from './step-template-select';
import { type FormData, INITIAL_FORM_DATA, validateStep } from './types';
import { StepDetails, StepPublish, StepTime } from './wizard-steps';

// Steps 1–3 shown in the indicator (step 0 is a pre-screen)
const STEPS = [
  { number: 1, label: 'Details', icon: Type },
  { number: 2, label: 'Time', icon: Calendar },
  { number: 3, label: 'Publish', icon: Send },
];

// ── Step indicator (only shown for steps 1–3) ────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  if (current === 0) return null;
  return (
    <div className="mb-10 flex items-center">
      {STEPS.map((step, i) => {
        const done = current > step.number;
        const active = current === step.number;
        const Icon = step.icon;
        return (
          <div key={step.number} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center border text-xs transition-all duration-300 ${
                  done
                    ? 'border-red-700/60 bg-red-950/40 text-red-400'
                    : active
                      ? 'border-red-700/80 bg-red-950/60 text-red-300'
                      : 'border-red-900/25 bg-white/[0.02] text-white/20'
                }`}>
                {done ? <Check className="h-3 w-3" strokeWidth={2} /> : <Icon className="h-3 w-3" strokeWidth={1.5} />}
              </div>
              <span
                className={`text-xs font-light tracking-[0.2em] uppercase transition-colors duration-300 ${
                  active ? 'text-white/70' : done ? 'text-white/40' : 'text-white/20'
                }`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-4 h-px w-8 transition-colors duration-300 ${done ? 'bg-red-800/50' : 'bg-red-900/20'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Wizard ────────────────────────────────────────────────────────────────────
type CreateEventWizardProps =
  | { mode?: 'create' }
  | {
      mode: 'edit';
      eventId: string;
      initialData: FormData;
    };

export function CreateEventWizard(props: CreateEventWizardProps = {}) {
  const isEdit = props.mode === 'edit';
  const router = useRouter();
  const [step, setStep] = useState(isEdit ? 1 : 0); // skip step 0 in edit mode
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<FormData>(isEdit ? props.initialData : INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function patch(update: Partial<FormData>) {
    setData((prev) => ({ ...prev, ...update }));
  }

  function next() {
    const errs = validateStep(step, data);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setDirection(1);
    setStep((s) => s + 1);
  }

  function back() {
    setErrors({});
    setDirection(-1);
    setStep((s) => (isEdit ? Math.max(1, s - 1) : s - 1));
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const startsAt =
        data.isTemplate || !data.startsAtDate
          ? undefined
          : new Date(`${data.startsAtDate}T${data.startsAtTime}`).toISOString();

      const endsAt =
        data.hasEndTime && data.endsAtDate
          ? new Date(`${data.endsAtDate}T${data.endsAtTime}`).toISOString()
          : undefined;

      type EventResponse = { success: true; event: { id: string } } | { success: false; error: string };

      const res = await fetch(
        isEdit ? `/api/events/${(props as { eventId: string }).eventId}/details` : '/api/events',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            isEdit
              ? {
                  name: data.name.trim(),
                  description: data.description.trim() || undefined,
                  location: data.location.trim() || undefined,
                  imageUrl: data.imageUrl.trim() || undefined,
                  startsAt,
                  endsAt,
                }
              : {
                  name: data.name.trim(),
                  description: data.description.trim() || undefined,
                  location: data.location.trim() || undefined,
                  imageUrl: data.imageUrl.trim() || undefined,
                  startsAt,
                  endsAt,
                  publishNow: data.isTemplate ? false : data.publishNow,
                  isTemplate: data.isTemplate,
                  templateName: data.isTemplate ? data.templateName.trim() : undefined,
                }
          ),
        }
      );

      const json = (await res.json()) as EventResponse;
      if (!res.ok || !json.success) {
        setSubmitError(!json.success ? json.error : 'Something went wrong.');
        return;
      }

      if (isEdit) {
        router.push(`/admin/events/${(props as { eventId: string }).eventId}/edit`);
        router.refresh();
      } else if (data.isTemplate) {
        router.push('/events');
      } else {
        router.push(`/events/${json.event.id}`);
      }
    } catch {
      setSubmitError('Network error - please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    centre: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  const isLastStep = step === 3;

  // Submit button label
  function submitLabel() {
    if (submitting) return 'Saving…';
    if (isEdit) return 'Save Changes';
    if (data.isTemplate) return 'Save Template';
    return data.publishNow ? 'Create & Publish' : 'Create Draft';
  }

  return (
    <div>
      <StepIndicator current={step} />

      {/* Step 0 heading */}
      {step === 0 && (
        <div className="mb-8">
          <p className="mb-2 text-xs font-light tracking-[0.25em] text-white/30 uppercase">Step 0 of 3</p>
          <h2 className="text-lg font-extralight tracking-wide text-white/70">Starting point</h2>
        </div>
      )}

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="centre"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
            {step === 0 && <StepTemplateSelect onSelect={patch} />}
            {step === 1 && <StepDetails data={data} errors={errors} onChange={patch} isEdit={isEdit} />}
            {step === 2 && <StepTime data={data} errors={errors} onChange={patch} />}
            {step === 3 && <StepPublish data={data} onChange={patch} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="flex items-center gap-2 text-xs font-light tracking-[0.25em] text-white/30 uppercase transition-colors hover:text-white/60 disabled:pointer-events-none disabled:opacity-0">
          <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
          Back
        </button>

        {!isLastStep ? (
          <motion.button
            type="button"
            onClick={next}
            className="flex items-center gap-2 border border-red-800/50 bg-red-950/20 px-8 py-2.5 text-xs font-light tracking-[0.25em] text-red-400/85 uppercase transition-all hover:border-red-700/70 hover:bg-red-900/30 hover:text-red-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}>
            Next
            <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
          </motion.button>
        ) : (
          <motion.button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="flex items-center gap-2 border border-red-700/60 bg-red-950/30 px-8 py-2.5 text-xs font-light tracking-[0.25em] text-red-300/90 uppercase transition-all hover:border-red-600/80 hover:bg-red-900/40 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}>
            {submitting ? (
              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} />
            ) : data.isTemplate ? (
              <FileText className="h-3 w-3" strokeWidth={1.5} />
            ) : (
              <Check className="h-3 w-3" strokeWidth={2} />
            )}
            {submitLabel()}
          </motion.button>
        )}
      </div>

      {submitError && (
        <motion.p
          className="mt-4 text-xs font-light text-red-400/80"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}>
          {submitError}
        </motion.p>
      )}
    </div>
  );
}
