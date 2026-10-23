'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function DiscordAccess() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function closeModal() {
    if (loading) return;

    setPassword('');
    setError('');
  }

  async function handleAccess() {
    if (!password || loading) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setError('Incorrect password.');
        return;
      }

      await signIn('discord');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}>
      <div className="w-full max-w-sm border border-red-800/50 bg-black p-6">
        <h2 className="mb-2 text-sm tracking-[0.25em] text-red-400 uppercase">Restricted Access</h2>

        <p className="mb-4 text-sm text-gray-400">Enter the access password to continue with Discord.</p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleAccess();
          }}>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
            autoComplete="current-password"
            placeholder="Access password"
            disabled={loading}
            className="mb-2 w-full border border-red-900/50 bg-red-950/20 px-3 py-2 text-sm text-red-300 transition-colors outline-none focus:border-red-700 disabled:opacity-50"
          />

          {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              disabled={loading}
              className="px-3 py-2 text-xs text-gray-500 transition-colors hover:text-gray-300 disabled:opacity-50">
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !password}
              className="border border-red-800/50 bg-red-950/30 px-3 py-2 text-xs tracking-wider text-red-400 uppercase transition-colors hover:bg-red-900/30 disabled:opacity-50">
              {loading ? 'Checking...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
