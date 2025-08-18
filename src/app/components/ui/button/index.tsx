'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps {
  arialabel: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
  onClick: () => void;
  onError: (error: Error) => void;
  children: React.ReactNode;
}

export default function Button({
  arialabel,
  type = 'button',
  disabled = false,
  onClick,
  onError,
  className,
  children,
}: ButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (isPending) return;

    setIsPending(true);
    try {
      await Promise.resolve(onClick());
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Button action failed:', error);
      onError?.(error);
    } finally {
      if (isMounted.current) {
        setIsPending(false);
      }
    }
  }, [onClick, isPending, onError]);

  return (
    <button
      aria-label={arialabel || 'button'}
      type={type}
      onClick={handleClick}
      disabled={disabled || isPending}
      className={twMerge(
        '',
        (disabled || isPending) && 'cursor-not-allowed opacity-50',
        isPending && 'animate-pulse',
        className
      )}>
      {children}
    </button>
  );
}
