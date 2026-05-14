export interface FormData {
  name: string;
  description: string;
  location: string;
  imageUrl: string;
  startsAtDate: string;
  startsAtTime: string;
  endsAtDate: string;
  endsAtTime: string;
  hasEndTime: boolean;
  publishNow: boolean;
}

export const INITIAL_FORM_DATA: FormData = {
  name: '',
  description: '',
  location: '',
  imageUrl: '',
  startsAtDate: '',
  startsAtTime: '20:00',
  endsAtDate: '',
  endsAtTime: '22:00',
  hasEndTime: false,
  publishNow: false,
};

export function validateStep(step: number, data: FormData): Partial<Record<keyof FormData, string>> {
  const errors: Partial<Record<keyof FormData, string>> = {};

  if (step === 1 && !data.name.trim()) {
    errors.name = 'Event name is required.';
  }

  if (step === 2) {
    if (!data.startsAtDate) errors.startsAtDate = 'Start date is required.';
    if (data.hasEndTime && data.endsAtDate) {
      const start = new Date(`${data.startsAtDate}T${data.startsAtTime}`);
      const end = new Date(`${data.endsAtDate}T${data.endsAtTime}`);
      if (end <= start) errors.endsAtDate = 'End time must be after start time.';
    }
  }

  return errors;
}
