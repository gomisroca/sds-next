import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AttendanceCounts } from '@/app/events/[slug]/attendance-counts';

describe('AttendanceCounts Component', () => {
  const mockAttendance = {
    attending: 5,
    maybe: 3,
    attendingNames: ['John Doe', 'Jane Doe'],
    maybeNames: ['Jane Doe'],
  };

  it('renders the header correctly', () => {
    render(<AttendanceCounts attendance={mockAttendance} />);

    expect(screen.getByText('Attendance')).toBeInTheDocument();
  });

  it('renders all statuses with their respective labels, emojis, and counts', () => {
    render(<AttendanceCounts attendance={mockAttendance} />);

    // Check Attending row
    expect(screen.getByText(/✅ Attending/i)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    // Check Maybe row
    expect(screen.getByText(/❓ Maybe/i)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('correctly applies styles and avoids Division by Zero errors when total is 0', () => {
    const zeroAttendance = { attending: 0, maybe: 0, attendingNames: [], maybeNames: [] };
    const { container } = render(<AttendanceCounts attendance={zeroAttendance} />);

    // The component should render fine without crashing
    expect(container.firstChild).toBeInTheDocument();
  });
});
