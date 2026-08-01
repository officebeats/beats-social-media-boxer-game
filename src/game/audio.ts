export type SfxType =
  | "move"
  | "rotate"
  | "land"
  | "break"
  | "powerBreak"
  | "chain"
  | "super"
  | "fight"
  | "victory";

class ArcadeAudioSynth {
  private ctx: AudioContext | null = null;
  private isMuted = false;

  setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  private initCtx(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  play(type: SfxType, value = 1): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (type) {
      case "move": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.04);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }

      case "rotate": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(550, now);
        osc.frequency.exponentialRampToValueAtTime(850, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case "land": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }

      case "break": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);

        this.playNoise(ctx, now, 0.15, 0.18);
        break;
      }

      case "powerBreak": {
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = "sine";
        sub.frequency.setValueAtTime(140, now);
        sub.frequency.exponentialRampToValueAtTime(30, now + 0.35);
        subGain.gain.setValueAtTime(0.38, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        sub.connect(subGain);
        subGain.connect(ctx.destination);
        sub.start(now);
        sub.stop(now + 0.35);

        this.playNoise(ctx, now, 0.25, 0.3);
        break;
      }

      case "chain": {
        const baseFreq = 440 * Math.pow(1.22, Math.min(value - 1, 6));
        const freqs = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);
          gain.gain.setValueAtTime(0.2, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.22);
        });
        break;
      }

      case "super": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.45);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);

        this.playNoise(ctx, now + 0.2, 0.3, 0.35);
        break;
      }

      case "fight": {
        [261.63, 329.63, 392.0].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.55);
        });
        break;
      }

      case "victory": {
        const notes = [392.0, 523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.2, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.3);
        });
        break;
      }
    }
  }

  private playNoise(ctx: AudioContext, startTime: number, volume: number, duration: number): void {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1200;
    filter.Q.value = 1.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(startTime);
    noise.stop(startTime + duration);
  }
}

export const arcadeAudio = new ArcadeAudioSynth();
