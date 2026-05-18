'use client';

import type { Role } from 'generated/prisma';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ROLE_META } from '@/utils/profile';

const ROLES: Role[] = ['GUEST', 'MEMBER', 'OFFICER', 'LEADER'];

interface RoleSelectorProps {
  userId: string;
  currentRole: Role;
  // Leaders can change any role; officers see the dropdown but it's disabled
  canEdit: boolean;
}

export default function RoleSelector({ userId, currentRole, canEdit }: RoleSelectorProps) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(currentRole);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(next: Role) {
    if (next === role || !canEdit) return;

    setSaving(true);
    setError(null);

    try {
      type RoleResponse = { success: true; user: { id: string; role: Role } } | { success: false; error: string };

      const res = await fetch(`/api/admin/members/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: next }),
      });

      const json = (await res.json()) as RoleResponse;

      if (!res.ok || !json.success) {
        setError(!json.success ? json.error : 'Failed to update role.');
        return;
      }

      setRole(json.user.role);
      router.refresh();
    } catch {
      setError('Network error.');
    } finally {
      setSaving(false);
    }
  }

  const meta = ROLE_META[role];

  if (!canEdit) {
    // Read-only pill for officers viewing their own row or other leaders
    return <span className={`text-xs font-light tracking-[0.2em] uppercase ${meta.color}`}>{meta.label}</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <select
          value={role}
          disabled={saving}
          onChange={(e) => handleChange(e.target.value as Role)}
          className={`appearance-none border border-red-900/25 bg-[#060404] px-3 py-1 pr-7 text-xs font-light tracking-[0.2em] uppercase transition-colors outline-none hover:border-red-800/50 disabled:opacity-50 ${meta.color}`}
          style={{ colorScheme: 'dark' }}>
          {ROLES.map((r) => (
            <option key={r} value={r} className="text-white/60">
              {ROLE_META[r].label}
            </option>
          ))}
        </select>
        {/* Custom chevron */}
        <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-white/20">▾</span>
      </div>
      {saving && <span className="text-[10px] font-light text-white/25">Saving…</span>}
      {error && <span className="text-[10px] font-light text-red-400/70">{error}</span>}
    </div>
  );
}
