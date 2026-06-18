export interface FormData {
  // Step 0 - template selection (UX only, not submitted directly)
  fromTemplateId: string; // empty string = start fresh

  // Step 1 - details
  name: string;
  description: string;
  location: string;
  imageUrl: string;
  isTemplate: boolean;
  templateName: string;

  // Step 2 - time (skipped / optional for templates)
  startsAtDate: string; // YYYY-MM-DD
  startsAtTime: string; // HH:MM
  endsAtDate: string;
  endsAtTime: string;
  hasEndTime: boolean;

  // Step 3 - publish
  publishNow: boolean;
}

export const INITIAL_FORM_DATA: FormData = {
  fromTemplateId: '',
  name: '',
  description: '',
  location: '',
  imageUrl: '',
  isTemplate: false,
  templateName: '',
  startsAtDate: '',
  startsAtTime: '20:00',
  endsAtDate: '',
  endsAtTime: '22:00',
  hasEndTime: false,
  publishNow: false,
};

export function validateStep(step: number, data: FormData): Partial<Record<keyof FormData, string>> {
  const errors: Partial<Record<keyof FormData, string>> = {};

  // Step 0 - no validation needed
  if (step === 1) {
    if (!data.name.trim()) errors.name = 'Event name is required.';
    if (data.isTemplate && !data.templateName.trim()) {
      errors.templateName = 'Template name is required.';
    }
  }

  if (step === 2) {
    // Templates don't need a date - skip date validation
    if (!data.isTemplate && !data.startsAtDate) {
      errors.startsAtDate = 'Start date is required.';
    }
    if (data.hasEndTime && data.endsAtDate && data.startsAtDate) {
      const start = new Date(`${data.startsAtDate}T${data.startsAtTime}`);
      const end = new Date(`${data.endsAtDate}T${data.endsAtTime}`);
      if (end <= start) errors.endsAtDate = 'End time must be after start time.';
    }
  }

  return errors;
}
