'use client';

import { useAtom } from 'jotai';

import { messageAtom } from '@/atoms/message';

export function useMessage() {
  const [message, setMessage] = useAtom(messageAtom);

  return { message, setMessage };
}
