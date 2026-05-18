'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Pencil, Trash2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface EventActionsProps {
  eventId: string;
  canEdit: boolean; // officer+, draft only
  canPublish: boolean; // officer+, draft only
  canCancel: boolean; // leader only, published only
  canDelete: boolean; // officer+, draft or cancelled
}

export function EventActions({ eventId, canEdit, canPublish, canCancel, canDelete }: EventActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!canEdit && !canPublish && !canCancel && !canDelete) return null;

  async function callAction(action: string, method: 'POST' | 'DELETE') {
    setPending(action);
    setError(null);
    try {
      type ActionResponse = { success: true } | { success: false; error: string };
      const res = await fetch(`/api/events/${eventId}/${action}`, { method });
      const json = (await res.json()) as ActionResponse;
      if (!res.ok || !json.success) {
        setError(!json.success ? json.error : 'Something went wrong.');
        return;
      }
      router.refresh();
    } catch {
      setError('Network error - please try again.');
    } finally {
      setPending(null);
    }
  }

  return (
    <motion.div
      className="flex flex-col gap-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}>
      <p className="text-xs font-light tracking-[0.25em] text-white/25 uppercase">Manage Event</p>

      <div className="flex flex-col gap-2">
        {canEdit && (
          <a
            href={`/admin/events/${eventId}/edit`}
            className="flex cursor-pointer items-center gap-2 border border-red-900/25 bg-white/[0.02] px-4 py-2 text-xs font-light tracking-[0.2em] text-white/40 uppercase transition-all hover:border-red-800/40 hover:text-white/65">
            <Pencil className="h-3 w-3" strokeWidth={1.5} />
            Edit Details
          </a>
        )}

        {canPublish && (
          <button
            type="button"
            disabled={!!pending}
            onClick={() => callAction('publish', 'POST')}
            className="flex cursor-pointer items-center gap-2 border border-emerald-900/30 bg-emerald-950/15 px-4 py-2 text-xs font-light tracking-[0.2em] text-emerald-400/70 uppercase transition-all hover:border-emerald-700/40 hover:text-emerald-400 disabled:opacity-50">
            <CheckCircle className="h-3 w-3" strokeWidth={1.5} />
            {pending === 'publish' ? 'Publishing…' : 'Publish'}
          </button>
        )}

        {canCancel && (
          <ConfirmButton
            label="Cancel Event"
            confirmLabel="Confirm Cancel"
            icon={XCircle}
            pending={pending === 'cancel'}
            className="cursor-pointer border-yellow-900/30 bg-yellow-950/15 text-yellow-600/70 hover:border-yellow-700/40 hover:text-yellow-500"
            onConfirm={() => callAction('cancel', 'POST')}
          />
        )}

        {canDelete && (
          <ConfirmButton
            label="Delete Event"
            confirmLabel="Confirm Delete"
            icon={Trash2}
            pending={pending === 'delete'}
            className="cursor-pointer border-red-900/30 bg-red-950/15 text-red-500/60 hover:border-red-700/40 hover:text-red-400"
            onConfirm={() => callAction('delete', 'DELETE')}
          />
        )}
      </div>

      {error && <p className="text-xs font-light text-red-400/80">{error}</p>}
    </motion.div>
  );
}

// ── Two-step confirm button ───────────────────────────────────────────────────
function ConfirmButton({
  label,
  confirmLabel,
  icon: Icon,
  pending,
  className,
  onConfirm,
}: {
  label: string;
  confirmLabel: string;
  icon: React.ElementType;
  pending: boolean;
  className: string;
  onConfirm: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            onConfirm();
            setConfirming(false);
          }}
          className={`flex flex-1 items-center justify-center gap-2 border px-4 py-2 text-xs font-light tracking-[0.2em] uppercase transition-all disabled:opacity-50 ${className}`}>
          {pending ? 'Working…' : confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="border border-red-900/20 px-3 py-2 text-xs font-light text-white/25 uppercase transition-colors hover:text-white/50">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => setConfirming(true)}
      className={`flex items-center gap-2 border px-4 py-2 text-xs font-light tracking-[0.2em] uppercase transition-all disabled:opacity-50 ${className}`}>
      <Icon className="h-3 w-3" strokeWidth={1.5} />
      {label}
    </button>
  );
}
