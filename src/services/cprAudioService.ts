/**
 * Offline CPR Web Audio Service
 * Provides AHA-compliant chest compression rhythm (100-120 BPM, default 110 BPM).
 * Synthesizes audio locally via the Web Audio API with zero network requests.
 */

export interface CprState {
  status: 'stopped' | 'running' | 'paused';
  bpm: number;
  compressionCount: number;
  cycleCount: number; // Cycles of 30 compressions
  currentInCycle: number; // 1 to 30
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export type CprListener = (state: CprState) => void;

class CprAudioService {
  private audioContext: AudioContext | null = null;
  private intervalId: any = null;
  private bpm: number = 110;
  private status: 'stopped' | 'running' | 'paused' = 'stopped';
  private compressionCount: number = 0;
  private soundEnabled: boolean = true;
  private vibrationEnabled: boolean = true;
  private listeners: Set<CprListener> = new Set();

  constructor() {
    this.bpm = 110;
  }

  public subscribe(listener: CprListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  public getState(): CprState {
    const currentInCycle = this.compressionCount % 30 === 0 && this.compressionCount > 0 
      ? 30 
      : this.compressionCount % 30;
    const cycleCount = Math.floor(this.compressionCount / 30);

    return {
      status: this.status,
      bpm: this.bpm,
      compressionCount: this.compressionCount,
      cycleCount,
      currentInCycle,
      soundEnabled: this.soundEnabled,
      vibrationEnabled: this.vibrationEnabled,
    };
  }

  private getAudioContext(): AudioContext | null {
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
        }
      }
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      return this.audioContext;
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
      return null;
    }
  }

  /**
   * Generates a clear synthesized pulse beat.
   * Compression 30 produces a distinct dual-tone cue indicating 2 rescue breaths.
   */
  private playPulse(isMilestone: boolean) {
    if (this.soundEnabled) {
      const ctx = this.getAudioContext();
      if (ctx) {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = isMilestone ? 'triangle' : 'sine';
          // 1000Hz alert for 30th compression, 800Hz for standard compression
          const freq = isMilestone ? 1046.5 : 880; 
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          const duration = isMilestone ? 0.12 : 0.06;
          gain.gain.setValueAtTime(0.35, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + duration);
        } catch (e) {
          console.warn('Pulse synthesis error', e);
        }
      }
    }

    // Haptic vibration feedback for mobile devices
    if (this.vibrationEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(isMilestone ? [60, 40, 60] : [35]);
      } catch {
        // Ignore vibration errors if blocked by browser policy
      }
    }
  }

  private tick() {
    this.compressionCount += 1;
    const is30th = this.compressionCount % 30 === 0;
    this.playPulse(is30th);
    this.notify();
  }

  public start() {
    if (this.status === 'running') return;

    this.getAudioContext();
    this.status = 'running';
    this.tick();

    const intervalMs = (60 / this.bpm) * 1000;
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.tick(), intervalMs);

    this.notify();
  }

  public pause() {
    if (this.status !== 'running') return;
    this.status = 'paused';
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.notify();
  }

  public resume() {
    if (this.status !== 'paused') return;
    this.status = 'running';
    this.getAudioContext();

    const intervalMs = (60 / this.bpm) * 1000;
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.tick(), intervalMs);

    this.notify();
  }

  public stop() {
    this.status = 'stopped';
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.compressionCount = 0;
    this.notify();
  }

  public setBpm(newBpm: number) {
    // AHA recommends 100 to 120 compressions per minute
    const clamped = Math.max(100, Math.min(120, Math.round(newBpm)));
    this.bpm = clamped;

    if (this.status === 'running') {
      if (this.intervalId) clearInterval(this.intervalId);
      const intervalMs = (60 / this.bpm) * 1000;
      this.intervalId = setInterval(() => this.tick(), intervalMs);
    }
    this.notify();
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    this.notify();
  }

  public setVibrationEnabled(enabled: boolean) {
    this.vibrationEnabled = enabled;
    this.notify();
  }
}

export const cprAudioService = new CprAudioService();
