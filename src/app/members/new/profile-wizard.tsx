'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Gamepad2, Image, Loader2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { StepGameplay, StepIdentity, StepVisuals } from './profile-wizard-steps';
import { INITIAL_PROFILE_FORM_DATA, type ProfileFormData, validateProfileStep } from './types';

const STEPS = [
  { number: 1, label: 'Identity', icon: User },
  { number: 2, label: 'Gameplay', icon: Gamepad2 },
  { number: 3, label: 'Visuals', icon: Image },
];

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
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

type ProfileWizardProps =
  | {
      mode: 'create';
      targetUserId: string;
      targetUserName: string;
      initialData?: undefined;
      profileId?: undefined;
    }
  | {
      mode: 'edit';
      profileId: string;
      targetUserId?: undefined;
      targetUserName?: undefined;
      initialData: ProfileFormData;
    };

export function ProfileWizard(props: ProfileWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<ProfileFormData>(
    props.mode === 'edit' ? props.initialData : INITIAL_PROFILE_FORM_DATA
  );
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function patch(update: Partial<ProfileFormData>) {
    setData((prev) => ({ ...prev, ...update }));
  }

  function next() {
    const errs = validateProfileStep(step, data);
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
    setStep((s) => s - 1);
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);

    try {
      type ProfileResponse =
        | { success: true; profile: { id: string; userId: string } }
        | { success: false; error: string };

      const payload = {
        name: data.name.trim(),
        bio: data.bio.trim() || undefined,
        portrait: data.portrait || undefined,
        banner: data.banner || undefined,
        job: data.job,
        activities: data.activities,
        playstyle: data.playstyle,
      };

      const res = await fetch(props.mode === 'create' ? '/api/profile' : `/api/profile/${props.profileId}`, {
        method: props.mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(props.mode === 'create' ? { ...payload, userId: props.targetUserId } : payload),
      });

      const json = (await res.json()) as ProfileResponse;
      if (!res.ok || !json.success) {
        setSubmitError(!json.success ? json.error : 'Something went wrong.');
        return;
      }

      // Redirect to the member detail page for the profile's owner
      router.push(`/members/${json.profile.userId}`);
    } catch {
      setSubmitError('Network error — please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    centre: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  const isLastStep = step === STEPS.length;

  return (
    <div>
      {props.mode === 'create' && props.targetUserName && (
        <p className="mb-6 text-sm font-light text-white/35">
          Creating profile for <span className="text-white/60">{props.targetUserName}</span>
        </p>
      )}

      <StepIndicator current={step} />

      <div className="relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="centre"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
            {step === 1 && <StepIdentity data={data} errors={errors} onChange={patch} />}
            {step === 2 && <StepGameplay data={data} errors={errors} onChange={patch} />}
            {step === 3 && <StepVisuals data={data} onChange={patch} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 1}
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
            ) : (
              <Check className="h-3 w-3" strokeWidth={2} />
            )}
            {submitting ? 'Saving…' : props.mode === 'create' ? 'Create Profile' : 'Save Changes'}
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
