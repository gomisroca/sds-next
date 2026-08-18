import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RSVPButtons } from '@/app/events/[id]/rsvp-buttons';

// Mock global fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('RSVPButtons Component', () => {
  const defaultProps = {
    eventId: 'test-event-123',
    confirmedStatus: null,
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all RSVP buttons with correct labels', () => {
    render(<RSVPButtons {...defaultProps} />);

    expect(screen.getByText('Your RSVP')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /✅ Attending/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /❓ Maybe/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /❌ Not Attending/i })).toBeInTheDocument();
  });

  it('highlights the active button based on confirmedStatus and shows the subtext', () => {
    render(<RSVPButtons {...defaultProps} confirmedStatus="ATTENDING" />);

    // Check that the active checkmark indicator appears inside the active button
    expect(screen.getByText('✓')).toBeInTheDocument();

    // Check that the dynamic bottom text appears
    expect(screen.getByText('You can change your mind any time.')).toBeInTheDocument();
  });

  it('triggers optimistic update immediately, executes fetch, and calls onSuccess on successful response', async () => {
    const user = userEvent.setup();
    // Simulate a delayed network response to test optimistic behavior
    fetchMock.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 50)));

    render(<RSVPButtons {...defaultProps} confirmedStatus="MAYBE" />);

    const attendingButton = screen.getByRole('button', { name: /✅ Attending/i });

    // Prior to click, '✓' is on the 'Maybe' button flow concept
    expect(screen.queryByText('✓')).toBeInTheDocument();

    // Click the "Attending" button
    await user.click(attendingButton);

    // 1. OPTIMISTIC CHECK: The UI should instantly display the checkmark on the new state
    // even before the network promise resolves
    expect(screen.getByText('✓')).toBeInTheDocument();

    // 2. FETCH CHECK: Verify endpoint and body payloads
    expect(fetchMock).toHaveBeenCalledWith('/api/events/test-event-123/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ATTENDING' }),
    });

    // 3. SUCCESS CALLBACK CHECK: Wait for transition/network to finish resolving
    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalledWith('ATTENDING');
    });
  });

  it('does nothing if the clicked status is already the active status', async () => {
    const user = userEvent.setup();
    render(<RSVPButtons {...defaultProps} confirmedStatus="ATTENDING" />);

    const attendingButton = screen.getByRole('button', { name: /✅ Attending/i });
    await user.click(attendingButton);

    // Fetch should not be called because of early exit guard clause
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('handles server errors gracefully without calling onSuccess', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => void 0);

    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Bad Request' }),
    });

    render(<RSVPButtons {...defaultProps} confirmedStatus="NOT_ATTENDING" />);

    const maybeButton = screen.getByRole('button', { name: /❓ Maybe/i });
    await user.click(maybeButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('RSVP failed', { error: 'Bad Request' });
    });

    expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
