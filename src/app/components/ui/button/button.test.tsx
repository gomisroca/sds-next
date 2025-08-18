import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FaKey } from 'react-icons/fa6';
import { describe, expect, it, vi } from 'vitest';

import Button from '@/app/components/ui/button';

const handleClick = vi.fn();
const handleError = vi.fn();

describe('Button', () => {
  it('renders the Button component correctly', () => {
    render(
      <Button onClick={handleClick} onError={handleError} arialabel="Click Me">
        Click Me
      </Button>
    );

    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
  });

  it('renders the Button component with a custom class', () => {
    render(
      <Button onClick={handleClick} onError={handleError} arialabel="Click Me" className="bg-red-500 text-white">
        Click Me
      </Button>
    );

    expect(screen.getByRole('button', { name: 'Click Me' })).toHaveClass('bg-red-500 text-white');
  });

  it('renders the Button component with an icon', () => {
    render(
      <Button onClick={handleClick} onError={handleError} arialabel="Click Me">
        <FaKey data-testid="fa-key" size={20} />
      </Button>
    );
    expect(screen.getByRole('button')).toContainElement(screen.getByTestId('fa-key'));
  });

  it('renders the disabled state correctly', () => {
    render(
      <Button onClick={handleClick} onError={handleError} arialabel="Click Me" disabled>
        Click Me
      </Button>
    );

    expect(screen.getByRole('button', { name: 'Click Me' })).toBeDisabled();
  });

  it('calls the onClick handler when clicked', async () => {
    render(
      <Button onClick={handleClick} onError={handleError} arialabel="Click Me">
        Click Me
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Click Me' });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('calls the onError handler when an error occurs', async () => {
    const error = new Error('Test Error');
    const failingClick = vi.fn(() => Promise.reject(error));

    render(
      <Button onClick={failingClick} onError={handleError} arialabel="Click Me">
        Click Me
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Click Me' });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(handleError).toHaveBeenCalledWith(error);
  });

  it('disables the button while pending and re-enables after', async () => {
    const asyncClick = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));

    render(
      <Button onClick={asyncClick} onError={handleError} arialabel="Click Me">
        Click Me
      </Button>
    );

    const button = screen.getByRole('button', { name: /Click Me/i });

    expect(button).toBeEnabled();

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toBeDisabled();

    await waitFor(() => expect(button).toBeEnabled());

    expect(asyncClick).toHaveBeenCalledTimes(1);
  });
});
