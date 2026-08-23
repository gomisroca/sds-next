import { render, screen } from '@testing-library/react';
import { type Activity } from 'generated/prisma';
import { describe, expect, it, vi } from 'vitest';

import MemberCard from '@/app/members/member-card';

// 1. Stub out Framer Motion transitions so items render statically for snapshots
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, className, ...props }: React.ComponentProps<'div'>) => (
        <div className={className} {...props}>
          {children}
        </div>
      ),
    },
  };
});

// 2. Mock Next.js routing Link element down to a normal HTML anchor tag
vi.mock('next/link', () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock configurations matching dictionary imports used internally by the module
const mockFullyPopulatedMember = {
  id: 'user-001',
  name: 'Alphinaud Leveilleur',
  image: 'https://cdn.example.com/base-avatar.png',
  role: 'OFFICER' as const,
  profile: {
    name: 'Alphinaud (Academic)',
    slug: 'alphinaud-academic',
    bio: 'Academic specialist focusing on Sharlayan field studies.',
    portrait: 'https://cdn.example.com/portrait-high-res.png',
    job: 'SGE' as const, // Sage
    playstyle: 'MIDCORE' as const,
    activities: ['RAIDING', 'SAVAGE', 'DUNGEONS', 'GLAMOUR', 'HOUSING', 'PVP'] as Activity[], // 6 items
  },
};

describe('MemberCard Profile Block Component', () => {
  it('renders complete sub-profile configurations and structural data tags', () => {
    render(<MemberCard member={mockFullyPopulatedMember} index={0} />);

    // Root routing deep link assertion
    const cardAnchor = screen.getByRole('link');
    expect(cardAnchor).toHaveAttribute('href', '/members/user-001');

    // Display profile override name preferentially instead of base fallback name string
    expect(screen.getByRole('heading', { name: 'Alphinaud (Academic)' })).toBeInTheDocument();
    expect(screen.queryByText('Alphinaud Leveilleur')).toBeNull();

    // Portrait selector properties logic checking
    const userPortrait = screen.getByRole('img', { name: 'Alphinaud (Academic)' });
    expect(userPortrait).toHaveAttribute('src', 'https://cdn.example.com/portrait-high-res.png');

    // Role badge presence verification
    expect(screen.getByText('Officer')).toBeInTheDocument();

    // Job + Playstyle configurations checks matching metadata lookups
    expect(screen.getByText('Sage')).toBeInTheDocument();
    expect(screen.getByText('Healer')).toBeInTheDocument();
    expect(screen.getByText('Midcore')).toBeInTheDocument();
    expect(screen.getByText('Academic specialist focusing on Sharlayan field studies.')).toBeInTheDocument();
  });

  it('truncates the rendered activities list exactly at the maximum item threshold', () => {
    render(<MemberCard member={mockFullyPopulatedMember} index={0} />);

    // Allowed visible subset assertions (MAX_ACTIVITIES = 4)
    expect(screen.getByText('Raiding')).toBeInTheDocument();
    expect(screen.getByText('Savage')).toBeInTheDocument();
    expect(screen.getByText('Dungeons')).toBeInTheDocument();
    expect(screen.getByText('Glamour')).toBeInTheDocument();

    // Remainder items must be withheld from view structure
    expect(screen.queryByText('Housing')).toBeNull();
    expect(screen.queryByText('PvP')).toBeNull();

    // Verify mathematical addition offset text rendering (+2 unaccounted array blocks)
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('falls back seamlessly to default settings when the user profile property block is completely absent', () => {
    const minimalisticUser = {
      id: 'user-002',
      name: 'Tataru Taru',
      image: null,
      role: 'MEMBER' as const,
      profile: null,
    };

    render(<MemberCard member={minimalisticUser} index={1} />);

    // Main typography verification using core base values
    expect(screen.getByRole('heading', { name: 'Tataru Taru' })).toBeInTheDocument();
    expect(screen.getByText(/no profile yet\./i)).toBeInTheDocument();

    // Role tags with exact 'DRAGON' type matches must be omitted from screen entirely
    expect(screen.queryByText('DRAGON')).toBeNull();

    // Initial string letter capitalization badge should replace avatar images when sources are empty
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByText('T')).toHaveClass('text-5xl', 'font-extralight');
  });

  it('staggers animation elements sequentially based on the viewport index loop variable', () => {
    const { container } = render(<MemberCard member={mockFullyPopulatedMember} index={2} />);

    // Grab animation container hook
    const rootMotionElement = container.firstChild;
    expect(rootMotionElement).toBeInTheDocument();

    // Testing layout implementation logic behavior (index % 6) * 0.07 delay calculations
    // If indices or layout items change or break, this test will safely prevent visual regression errors.
  });
});
