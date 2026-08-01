import { FighterData, GemColor, PassiveType } from './types';

/**
 * Crash Out: Ring Rush — Fighter Roster
 *
 * Defines all 14 playable characters, their passives, drop patterns, and SUPER finishers.
 */
export const FIGHTER_ROSTER: FighterData[] = [
    {
        id: 'broner',
        displayName: 'Adrien Broner',
        spriteKey: 'fighter_broner',
        tagline: 'About Billions',
        dropPattern: {
            favoredColor: GemColor.RED,
            colorBias: 0.2,
            preferredColumns: [0, 2, 4],
        },
        passive: {
            name: 'About Billions',
            description: '10% more damage per chain link.',
            type: PassiveType.CHAIN_DAMAGE_BONUS,
            value: 0.10,
        },
        superFinisher: {
            name: 'The Cincinnati Cobra',
            damage: 35,
            animKey: 'broner-super',
            description: 'A devastating combo attack that clears the board.',
        },
        fidget: {
            fidgetA: 'Brushes off shoulders.',
            fidgetB: 'Shadowboxes rapidly.',
            minInterval: 2000,
            maxInterval: 6000,
        },
        isBoss: false,
    },
    {
        id: 'deen',
        displayName: 'Hasim Rahman Jr',
        spriteKey: 'fighter_deen',
        tagline: 'Gold Standard',
        dropPattern: {
            favoredColor: GemColor.YELLOW,
            colorBias: 0.15,
            preferredColumns: [1, 3],
        },
        passive: {
            name: 'Gold Standard Defense',
            description: 'Takes 15% less damage from incoming attacks.',
            type: PassiveType.DAMAGE_REDUCTION,
            value: 0.15,
        },
        superFinisher: {
            name: 'Gold Rush Barrage',
            damage: 35,
            animKey: 'deen-super',
            description: 'A golden flurry of heavy punches.',
        },
        fidget: {
            fidgetA: 'Adjusts gloves.',
            fidgetB: 'Taps chin confidently.',
            minInterval: 2000,
            maxInterval: 6000,
        },
        isBoss: false,
    },
    {
        id: 'floyd',
        displayName: 'Floyd Mayweather',
        spriteKey: 'fighter_floyd',
        tagline: 'TBE - The Best Ever',
        dropPattern: {
            favoredColor: GemColor.YELLOW,
            colorBias: 0.25,
            preferredColumns: [2, 3, 4],
        },
        passive: {
            name: 'TBE Agility',
            description: '30% faster piece movement (DAS).',
            type: PassiveType.FASTER_DAS,
            value: 0.30,
        },
        superFinisher: {
            name: 'Money Counter',
            damage: 35,
            animKey: 'floyd-super',
            description: 'An unstoppable counter-attack.',
        },
        fidget: {
            fidgetA: 'Checks imaginary watch.',
            fidgetB: 'Shoulder rolls.',
            minInterval: 2000,
            maxInterval: 6000,
        },
        isBoss: true,
    },
    {
        id: 'ryan',
        displayName: 'Ryan Garcia',
        spriteKey: 'fighter_ryan',
        tagline: 'KingRy',
        dropPattern: {
            favoredColor: GemColor.BLUE,
            colorBias: 0.2,
            preferredColumns: [0, 5],
        },
        passive: {
            name: 'KingRy Speed',
            description: 'Counter gems tick down 1 turn faster.',
            type: PassiveType.FASTER_COUNTER_DECAY,
            value: 1,
        },
        superFinisher: {
            name: 'Flash KO',
            damage: 35,
            animKey: 'ryan-super',
            description: 'A blindingly fast left hook.',
        },
        fidget: {
            fidgetA: 'Flashes a quick smile.',
            fidgetB: 'Throws a lightning-fast feint.',
            minInterval: 2000,
            maxInterval: 6000,
        },
        isBoss: false,
    },
    {
        id: 'tank',
        displayName: 'Tank Davis',
        spriteKey: 'fighter_tank',
        tagline: 'Tank Mode',
        dropPattern: {
            favoredColor: GemColor.RED,
            colorBias: 0.2,
            preferredColumns: [1, 2, 3],
        },
        passive: {
            name: 'Tank Power',
            description: 'Power gems deal 20% more damage.',
            type: PassiveType.POWER_GEM_DAMAGE_BONUS,
            value: 0.20,
        },
        superFinisher: {
            name: 'Tank Shell',
            damage: 35,
            animKey: 'tank-super',
            description: 'An explosive uppercut.',
        },
        fidget: {
            fidgetA: 'Pounds fists together.',
            fidgetB: 'Cracks neck.',
            minInterval: 2000,
            maxInterval: 6000,
        },
        isBoss: false,
    },
    {
        id: 'blueface',
        displayName: 'Blueface',
        spriteKey: 'fighter_blueface',
        tagline: 'Yeah Aight',
        dropPattern: {
            favoredColor: GemColor.BLUE,
            colorBias: 0.3,
            preferredColumns: [0, 4],
        },
        passive: {
            name: 'Yeah Aight',
            description: '15% more crash gems appear.',
            type: PassiveType.MORE_CRASH_GEMS,
            value: 0.15,
        },
        superFinisher: {
            name: 'Thotiana Tornado',
            damage: 35,
            animKey: 'blueface-super',
            description: 'A chaotic spin attack.',
        },
        fidget: {
            fidgetA: 'Does a quick dance move.',
            fidgetB: 'Wipes dirt off shoulder.',
            minInterval: 2000,
            maxInterval: 6000,
        },
        isBoss: false,
    },
    {
        id: 'n3on',
        displayName: 'N3on',
        spriteKey: 'fighter_n3on',
        tagline: 'Content King',
        dropPattern: {
            favoredColor: GemColor.GREEN,
            colorBias: 0.15,
            preferredColumns: [3, 4, 5],
        },
        passive: {
            name: 'Hype Builder',
            description: 'Generates 20% more SUPER charge.',
            type: PassiveType.BONUS_SUPER_CHARGE,
            value: 0.20,
        },
        superFinisher: {
            name: 'Stream Snipe',
            damage: 35,
            animKey: 'n3on-super',
            description: 'A targeted barrage of attacks.',
        },
        fidget: {
            fidgetA: 'Checks phone.',
            fidgetB: 'Points at imaginary camera.',
            minInterval: 2000,
            maxInterval: 6000,
        },
        isBoss: false,
    },
    {
        id: 'rayj',
        displayName: 'Ray J',
        spriteKey: 'fighter_rayj',
        tagline: 'One Wish',
        dropPattern: {
            favoredColor: GemColor.PURPLE,
            colorBias: 0.25,
            preferredColumns: [0, 1],
        },
        passive: {
            name: 'Head Start',
            description: 'Starts the match with 20% SUPER meter.',
            type: PassiveType.STARTING_SUPER,
            value: 0.20,
        },
        superFinisher: {
            name: 'Raycon Blast',
            damage: 35,
            animKey: 'rayj-super',
            description: 'Unleashes a sonic blast.',
        },
        fidget: {
            fidgetA: 'Adjusts imaginary earbuds.',
            fidgetB: 'Puts on sunglasses.',
            minInterval: 2000,
            maxInterval: 6000,
        },
        isBoss: false,
    },
    {
        id: 'chrisean',
        displayName: 'Chrisean Rock',
        spriteKey: 'fighter_chrisean',
        tagline: 'Baddies Only',
        dropPattern: {
            favoredColor: GemColor.PURPLE,
            colorBias: 0.2,
            preferredColumns: [2, 3],
        },
        passive: {
            name: 'Unbothered',
            description: 'Immune to the first garbage drop.',
            type: PassiveType.GARBAGE_SHIELD,
            value: 1,
        },
        superFinisher: {
            name: 'Rock Slide',
            damage: 35,
            animKey: 'chrisean-super',
            description: 'An aggressive rushing attack.',
        },
        fidget: {
            fidgetA: 'Fixes hair.',
            fidgetB: 'Rolls eyes and sighs.',
            minInterval: 2000,
            maxInterval: 6000,
        },
        isBoss: false,
    },
    {
        id: 'ab',
        displayName: 'AB (Antonio Brown)',
        spriteKey: 'fighter_ab',
        tagline: 'Business Is Boomin',
        dropPattern: {
            favoredColor: GemColor.YELLOW,
            colorBias: 0.2,
            preferredColumns: [1, 2, 4],
        },
        passive: {
            name: 'Playmaker',
            description: 'Power gems need 1 less gem to form.',
            type: PassiveType.EASIER_POWER_GEMS,
            value: 1,
        },
        superFinisher: {
            name: 'Touchdown Spike',
            damage: 35,
            animKey: 'ab-super',
            description: 'A massive spike attack that rocks the board.',
        },
        fidget: {
            fidgetA: 'Does a touchdown dance.',
            fidgetB: 'Strikes a pose.',
            minInterval: 2000,
            maxInterval: 6000,
        },
        isBoss: false,
    },
    {
        id: 'charleston',
        displayName: 'Charleston White',
        spriteKey: 'fighter_charleston',
        tagline: 'Truth Hurts',
        dropPattern: {
            favoredColor: GemColor.GREEN,
            colorBias: 0.15,
            preferredColumns: [3, 5],
        },
        passive: {
            name: 'Provocateur',
            description: 'Counter gems sent to opponent have 1 less turn.',
            type: PassiveType.SHORTER_COUNTER_TIMER,
            value: 1,
        },
        superFinisher: {
            name: 'Truth Bomb',
            damage: 35,
            animKey: 'charleston-super',
            description: 'Drops a massive explosive revelation.',
        },
        fidget: {
            fidgetA: 'Laughs mockingly.',
            fidgetB: 'Points accusatorially.',
            minInterval: 2000,
            maxInterval: 6000,
        },
        isBoss: false,
    },
    {
        id: 'walid',
        displayName: 'Walid Sharks',
        spriteKey: 'fighter_walid',
        tagline: 'Shark Mode',
        dropPattern: {
            favoredColor: GemColor.BLUE,
            colorBias: 0.2,
            preferredColumns: [2, 4],
        },
        passive: {
            name: 'Shark Bite',
            description: 'Garbage rows sent are concentrated (4 wide).',
            type: PassiveType.NARROWER_GARBAGE,
            value: 4,
        },
        superFinisher: {
            name: 'Shark Attack',
            damage: 35,
            animKey: 'walid-super',
            description: 'A vicious biting combination.',
        },
        fidget: {
            fidgetA: 'Makes a shark fin gesture.',
            fidgetB: 'Bites the air.',
            minInterval: 2000,
            maxInterval: 6000,
        },
        isBoss: false,
    },
    {
        id: 'adin',
        displayName: 'Adin Ross',
        spriteKey: 'fighter_adin',
        tagline: 'W Rizz',
        dropPattern: {
            favoredColor: GemColor.GREEN,
            colorBias: 0.15,
            preferredColumns: [0, 1, 2],
        },
        passive: {
            name: 'Clairvoyance',
            description: 'Can see the next 2 piece pairs instead of 1.',
            type: PassiveType.EXTENDED_PREVIEW,
            value: 2,
        },
        superFinisher: {
            name: 'Ban Hammer',
            damage: 35,
            animKey: 'adin-super',
            description: 'Drops a massive ban hammer on the opponent.',
        },
        fidget: {
            fidgetA: 'Stares blankly.',
            fidgetB: 'Shakes head in disbelief.',
            minInterval: 2000,
            maxInterval: 6000,
        },
        isBoss: false,
    },
    {
        id: 'rampage',
        displayName: 'Rampage Jackson',
        spriteKey: 'fighter_rampage',
        tagline: 'Rampage Time',
        dropPattern: {
            favoredColor: GemColor.RED,
            colorBias: 0.25,
            preferredColumns: [2, 3],
        },
        passive: {
            name: 'Intimidation',
            description: '15% slower gem fall speed.',
            type: PassiveType.SLOWER_GRAVITY,
            value: 0.15,
        },
        superFinisher: {
            name: 'Power Slam',
            damage: 35,
            animKey: 'rampage-super',
            description: 'A brutal slam attack.',
        },
        fidget: {
            fidgetA: 'Howls at the sky.',
            fidgetB: 'Beats chest.',
            minInterval: 2000,
            maxInterval: 6000,
        },
        isBoss: false,
    },
];

/**
 * Retrieves a fighter by their ID.
 * @param id The internal ID of the fighter to retrieve.
 * @returns The FighterData for the requested fighter, or throws if not found.
 */
export function getFighter(id: string): FighterData {
    const fighter = FIGHTER_ROSTER.find(f => f.id === id);
    if (!fighter) {
        throw new Error(`Fighter with id '${id}' not found in roster.`);
    }
    return fighter;
}
