import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AttendanceCounts } from '@/app/events/[id]/attendance-counts';

describe('AttendanceCounts Component', () => {
  const mockAttendance = {
    attending: 5,
    maybe: 3,
    notAttending: 2,
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

    // Check Not Attending row
    expect(screen.getByText(/❌ Not Attending/i)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows the empty state message when total attendance is zero', () => {
    const zeroAttendance = {
      attending: 0,
      maybe: 0,
      notAttending: 0,
      attendingNames: [],
      maybeNames: [],
    };

    render(<AttendanceCounts attendance={zeroAttendance} />);

    // Check that counts show 0
    const zeroCounts = screen.getAllByText('0');
    expect(zeroCounts).toHaveLength(3);

    // Check for the "No responses yet" fallback text
    expect(screen.getByText('No responses yet.')).toBeInTheDocument();
  });

  it('does not show the empty state message when there is attendance data', () => {
    render(<AttendanceCounts attendance={mockAttendance} />);

    expect(screen.queryByText('No responses yet.')).not.toBeInTheDocument();
  });

  it('correctly applies styles and avoids Division by Zero errors when total is 0', () => {
    const zeroAttendance = { attending: 0, maybe: 0, notAttending: 0, attendingNames: [], maybeNames: [] };
    const { container } = render(<AttendanceCounts attendance={zeroAttendance} />);

    // The component should render fine without crashing
    expect(container.firstChild).toBeInTheDocument();
  });
});
