import { atom } from 'jotai';

// Establish a message atom taking in a string and an optional boolean
export const messageAtom = atom<{
  content: string;
  error?: boolean;
} | null>(null);
