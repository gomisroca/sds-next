import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Footer from '@/app/components/ui/footer';

vi.mock('./ornamental-rule', () => ({
  default: () => <div data-testid="ornamental-rule" />,
}));

describe('Footer', () => {
  it('renders the Footer component correctly', () => {
    render(<Footer />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders the ornamental rule inside the footer', () => {
    render(<Footer />);

    expect(screen.getByTestId('ornamental-rule')).toBeInTheDocument();
  });

  it('renders the footer text with correct uppercase transform styling', () => {
    render(<Footer />);

    const footerText = screen.getByText(/Sleeping Dragons · Light · Phoenix/i);

    expect(footerText).toBeInTheDocument();
    expect(footerText).toHaveClass('uppercase');
  });
});
