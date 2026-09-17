/**
 * Sons synthétisés par Web Audio : aucun fichier audio, aucune licence.
 * Le contexte est créé paresseusement au premier son (après interaction utilisateur).
 */
export type SfxName = 'tap' | 'place' | 'clear' | 'combo' | 'merge' | 'perfect' | 'fail' | 'reward';

export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;
  private adMuted = false;

  constructor(private readonly volume = 0.35) {}

  get isMuted(): boolean {
    return this.muted;
  }

  /** Mute choisi par le joueur (persisté par le jeu). */
  setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyGain();
  }

  /** Mute imposé pendant une pub, indépendant du choix du joueur. */
  setAdMuted(muted: boolean): void {
    this.adMuted = muted;
    this.applyGain();
  }

  play(name: SfxName): void {
    if (this.muted || this.adMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') void ctx.resume();
    const t = ctx.currentTime;
    switch (name) {
      case 'tap':
        this.tone(ctx, t, 520, 0.05, 'square', 0.4);
        break;
      case 'place':
        this.tone(ctx, t, 300, 0.08, 'triangle', 0.6);
        this.tone(ctx, t + 0.02, 420, 0.08, 'triangle', 0.4);
        break;
      case 'clear':
        [660, 880, 1100].forEach((f, i) => this.tone(ctx, t + i * 0.06, f, 0.12, 'sine', 0.6));
        break;
      case 'combo':
        [523, 659, 784, 1046].forEach((f, i) => this.tone(ctx, t + i * 0.07, f, 0.16, 'sine', 0.7));
        break;
      case 'merge':
        this.sweep(ctx, t, 220, 660, 0.14, 'sine', 0.7);
        break;
      case 'perfect':
        this.tone(ctx, t, 988, 0.1, 'sine', 0.6);
        this.tone(ctx, t + 0.08, 1318, 0.18, 'sine', 0.6);
        break;
      case 'fail':
        this.sweep(ctx, t, 320, 90, 0.4, 'sawtooth', 0.5);
        break;
      case 'reward':
        [784, 988, 1175, 1568].forEach((f, i) => this.tone(ctx, t + i * 0.09, f, 0.2, 'triangle', 0.7));
        break;
    }
  }

  private ensureContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor = globalThis.AudioContext ?? (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.applyGain();
      return this.ctx;
    } catch {
      return null;
    }
  }

  private applyGain(): void {
    if (this.master) this.master.gain.value = this.muted || this.adMuted ? 0 : this.volume;
  }

  private tone(ctx: AudioContext, start: number, freq: number, dur: number, type: OscillatorType, gain: number): void {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    env.gain.setValueAtTime(0, start);
    env.gain.linearRampToValueAtTime(gain, start + 0.01);
    env.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(env).connect(this.master!);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  private sweep(ctx: AudioContext, start: number, from: number, to: number, dur: number, type: OscillatorType, gain: number): void {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, start);
    osc.frequency.exponentialRampToValueAtTime(to, start + dur);
    env.gain.setValueAtTime(gain, start);
    env.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(env).connect(this.master!);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }
}
