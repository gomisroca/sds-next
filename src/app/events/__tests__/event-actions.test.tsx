import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EventActions } from '@/app/events/[slug]/event-actions';

// Mock Next.js router navigation
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock global fetch API
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('EventActions Component', () => {
  const defaultProps = {
    eventId: 'evt_123',
    canEdit: false,
    canPublish: false,
    canCancel: false,
    canDelete: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders absolutely nothing if no actions are permitted', () => {
    const { container } = render(<EventActions {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders only the actions that are explicitly allowed', () => {
    render(<EventActions {...defaultProps} canEdit={true} canPublish={true} />);

    expect(screen.getByText('Manage Event')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /edit details/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /publish/i })).toBeInTheDocument();

    // Cancel and Delete shouldn't exist
    expect(screen.queryByRole('button', { name: /cancel event/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete event/i })).not.toBeInTheDocument();
  });

  it('successfully triggers direct action API call (Publish)', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<EventActions {...defaultProps} canPublish={true} />);

    const publishBtn = screen.getByRole('button', { name: /publish/i });
    await user.click(publishBtn);

    // Verifies endpoint details
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/events/evt_123/publish', {
      method: 'POST',
    });

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  describe('ConfirmButton Two-Step Verification Flow', () => {
    it('requires confirmation step before launching network action', async () => {
      const user = userEvent.setup();
      render(<EventActions {...defaultProps} canCancel={true} />);

      const cancelBtn = screen.getByRole('button', { name: /cancel event/i });
      await user.click(cancelBtn);

      // Main action should not fire immediately on first click
      expect(fetchMock).not.toHaveBeenCalled();

      // UI changes to confirmation variant
      const confirmBtn = screen.getByRole('button', { name: /confirm cancel/i });
      const abortBtn = screen.getByRole('button', { name: /^cancel$/i });
      expect(confirmBtn).toBeInTheDocument();
      expect(abortBtn).toBeInTheDocument();
    });

    it('reverts back to original state if user aborts confirmation', async () => {
      const user = userEvent.setup();
      render(<EventActions {...defaultProps} canCancel={true} />);

      // Step 1: click action
      await user.click(screen.getByRole('button', { name: /cancel event/i }));

      // Step 2: click explicit inline cancel button
      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(screen.getByRole('button', { name: /cancel event/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /confirm cancel/i })).not.toBeInTheDocument();
    });

    it('executes final action when confirmed (Delete)', async () => {
      const user = userEvent.setup();
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<EventActions {...defaultProps} canDelete={true} />);

      await user.click(screen.getByRole('button', { name: /delete event/i }));
      await user.click(screen.getByRole('button', { name: /confirm delete/i }));

      expect(fetchMock).toHaveBeenCalledWith('/api/admin/events/evt_123/delete', {
        method: 'DELETE',
      });

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling UI States', () => {
    it('displays custom API error message when the request fails cleanly', async () => {
      const user = userEvent.setup();
      fetchMock.mockResolvedValueOnce({
        ok: true, // handles business logic response errors safely
        json: async () => ({ success: false, error: 'You do not have permission to execute this operation.' }),
      });

      render(<EventActions {...defaultProps} canPublish={true} />);
      await user.click(screen.getByRole('button', { name: /publish/i }));

      await waitFor(() => {
        expect(screen.getByText('You do not have permission to execute this operation.')).toBeInTheDocument();
      });
    });

    it('displays fallback network crash error string when request rejects completely', async () => {
      const user = userEvent.setup();
      fetchMock.mockRejectedValueOnce(new Error('Network disconnected'));

      render(<EventActions {...defaultProps} canPublish={true} />);
      await user.click(screen.getByRole('button', { name: /publish/i }));

      await waitFor(() => {
        expect(screen.getByText('Network error - please try again.')).toBeInTheDocument();
      });
    });
  });
});
