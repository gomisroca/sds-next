/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StepGameplay, StepIdentity, StepVisuals } from '@/app/members/profile-wizard/profile-wizard-steps';
import type { ProfileFormData } from '@/app/members/profile-wizard/types';

// 1. Mock UploadThing Client Upload Button to act as a normal controlled button trigger
interface UploadButtonProps {
  onClientUploadComplete?: (files: Array<{ ufsUrl: string }>) => void;
  content?: {
    button?: (state: { ready: boolean; isUploading: boolean }) => React.ReactNode;
  };
  endpoint: string;
}

vi.mock('@uploadthing/react', () => ({
  UploadButton: ({ onClientUploadComplete, content, endpoint }: UploadButtonProps) => (
    <button
      type="button"
      data-testid={`upload-btn-${endpoint}`}
      onClick={() => onClientUploadComplete?.([{ ufsUrl: `https://cdn.uploadthing.com/${endpoint}-mock.png` }])}>
      {typeof content?.button === 'function' ? content.button({ ready: true, isUploading: false }) : 'Upload'}
    </button>
  ),
}));

// 2. Mock Global Profile Utility Maps
vi.mock('@/utils/profile', () => ({
  ACTIVITY_LABEL: {
    RAIDING: 'Raiding Progress',
    SAVAGE: 'Savage Tier',
    PVP: 'Crystalline PvP',
    GLAMOUR: 'Glamour Fashion',
  },
  JOB_META: {
    PLD: { label: 'Paladin', bg: 'bg-blue-900', color: 'text-blue-200', role: 'Tank' },
    WHM: { label: 'White Mage', bg: 'bg-green-900', color: 'text-green-200', role: 'Healer' },
    VPR: { label: 'Viper', bg: 'bg-red-900', color: 'text-red-200', role: 'Melee' },
  },
  PLAYSTYLE_META: {
    CASUAL: { label: 'Casual Pace', bg: 'bg-gray-900', color: 'text-gray-300' },
    MIDCORE: { label: 'Midcore Focus', bg: 'bg-orange-900', color: 'text-orange-300' },
  },
}));

// 3. Define standard clean state parameters for step data objects
const initialMockData: ProfileFormData = {
  name: '',
  bio: '',
  job: 'PLD',
  playstyle: 'CASUAL',
  activities: ['RAIDING'],
  portrait: '',
  banner: '',
};

describe('Profile Setup Wizard Steps Component Suite', () => {
  let onChangeSpy = vi.fn();

  beforeEach(() => {
    onChangeSpy = vi.fn();
    vi.clearAllMocks();
  });

  // ── STEP 1: IDENTITY VIEW TESTING ──────────────────────────────────────────
  describe('StepIdentity SUB-STAGE', () => {
    it('populates fields cleanly with active state data inputs and characters bounds', () => {
      const populatedData = { ...initialMockData, name: 'Graha Tia', bio: 'Crystal Exarch legacy.' };
      render(<StepIdentity data={populatedData} errors={{}} onChange={onChangeSpy} />);

      const nameInput = screen.getByPlaceholderText(/firstname lastname/i) as HTMLInputElement;
      const bioTextarea = screen.getByPlaceholderText(/tell the fc a little about yourself/i) as HTMLTextAreaElement;

      expect(nameInput.value).toBe('Graha Tia');
      expect(bioTextarea.value).toBe('Crystal Exarch legacy.');
      expect(screen.getByText('22/500')).toBeInTheDocument(); // Character counter verification
    });

    it('fires onChange updates when input data properties are altered', () => {
      render(<StepIdentity data={initialMockData} errors={{}} onChange={onChangeSpy} />);
      const nameInput = screen.getByPlaceholderText(/firstname lastname/i);

      fireEvent.change(nameInput, { target: { value: 'Lyse Hext' } });
      expect(onChangeSpy).toHaveBeenCalledWith({ name: 'Lyse Hext' });
    });

    it('appends visible formatting validation errors to matching fields', () => {
      render(
        <StepIdentity
          data={initialMockData}
          errors={{ name: 'Character name is already taken.' }}
          onChange={onChangeSpy}
        />
      );
      expect(screen.getByText('Character name is already taken.')).toBeInTheDocument();
    });
  });

  // ── STEP 2: GAMEPLAY SELECTION TESTING ──────────────────────────────────────
  describe('StepGameplay SUB-STAGE', () => {
    it('updates selection properties when clicking a new job token button', () => {
      render(<StepGameplay data={initialMockData} errors={{}} onChange={onChangeSpy} />);

      const vprButton = screen.getByRole('button', { name: 'Viper' });
      expect(vprButton).toBeDefined();

      fireEvent.click(vprButton!);
      expect(onChangeSpy).toHaveBeenCalledWith({ job: 'VPR' });
    });

    it('toggles item removal/inclusion states dynamically when clicking activity badges', () => {
      // Current configuration state begins with ['RAIDING'] already populated
      render(<StepGameplay data={initialMockData} errors={{}} onChange={onChangeSpy} />);

      const raidingBadge = screen.getByRole('button', { name: 'Raiding Progress' });

      // Click 1: Active item should be removed from target state arrays
      fireEvent.click(raidingBadge);
      expect(onChangeSpy).toHaveBeenCalledWith({ activities: [] });

      // Click 2: Inactive item badge should append new token criteria onto array properties
      const savageBadge = screen.getByRole('button', { name: 'Savage Tier' });
      fireEvent.click(savageBadge);
      expect(onChangeSpy).toHaveBeenCalledWith({ activities: ['RAIDING', 'SAVAGE'] });
    });
  });

  // ── STEP 3: VISUAL UPLOADER TESTING ─────────────────────────────────────────
  describe('StepVisuals SUB-STAGE', () => {
    it('shows mock upload buttons if target picture path variables remain empty strings', () => {
      render(<StepVisuals data={initialMockData} onChange={onChangeSpy} />);

      expect(screen.getByTestId('upload-btn-profilePortrait')).toBeInTheDocument();
      expect(screen.getByTestId('upload-btn-profileBanner')).toBeInTheDocument();
      expect(screen.queryByRole('img')).toBeNull();
    });

    it('transforms buttons to preview imagery once resource URLs are successfully retrieved', () => {
      const activeVisuals = {
        ...initialMockData,
        portrait: 'https://cdn.example.com/live-portrait.jpg',
      };

      render(<StepVisuals data={activeVisuals} onChange={onChangeSpy} />);

      // Portrait button context drops out; img preview appends onto container
      expect(screen.queryByTestId('upload-btn-profilePortrait')).toBeNull();
      const loadedPortrait = screen.getByRole('img', { name: 'Portrait' });
      expect(loadedPortrait).toHaveAttribute('src', 'https://cdn.example.com/live-portrait.jpg');

      // Unchanged elements like Banner preserve initial state targets
      expect(screen.getByTestId('upload-btn-profileBanner')).toBeInTheDocument();
    });

    it('clears state dependencies when clicking the X removal button on a preview layout', () => {
      const activeVisuals = {
        ...initialMockData,
        portrait: 'https://cdn.example.com/live-portrait.jpg',
      };

      render(<StepVisuals data={activeVisuals} onChange={onChangeSpy} />);

      const removePortraitBtn = screen.getByRole('button', { name: /remove portrait/i });
      fireEvent.click(removePortraitBtn);

      expect(onChangeSpy).toHaveBeenCalledWith({ portrait: '' });
    });

    it('handles complete mocking loops for onClientUploadComplete callbacks safely', () => {
      render(<StepVisuals data={initialMockData} onChange={onChangeSpy} />);

      const mockPortraitUploadTrigger = screen.getByTestId('upload-btn-profilePortrait');

      fireEvent.click(mockPortraitUploadTrigger);
      expect(onChangeSpy).toHaveBeenCalledWith({ portrait: 'https://cdn.uploadthing.com/profilePortrait-mock.png' });
    });
  });
});
