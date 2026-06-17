import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import EventCarousel, { type FeaturedEvent } from '@/app/event-carousel';

// 1. Intercept and safely flatten Framer Motion structures to native tags
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({ children, style, className, ...props }: React.ComponentProps<'div'>) => (
        <div className={className} style={style} {...props}>
          {children}
        </div>
      ),
      span: ({ children, className, ...props }: React.ComponentProps<'span'>) => (
        <span className={className} {...props}>
          {children}
        </span>
      ),
    },
  };
});

// 2. Mock individual subcomponents safely
vi.mock('@/app/components/ui/ornamental-rule', () => ({
  default: ({ className }: { className?: string }) => <div data-testid="ornamental-rule" className={className} />,
}));

// 3. Mock Next.js routing structures
vi.mock('next/link', () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock Data Construct setup conforming to FeaturedEvent schema
const mockEvents: FeaturedEvent[] = [
  {
    id: 'evt-1',
    name: 'Savage Progress: M1S',
    description: 'Clearing floor one before the weekly lock reset.',
    location: 'Discord VC Group A',
    imageUrl: 'https://cdn.example.com/m1s.png',
    startsAt: new Date('2026-06-20T19:00:00.000Z'),
    endsAt: new Date('2026-06-20T22:00:00.000Z'),
    _count: { attendances: 8 },
  },
  {
    id: 'evt-2',
    name: 'FC Summer Beach Party',
    description: 'Gather at Costa del Sol for minigames, glam contests, and prizes!',
    location: 'Costa del Sol - Ward 12, Plot 5',
    imageUrl: 'https://cdn.example.com/beach.png',
    startsAt: new Date('2026-07-15T18:00:00.000Z'),
    endsAt: null,
    _count: { attendances: 24 },
  },
];

describe('EventCarousel Sliding Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders an empty placeholder layout state if the event array is empty', () => {
    render(<EventCarousel events={[]} />);

    expect(screen.getByText(/no upcoming events/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3 })).toBeNull();
  });

  it('renders a single isolated slide component layout without slider navigation controls', () => {
    render(<EventCarousel events={[mockEvents[0]!]} />);

    // Primary detail assertions
    expect(screen.getByRole('heading', { name: 'Savage Progress: M1S' })).toBeInTheDocument();
    expect(screen.getByText(/8 attending/i)).toBeInTheDocument();
    expect(screen.getByText('Discord VC Group A')).toBeInTheDocument();

    // Navigation indicators should be omitted when total event length <= 1
    expect(screen.queryByRole('button', { name: /go to event/i })).toBeNull();
    expect(screen.queryByText('1 / 1')).toBeNull();
  });

  it('displays navigation handles and pagination counters if multi-event arrays are present', () => {
    render(<EventCarousel events={mockEvents} />);

    expect(screen.getByRole('heading', { name: 'Savage Progress: M1S' })).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();

    // Verify dot navigation trackers match the total event array parameters completely
    const dotIndicators = screen.getAllByRole('button', {
      name: (name) => name.startsWith('Go to event'),
    });
    expect(dotIndicators).toHaveLength(2);
  });

  it('progresses to successive event details upon fire events triggering manual navigation navigation button clicks', () => {
    render(<EventCarousel events={mockEvents} />);

    const nextButton = screen.getAllByRole('button').filter((btn) => !btn.hasAttribute('aria-label'))[1];
    const prevButton = screen.getAllByRole('button').find((btn) => !btn.hasAttribute('aria-label'));

    expect(nextButton).toBeDefined();
    expect(prevButton).toBeDefined();

    // Move Forward to slide index 2
    fireEvent.click(nextButton!);
    expect(screen.getByRole('heading', { name: 'FC Summer Beach Party' })).toBeInTheDocument();
    expect(screen.getByText('2 / 2')).toBeInTheDocument();

    // Move Backward returning index back to slide 1
    fireEvent.click(prevButton!);
    expect(screen.getByRole('heading', { name: 'Savage Progress: M1S' })).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('jumps directly to targeted slides when clicking specific dot indicators', () => {
    render(<EventCarousel events={mockEvents} />);

    const slideTwoDotIndicator = screen.getByRole('button', { name: /go to event 2/i });
    fireEvent.click(slideTwoDotIndicator);

    expect(screen.getByRole('heading', { name: 'FC Summer Beach Party' })).toBeInTheDocument();
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
  });
});
