/**
 * Crash Out: Ring Rush — Fighter Roster Data Integrity Tests
 *
 * Validates that all 14 fighters have complete, valid data entries.
 */
import { describe, it, expect } from 'vitest';
import { FIGHTER_ROSTER, getFighter } from '../src/engine/fighters';
import { GemColor, PassiveType } from '../src/engine/types';

describe('FIGHTER_ROSTER', () => {
    it('should have exactly 14 fighters', () => {
        expect(FIGHTER_ROSTER.length).toBe(14);
    });

    it('should have unique IDs', () => {
        const ids = FIGHTER_ROSTER.map(f => f.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(14);
    });

    it('should have unique display names', () => {
        const names = FIGHTER_ROSTER.map(f => f.displayName);
        const uniqueNames = new Set(names);
        expect(uniqueNames.size).toBe(14);
    });

    it('should have unique sprite keys', () => {
        const keys = FIGHTER_ROSTER.map(f => f.spriteKey);
        const uniqueKeys = new Set(keys);
        expect(uniqueKeys.size).toBe(14);
    });

    it('should have exactly one boss', () => {
        const bosses = FIGHTER_ROSTER.filter(f => f.isBoss);
        expect(bosses.length).toBe(1);
        expect(bosses[0].id).toBe('floyd');
    });

    describe.each(FIGHTER_ROSTER)('Fighter: $displayName ($id)', (fighter) => {
        it('should have a non-empty display name', () => {
            expect(fighter.displayName.length).toBeGreaterThan(0);
        });

        it('should have a non-empty tagline', () => {
            expect(fighter.tagline.length).toBeGreaterThan(0);
        });

        it('should have a valid sprite key', () => {
            expect(fighter.spriteKey.length).toBeGreaterThan(0);
        });

        it('should have a valid drop pattern', () => {
            expect(fighter.dropPattern).toBeDefined();
            if (fighter.dropPattern.favoredColor) {
                expect(Object.values(GemColor)).toContain(fighter.dropPattern.favoredColor);
            }
            expect(fighter.dropPattern.colorBias).toBeGreaterThanOrEqual(0);
            expect(fighter.dropPattern.colorBias).toBeLessThanOrEqual(1);
            expect(fighter.dropPattern.preferredColumns.length).toBeGreaterThan(0);
            fighter.dropPattern.preferredColumns.forEach(col => {
                expect(col).toBeGreaterThanOrEqual(0);
                expect(col).toBeLessThan(6);
            });
        });

        it('should have a valid passive ability', () => {
            expect(fighter.passive).toBeDefined();
            expect(fighter.passive.name.length).toBeGreaterThan(0);
            expect(fighter.passive.description.length).toBeGreaterThan(0);
            expect(Object.values(PassiveType)).toContain(fighter.passive.type);
            expect(fighter.passive.value).toBeDefined();
        });

        it('should have a valid SUPER finisher', () => {
            expect(fighter.superFinisher).toBeDefined();
            expect(fighter.superFinisher.name.length).toBeGreaterThan(0);
            expect(fighter.superFinisher.damage).toBe(35);
            expect(fighter.superFinisher.animKey.length).toBeGreaterThan(0);
            expect(fighter.superFinisher.description.length).toBeGreaterThan(0);
        });

        it('should have valid fidget config', () => {
            expect(fighter.fidget).toBeDefined();
            expect(fighter.fidget.fidgetA.length).toBeGreaterThan(0);
            expect(fighter.fidget.fidgetB.length).toBeGreaterThan(0);
            expect(fighter.fidget.minInterval).toBeGreaterThan(0);
            expect(fighter.fidget.maxInterval).toBeGreaterThan(fighter.fidget.minInterval);
        });
    });
});

describe('getFighter', () => {
    it('should return correct fighter by ID', () => {
        const broner = getFighter('broner');
        expect(broner.displayName).toContain('Broner');
    });

    it('should throw for unknown fighter ID', () => {
        expect(() => getFighter('nonexistent')).toThrow();
    });

    it('should find all 14 fighters by ID', () => {
        const ids = ['broner', 'deen', 'floyd', 'ryan', 'tank', 'blueface', 'n3on', 'rayj', 'chrisean', 'ab', 'charleston', 'walid', 'adin', 'rampage'];
        ids.forEach(id => {
            expect(() => getFighter(id)).not.toThrow();
        });
    });
});
