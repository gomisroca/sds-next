import type { Activity, Job, Playstyle } from 'generated/prisma';

export interface ProfileFormData {
  // Step 1 - identity
  name: string;
  bio: string;
  // Step 2 - gameplay
  job: Job | '';
  playstyle: Playstyle | '';
  activities: Activity[];
  // Step 3 - visuals
  portrait: string;
  banner: string;
}

export const INITIAL_PROFILE_FORM_DATA: ProfileFormData = {
  name: '',
  bio: '',
  job: '',
  playstyle: '',
  activities: [],
  portrait: '',
  banner: '',
};

export function validateProfileStep(
  step: number,
  data: ProfileFormData
): Partial<Record<keyof ProfileFormData, string>> {
  const errors: Partial<Record<keyof ProfileFormData, string>> = {};

  if (step === 1) {
    if (!data.name.trim()) errors.name = 'Character name is required.';
  }

  if (step === 2) {
    if (!data.job) errors.job = 'Please select a main job.';
    if (!data.playstyle) errors.playstyle = 'Please select a playstyle.';
  }

  return errors;
}
