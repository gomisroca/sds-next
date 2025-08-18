'use client';

import { useAtom } from 'jotai';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import { messageAtom } from '@/atoms/message';

const Message = () => {
  const [message, setMessage] = useAtom(messageAtom); // Hook to get and set the message atom

  const pathname = usePathname(); // Get the current path

  // Clear message and error on route change
  useEffect(() => {
    if (message) {
      setMessage(null);
    }
  }, [pathname]);

  // Automatically hide popup after 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setMessage(null);
    }, 5000);

    // Cleanup timeout when popup state changes
    return () => clearTimeout(timeout);
  }, [message]);

  if (!message) return null;

  return (
    <div
      data-testid="message"
      className={twMerge(
        'fixed top-4 right-0 z-[9999] m-auto flex flex-col items-center justify-center gap-2 p-1 font-semibold',
        message.error && 'border-red-500'
      )}>
      {message.content}
    </div>
  );
};

export default Message;
