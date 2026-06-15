import { cleanup, render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import NavBar from '@/app/components/ui/nav-bar/nav-bar-client';

// 1. Mock NextJS client-side navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}));

// 2. Mock NextAuth authentication functions
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// 3. Mock Framer Motion to skip physics animations inside unit assertions
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');

  return {
    ...actual,
    motion: {
      ...(actual.motion as Record<string, unknown>),
      div: ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => <div {...props}>{children}</div>,
      span: ({ children, ...props }: React.ComponentPropsWithoutRef<'span'>) => <span {...props}>{children}</span>,
      button: ({ children, ...props }: React.ComponentPropsWithoutRef<'button'>) => (
        <button {...props}>{children}</button>
      ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('NavBar Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Safely stub global fetch API response
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ userId: 'user-123', profileId: 'profile-123' }),
      } as Response)
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('renders branding title and subtitle details accurately', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    } as unknown as ReturnType<typeof useSession>);
    vi.mocked(usePathname).mockReturnValue('/');

    render(<NavBar fcName="Sleeping Dragons" subtitle="EU · Light · Phoenix" />);

    expect(screen.getByText('Sleeping Dragons')).toBeInTheDocument();
    expect(screen.getByText('EU · Light · Phoenix')).toBeInTheDocument();
  });

  it('displays navigation items and the Join button when user is logged out', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    } as unknown as ReturnType<typeof useSession>);
    vi.mocked(usePathname).mockReturnValue('/');

    render(<NavBar />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Join')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('hides the Join action when a standard logged-in member is active', () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { name: 'Tataru Taru', role: 'MEMBER' } },
      status: 'authenticated',
      update: vi.fn(),
    } as unknown as ReturnType<typeof useSession>);
    vi.mocked(usePathname).mockReturnValue('/');

    render(<NavBar />);

    expect(screen.queryByText('Join')).not.toBeInTheDocument();
    expect(screen.getByText('Tataru')).toBeInTheDocument();
  });

  it('hides the Admin Panel routing option for regular authenticated members', () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { name: 'Tataru Taru', role: 'MEMBER' } },
      status: 'authenticated',
      update: vi.fn(),
    } as unknown as ReturnType<typeof useSession>);
    vi.mocked(usePathname).mockReturnValue('/admin');

    render(<NavBar />);

    // Regular members shouldn't access desktop/mobile links signaling admin components
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });
});
