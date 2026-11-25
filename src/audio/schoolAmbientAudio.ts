import { ZoneId } from '../data/schoolData';

export interface AmbientAudioState {
  enabled: boolean;
  zone: ZoneId;
  populationRatio: number; // 0..1 based on active teachers + students
}

/**
 * 100% procedural Web Audio API ambient school soundscape engine.
 * Synthesizes courtyard wind & birdsong, soft hallway chatter & footsteps,
 * and subtle room-specific classroom ambience with smooth crossfades.
 */
export class SchoolAmbientAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  // Continuous bed gains for smooth crossfading between zones
  private windGain: GainNode | null = null;
  private chatterGain: GainNode | null = null;
  private roomToneGain: GainNode | null = null;

  private noiseBuffer: AudioBuffer | null = null;
  private sources: AudioScheduledSourceNode[] = [];
  private schedulerId: number | null = null;

  private state: AmbientAudioState = {
    enabled: false,
    zone: 'courtyard',
    populationRatio: 0.5,
  };

  private ensureInitialized(): boolean {
    if (this.ctx) return true;
    if (typeof window === 'undefined') return false;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return false;

    const ctx = new AudioCtx();
    this.ctx = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);
    this.masterGain = masterGain;

    // Shared 4-second looping pink-ish noise buffer (procedural, zero external files)
    const bufferLen = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferLen, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;
    for (let i = 0; i < bufferLen; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }
    this.noiseBuffer = buffer;

    // 1. Courtyard Wind Layer (bandpass noise with slow breathing LFO)
    const windSrc = ctx.createBufferSource();
    windSrc.buffer = buffer;
    windSrc.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 380;
    windFilter.Q.value = 1.4;

    const windLfo = ctx.createOscillator();
    windLfo.type = 'sine';
    windLfo.frequency.value = 0.14;
    const windLfoDepth = ctx.createGain();
    windLfoDepth.gain.value = 160;
    windLfo.connect(windLfoDepth);
    windLfoDepth.connect(windFilter.frequency);

    const windGain = ctx.createGain();
    windGain.gain.value = 0;

    windSrc.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(masterGain);
    windSrc.start();
    windLfo.start();
    this.sources.push(windSrc, windLfo);
    this.windGain = windGain;

    // 2. Soft Hallway / Cafeteria Chatter Layer (dual vocal-formant filtered noise)
    const chatterSrc = ctx.createBufferSource();
    chatterSrc.buffer = buffer;
    chatterSrc.loop = true;

    const formantA = ctx.createBiquadFilter();
    formantA.type = 'bandpass';
    formantA.frequency.value = 520;
    formantA.Q.value = 2.6;

    const formantB = ctx.createBiquadFilter();
    formantB.type = 'bandpass';
    formantB.frequency.value = 1280;
    formantB.Q.value = 3.2;

    const chatterLfo = ctx.createOscillator();
    chatterLfo.type = 'sine';
    chatterLfo.frequency.value = 0.35;
    const chatterLfoGain = ctx.createGain();
    chatterLfoGain.gain.value = 95;
    chatterLfo.connect(chatterLfoGain);
    chatterLfoGain.connect(formantA.frequency);

    const chatterGain = ctx.createGain();
    chatterGain.gain.value = 0;

    chatterSrc.connect(formantA);
    chatterSrc.connect(formantB);
    formantA.connect(chatterGain);
    formantB.connect(chatterGain);
    chatterGain.connect(masterGain);
    chatterSrc.start();
    chatterLfo.start();
    this.sources.push(chatterSrc, chatterLfo);
    this.chatterGain = chatterGain;

    // 3. Soft Indoor Classroom Room Tone (warm low-passed air bed)
    const roomSrc = ctx.createBufferSource();
    roomSrc.buffer = buffer;
    roomSrc.loop = true;

    const roomFilter = ctx.createBiquadFilter();
    roomFilter.type = 'lowpass';
    roomFilter.frequency.value = 260;

    const roomToneGain = ctx.createGain();
    roomToneGain.gain.value = 0;

    roomSrc.connect(roomFilter);
    roomFilter.connect(roomToneGain);
    roomToneGain.connect(masterGain);
    roomSrc.start();
    this.sources.push(roomSrc);
    this.roomToneGain = roomToneGain;

    // Periodic ambient micro-events (hallway footsteps, courtyard birds, page turns, keystrokes)
    this.schedulerId = window.setInterval(() => {
      this.triggerAmbientDetail();
    }, 850);

    return true;
  }

  private applyMix(): void {
    if (!this.ctx || !this.masterGain || !this.windGain || !this.chatterGain || !this.roomToneGain) {
      return;
    }

    const now = this.ctx.currentTime;
    const { enabled, zone, populationRatio } = this.state;
    const pop = Math.max(0, Math.min(1, populationRatio));

    this.masterGain.gain.setTargetAtTime(enabled ? 0.55 : 0.0, now, 0.25);

    if (!enabled) return;

    if (zone === 'courtyard') {
      // Gentle courtyard breeze + very distant student murmur
      this.windGain.gain.setTargetAtTime(0.32, now, 0.35);
      this.chatterGain.gain.setTargetAtTime(0.05 + pop * 0.1, now, 0.35);
      this.roomToneGain.gain.setTargetAtTime(0.0, now, 0.35);
    } else if (zone === 'corridor') {
      // Soft hallway & cafeteria chatter scaled by people count + indoor room tone
      this.windGain.gain.setTargetAtTime(0.03, now, 0.35);
      this.chatterGain.gain.setTargetAtTime(0.08 + pop * 0.24, now, 0.35);
      this.roomToneGain.gain.setTargetAtTime(0.14, now, 0.35);
    } else if (zone === 'classroom-library') {
      // Quiet reading room hush
      this.windGain.gain.setTargetAtTime(0.02, now, 0.35);
      this.chatterGain.gain.setTargetAtTime(0.015 * pop, now, 0.35);
      this.roomToneGain.gain.setTargetAtTime(0.12, now, 0.35);
    } else {
      // Math, Science, IT classrooms: calm room tone + very soft distant hallway murmur
      this.windGain.gain.setTargetAtTime(0.025, now, 0.35);
      this.chatterGain.gain.setTargetAtTime(0.03 + pop * 0.07, now, 0.35);
      this.roomToneGain.gain.setTargetAtTime(0.16, now, 0.35);
    }
  }

  private triggerAmbientDetail(): void {
    if (!this.state.enabled || !this.ctx || !this.masterGain || !this.noiseBuffer) return;
    if (this.ctx.state !== 'running') return;

    const { zone, populationRatio } = this.state;
    const roll = Math.random();

    if (zone === 'courtyard') {
      // Occasional soft courtyard bird chirp
      if (roll < 0.28) {
        this.playBirdChirp();
      } else if (roll < 0.45 && populationRatio > 0.15) {
        this.playSoftFootstep(0.045 * populationRatio);
      }
      return;
    }

    if (zone === 'corridor') {
      // Rhythmic soft hallway footsteps when people are around
      if (populationRatio > 0.05 && roll < 0.3 + populationRatio * 0.45) {
        const vol = 0.05 + populationRatio * 0.06;
        this.playSoftFootstep(vol);
        if (Math.random() < 0.65) {
          window.setTimeout(() => {
            if (this.state.enabled && this.state.zone === 'corridor') {
              this.playSoftFootstep(vol * 0.85);
            }
          }, 390 + Math.random() * 80);
        }
      }
      return;
    }

    if (zone === 'classroom-library') {
      // Soft page turn or quiet clock tick
      if (roll < 0.26 && populationRatio > 0.05) {
        this.playPageTurn();
      } else if (roll > 0.72) {
        this.playSoftClockTick();
      }
      return;
    }

    if (zone === 'classroom-it') {
      // Gentle soft typing clicks
      if (populationRatio > 0.05 && roll < 0.32 + populationRatio * 0.35) {
        this.playSoftKeystroke();
        if (Math.random() < 0.7) {
          window.setTimeout(() => this.playSoftKeystroke(), 120 + Math.random() * 140);
        }
      }
      return;
    }

    if (zone === 'classroom-science') {
      // Subtle glass clink / water bubble pop
      if (roll < 0.24) {
        this.playLabBubble();
      }
      return;
    }

    // Room 101 Math: occasional soft chalk/page rustle
    if (roll < 0.24 && populationRatio > 0.05) {
      this.playPageTurn();
    }
  }

  private playSoftFootstep(volume: number): void {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;

    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 180 + Math.random() * 130;
    filter.Q.value = 1.8;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    src.start(now, Math.random() * 2.5, 0.13);
  }

  private playBirdChirp(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    const baseFreq = 2300 + Math.random() * 900;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.28, now + 0.07);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.92, now + 0.16);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.022, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  private playPageTurn(): void {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;

    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1800;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.032, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    src.start(now, Math.random() * 2.0, 0.26);
  }

  private playSoftClockTick(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1150, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.02);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.016, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  private playSoftKeystroke(): void {
    if (!this.state.enabled || !this.ctx || !this.masterGain || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;

    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2100 + Math.random() * 700;
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.025, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start(now, Math.random() * 2.5, 0.045);
  }

  private playLabBubble(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    const f = 420 + Math.random() * 260;
    osc.frequency.setValueAtTime(f, now);
    osc.frequency.exponentialRampToValueAtTime(f * 1.9, now + 0.09);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.018, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  public updateState(next: AmbientAudioState): void {
    this.state = next;

    if (next.enabled) {
      if (!this.ensureInitialized()) return;
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
    }

    this.applyMix();
  }

  public dispose(): void {
    if (this.schedulerId !== null) {
      clearInterval(this.schedulerId);
      this.schedulerId = null;
    }
    this.sources.forEach((s) => {
      try {
        s.stop();
      } catch {
        // Ignore already stopped source
      }
    });
    this.sources = [];
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
    this.masterGain = null;
    this.windGain = null;
    this.chatterGain = null;
    this.roomToneGain = null;
    this.noiseBuffer = null;
  }
}
