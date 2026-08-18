import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import EventRow from '@/app/events/event-row';

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

vi.mock('next/link', () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

const mockEvent = {
  id: 'evt-1',
  name: 'Savage Progress: M1S',
  description: 'Weekly reclear before reset.',
  location: 'Discord VC 1',
  startsAt: new Date('2026-06-20T19:00:00.000Z'),
  endsAt: new Date('2026-06-20T22:00:00.000Z'),
  status: 'PUBLISHED',
  _count: {
    attendances: 8,
  },
};

describe('EventRow', () => {
  it('renders the primary event information', () => {
    render(<EventRow event={mockEvent} index={0} />);

    expect(screen.getByRole('heading', { name: 'Savage Progress: M1S' })).toBeInTheDocument();

    expect(screen.getByText('Weekly reclear before reset.')).toBeInTheDocument();
    expect(screen.getByText('Discord VC 1')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('links to the event detail page', () => {
    render(<EventRow event={mockEvent} index={0} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/events/evt-1');
  });

  it('formats and displays the event date and time', () => {
    render(<EventRow event={mockEvent} index={0} />);

    expect(screen.getByText('Sat')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();

    // desktop
    expect(screen.getAllByText('19:00')).not.toHaveLength(0);
    expect(screen.getByText('→ 22:00')).toBeInTheDocument();
  });

  it('renders the draft badge for draft events', () => {
    render(
      <EventRow
        index={0}
        event={{
          ...mockEvent,
          status: 'DRAFT',
        }}
      />
    );

    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('does not render the draft badge for published events', () => {
    render(<EventRow event={mockEvent} index={0} />);

    expect(screen.queryByText('Draft')).not.toBeInTheDocument();
  });

  it('omits optional fields when they are null', () => {
    render(
      <EventRow
        index={0}
        event={{
          ...mockEvent,
          description: null,
          location: null,
          endsAt: null,
        }}
      />
    );

    expect(screen.queryByText('Weekly reclear before reset.')).toBeNull();
    expect(screen.queryByText('Discord VC 1')).toBeNull();

    expect(screen.getAllByText('19:00')).not.toHaveLength(0);
    expect(screen.queryByText(/22:00/)).toBeNull();
  });

  it('renders the attendance count', () => {
    render(<EventRow event={mockEvent} index={0} />);

    expect(screen.getByText('8')).toBeInTheDocument();
  });
});
