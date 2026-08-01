/**
 * Crash Out: Ring Rush — Audio Manager
 *
 * Wraps Phaser's Sound Manager with procedural Web Audio synthesis
 * for chiptune-style SFX. This is the ONLY engine module that
 * references Phaser (via the scene's sound manager).
 */

/** Audio event types that can be triggered */
export enum SFX {
    /** Gem lands on the board */
    GEM_LAND = 'GEM_LAND',
    /** Match detected — gems clearing */
    GEM_MATCH = 'GEM_MATCH',
    /** Chain combo link */
    CHAIN_LINK = 'CHAIN_LINK',
    /** Power gem formed */
    POWER_GEM_FORM = 'POWER_GEM_FORM',
    /** Power gem detonated */
    POWER_GEM_DETONATE = 'POWER_GEM_DETONATE',
    /** Crash gem detonated */
    CRASH_GEM = 'CRASH_GEM',
    /** SUPER meter full */
    SUPER_READY = 'SUPER_READY',
    /** SUPER activation */
    SUPER_ACTIVATE = 'SUPER_ACTIVATE',
    /** SUPER impact */
    SUPER_IMPACT = 'SUPER_IMPACT',
    /** KO hit */
    KO_HIT = 'KO_HIT',
    /** Crowd roar */
    CROWD_ROAR = 'CROWD_ROAR',
    /** Menu cursor move */
    MENU_MOVE = 'MENU_MOVE',
    /** Menu confirm */
    MENU_CONFIRM = 'MENU_CONFIRM',
    /** Menu back */
    MENU_BACK = 'MENU_BACK',
    /** Garbage received */
    GARBAGE_DROP = 'GARBAGE_DROP',
    /** Round countdown beep */
    COUNTDOWN = 'COUNTDOWN',
    /** Round start bell */
    ROUND_BELL = 'ROUND_BELL',
    /** Gem rotate */
    GEM_ROTATE = 'GEM_ROTATE',
    /** Hard drop whoosh */
    HARD_DROP = 'HARD_DROP',
    /** Pause */
    PAUSE = 'PAUSE',
}

/**
 * Procedural audio synthesizer parameters for each SFX.
 * These define the waveform, frequency, duration, and envelope
 * for each sound effect.
 */
interface SynthParams {
    waveform: OscillatorType;
    frequency: number;
    /** Frequency at end of note (for pitch bend) */
    frequencyEnd?: number;
    duration: number;
    /** Attack time in seconds */
    attack: number;
    /** Decay time in seconds */
    decay: number;
    /** Volume (0-1) */
    volume: number;
    /** Optional detune in cents */
    detune?: number;
}

/** SFX synthesis presets */
const SFX_PARAMS: Record<SFX, SynthParams> = {
    [SFX.GEM_LAND]:             { waveform: 'square',   frequency: 200, frequencyEnd: 150,  duration: 0.08, attack: 0.005, decay: 0.07, volume: 0.3 },
    [SFX.GEM_MATCH]:            { waveform: 'square',   frequency: 440, frequencyEnd: 880,  duration: 0.15, attack: 0.01,  decay: 0.12, volume: 0.4 },
    [SFX.CHAIN_LINK]:           { waveform: 'square',   frequency: 523, frequencyEnd: 1047, duration: 0.2,  attack: 0.01,  decay: 0.15, volume: 0.45 },
    [SFX.POWER_GEM_FORM]:       { waveform: 'sine',     frequency: 330, frequencyEnd: 660,  duration: 0.25, attack: 0.02,  decay: 0.2,  volume: 0.35 },
    [SFX.POWER_GEM_DETONATE]:   { waveform: 'sawtooth', frequency: 110, frequencyEnd: 55,   duration: 0.4,  attack: 0.01,  decay: 0.35, volume: 0.6 },
    [SFX.CRASH_GEM]:            { waveform: 'sawtooth', frequency: 880, frequencyEnd: 110,  duration: 0.5,  attack: 0.005, decay: 0.45, volume: 0.5 },
    [SFX.SUPER_READY]:          { waveform: 'sine',     frequency: 660, frequencyEnd: 1320, duration: 0.6,  attack: 0.05,  decay: 0.5,  volume: 0.5 },
    [SFX.SUPER_ACTIVATE]:       { waveform: 'sawtooth', frequency: 220, frequencyEnd: 1760, duration: 0.8,  attack: 0.01,  decay: 0.7,  volume: 0.7 },
    [SFX.SUPER_IMPACT]:         { waveform: 'square',   frequency: 55,  frequencyEnd: 27.5, duration: 0.5,  attack: 0.005, decay: 0.45, volume: 0.8 },
    [SFX.KO_HIT]:               { waveform: 'sawtooth', frequency: 80,  frequencyEnd: 40,   duration: 0.6,  attack: 0.005, decay: 0.55, volume: 0.9 },
    [SFX.CROWD_ROAR]:           { waveform: 'sawtooth', frequency: 200, frequencyEnd: 400,  duration: 1.0,  attack: 0.1,   decay: 0.8,  volume: 0.3 },
    [SFX.MENU_MOVE]:            { waveform: 'square',   frequency: 800,                     duration: 0.05, attack: 0.005, decay: 0.04, volume: 0.25 },
    [SFX.MENU_CONFIRM]:         { waveform: 'square',   frequency: 600, frequencyEnd: 1200, duration: 0.12, attack: 0.005, decay: 0.1,  volume: 0.35 },
    [SFX.MENU_BACK]:            { waveform: 'square',   frequency: 400, frequencyEnd: 200,  duration: 0.1,  attack: 0.005, decay: 0.08, volume: 0.3 },
    [SFX.GARBAGE_DROP]:         { waveform: 'sawtooth', frequency: 100, frequencyEnd: 60,   duration: 0.3,  attack: 0.01,  decay: 0.25, volume: 0.5 },
    [SFX.COUNTDOWN]:            { waveform: 'sine',     frequency: 440,                     duration: 0.15, attack: 0.01,  decay: 0.12, volume: 0.4 },
    [SFX.ROUND_BELL]:           { waveform: 'sine',     frequency: 880,                     duration: 0.8,  attack: 0.01,  decay: 0.7,  volume: 0.5 },
    [SFX.GEM_ROTATE]:           { waveform: 'square',   frequency: 600,                     duration: 0.04, attack: 0.005, decay: 0.03, volume: 0.2 },
    [SFX.HARD_DROP]:            { waveform: 'sawtooth', frequency: 300, frequencyEnd: 100,  duration: 0.1,  attack: 0.005, decay: 0.08, volume: 0.4 },
    [SFX.PAUSE]:                { waveform: 'sine',     frequency: 330, frequencyEnd: 220,  duration: 0.2,  attack: 0.01,  decay: 0.15, volume: 0.3 },
};

/**
 * Audio Manager — creates and plays procedural SFX via Web Audio API.
 *
 * Usage:
 * ```typescript
 * const audio = new AudioManager();
 * audio.play(SFX.GEM_MATCH);
 * audio.play(SFX.CHAIN_LINK);
 * ```
 */
export class AudioManager {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private _muted = false;
    private _volume = 1.0;

    /** Initialize the Web Audio context (must be called after user gesture) */
    init(): void {
        if (this.ctx) return;
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this._volume;
        this.masterGain.connect(this.ctx.destination);
    }

    /** Resume audio context (required after browser auto-suspend) */
    async resume(): Promise<void> {
        if (this.ctx?.state === 'suspended') {
            await this.ctx.resume();
        }
    }

    /** Play a procedural SFX */
    play(sfx: SFX): void {
        if (this._muted || !this.ctx || !this.masterGain) return;

        const params = SFX_PARAMS[sfx];
        const now = this.ctx.currentTime;

        // Oscillator
        const osc = this.ctx.createOscillator();
        osc.type = params.waveform;
        osc.frequency.setValueAtTime(params.frequency, now);
        if (params.frequencyEnd) {
            osc.frequency.linearRampToValueAtTime(params.frequencyEnd, now + params.duration);
        }
        if (params.detune) {
            osc.detune.setValueAtTime(params.detune, now);
        }

        // Envelope (gain)
        const env = this.ctx.createGain();
        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(params.volume, now + params.attack);
        env.gain.linearRampToValueAtTime(0, now + params.attack + params.decay);

        // Connect: osc → envelope → master gain → destination
        osc.connect(env);
        env.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + params.duration + 0.01);
    }

    /** Play a chain link SFX with pitch increase per chain level */
    playChain(chainLevel: number): void {
        if (this._muted || !this.ctx || !this.masterGain) return;

        const baseParams = SFX_PARAMS[SFX.CHAIN_LINK];
        const pitchMultiplier = 1 + (chainLevel - 1) * 0.15; // 15% higher per chain
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        osc.type = baseParams.waveform;
        osc.frequency.setValueAtTime(baseParams.frequency * pitchMultiplier, now);
        if (baseParams.frequencyEnd) {
            osc.frequency.linearRampToValueAtTime(
                baseParams.frequencyEnd * pitchMultiplier,
                now + baseParams.duration,
            );
        }

        const env = this.ctx.createGain();
        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(baseParams.volume, now + baseParams.attack);
        env.gain.linearRampToValueAtTime(0, now + baseParams.attack + baseParams.decay);

        osc.connect(env);
        env.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + baseParams.duration + 0.01);
    }

    /** Set master volume (0.0 to 1.0) */
    setVolume(vol: number): void {
        this._volume = Math.max(0, Math.min(1, vol));
        if (this.masterGain) {
            this.masterGain.gain.value = this._volume;
        }
    }

    /** Get current volume */
    get volume(): number {
        return this._volume;
    }

    /** Toggle mute */
    toggleMute(): void {
        this._muted = !this._muted;
    }

    /** Set mute state */
    set muted(value: boolean) {
        this._muted = value;
    }

    /** Get mute state */
    get muted(): boolean {
        return this._muted;
    }
}

/** Singleton audio manager instance */
export const audioManager = new AudioManager();
