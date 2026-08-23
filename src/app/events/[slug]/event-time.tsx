'use client';

import { formatEventTime } from '@/utils/events';

export function EventTime({ date }: { date: Date | string }) {
  return <>{formatEventTime(new Date(date))}</>;
}
