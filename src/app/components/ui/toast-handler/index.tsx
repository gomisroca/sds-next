'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { sileo } from 'sileo';

export default function ToastHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('toast') === 'unauthorized') {
      sileo.error({
        title: 'Access denied',
        description: 'You need to be logged in to access that page.',
        fill: 'black',
        styles: {
          title: 'text-white!',
          description: 'text-white/80',
        },
      });

      router.replace('/');
    }
  }, [searchParams, router]);

  return null;
}
