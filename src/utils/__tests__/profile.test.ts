import type { Activity, Job, Playstyle, Role } from 'generated/prisma';
import { describe, expect, it } from 'vitest';

import { ACTIVITY_LABEL, JOB_META, PLAYSTYLE_META, ROLE_META } from '@/utils/profile';

describe('Profile Utilities Metadata Configurations', () => {
  describe('JOB_META dictionary mapping', () => {
    it('contains configurations for highly recognizable base entries', () => {
      // Testing specific unique role keys to safeguard accurate object layouts
      expect(JOB_META.PLD).toEqual({
        label: 'Paladin',
        role: 'Tank',
        color: 'text-sky-300/80',
        bg: 'bg-sky-900/30',
      });

      expect(JOB_META.WHM).toEqual({
        label: 'White Mage',
        role: 'Healer',
        color: 'text-emerald-300/80',
        bg: 'bg-emerald-900/30',
      });

      expect(JOB_META.VPR).toEqual({
        label: 'Viper',
        role: 'Melee',
        color: 'text-orange-300/80',
        bg: 'bg-orange-900/30',
      });
    });

    it('ensures every defined Job constant maps valid theme styling text syntax', () => {
      const allJobs = Object.keys(JOB_META) as Job[];

      // Guard check to ensure the config isn't missing keys altogether
      expect(allJobs.length).toBeGreaterThan(0);

      allJobs.forEach((jobKey) => {
        const meta = JOB_META[jobKey];
        expect(meta.label).toBeDefined();
        expect(typeof meta.label).toBe('string');

        // Assert that the Tailwind configuration classes follow consistent structures
        expect(meta.color).toMatch(/^text-/);
        expect(meta.bg).toMatch(/^bg-/);
      });
    });
  });

  describe('PLAYSTYLE_META configurations', () => {
    it('maps key behavioral playstyles successfully', () => {
      expect(PLAYSTYLE_META.CASUAL).toEqual({
        label: 'Casual',
        color: 'text-green-300/80',
        bg: 'bg-green-900/25',
      });

      expect(PLAYSTYLE_META.HARDCORE).toEqual({
        label: 'Hardcore',
        color: 'text-red-300/80',
        bg: 'bg-red-900/25',
      });
    });

    it('validates coverage across all playstyle definitions', () => {
      const targetedKeys: Playstyle[] = ['CASUAL', 'MIDCORE', 'HARDCORE', 'ROLEPLAYER', 'SOCIAL', 'COLLECTOR'];

      targetedKeys.forEach((key) => {
        expect(PLAYSTYLE_META[key]).toBeDefined();
        expect(PLAYSTYLE_META[key].label).not.toBe('');
      });
    });
  });

  describe('ROLE_META hierarchical permissions mapping', () => {
    it('sets correct accessibility tags for guild authority settings', () => {
      expect(ROLE_META.MEMBER).toEqual({
        label: 'Member',
        color: 'text-emerald-400/80',
      });

      expect(ROLE_META.LEADER).toEqual({
        label: 'Leader',
        color: 'text-yellow-400/80',
      });
    });

    it('checks dictionary exhaustive record lookups for all system Roles', () => {
      const keys = Object.keys(ROLE_META) as Role[];
      expect(keys).toContain('GUEST');
      expect(keys).toContain('MEMBER');
      expect(keys).toContain('OFFICER');
      expect(keys).toContain('LEADER');
    });
  });

  describe('ACTIVITY_LABEL translation mapping', () => {
    it('accurately parses custom enum expressions to client UI display words', () => {
      expect(ACTIVITY_LABEL.EXTREME_TRIALS).toBe('Extreme Trials');
      expect(ACTIVITY_LABEL.CRYSTALLINE_CONFLICT).toBe('Crystalline Conflict');
      expect(ACTIVITY_LABEL.ISLAND_SANCTUARY).toBe('Island Sanctuary');
    });

    it('verifies every single map translation registers a valid text fallback value', () => {
      const keys = Object.keys(ACTIVITY_LABEL) as Activity[];

      keys.forEach((activityKey) => {
        const readableLabel = ACTIVITY_LABEL[activityKey];
        expect(readableLabel).toBeDefined();
        expect(typeof readableLabel).toBe('string');
        expect(readableLabel.length).toBeGreaterThan(0);
      });
    });
  });
});
