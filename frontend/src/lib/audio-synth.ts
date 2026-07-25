// frontend/src/lib/audio-synth.ts
// Synthesizes dynamic, professional telephony sound cues via the Web Audio API.

class AudioSynthManager {
  private audioCtx: AudioContext | null = null;
  private intervalId: any = null;
  private activeNodes: AudioNode[] = [];

  private initCtx() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playIncomingRingtone() {
    this.stop();
    const ctx = this.initCtx();
    const playRing = () => {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(480, now);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
      gain.gain.setValueAtTime(0.12, now + 1.5);
      gain.gain.linearRampToValueAtTime(0, now + 1.6);

      osc1.start(now);
      osc1.stop(now + 1.6);
      osc2.start(now);
      osc2.stop(now + 1.6);

      this.activeNodes.push(osc1, osc2, gain);
    };

    playRing();
    this.intervalId = setInterval(playRing, 3000);
  }

  playOutgoingRingback() {
    this.stop();
    const ctx = this.initCtx();
    const playRingback = () => {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.setValueAtTime(400, now);
      osc2.frequency.setValueAtTime(450, now);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
      gain.gain.setValueAtTime(0.08, now + 1.2);
      gain.gain.linearRampToValueAtTime(0, now + 1.3);

      osc1.start(now);
      osc1.stop(now + 1.3);
      osc2.start(now);
      osc2.stop(now + 1.3);

      this.activeNodes.push(osc1, osc2, gain);
    };

    playRingback();
    this.intervalId = setInterval(playRingback, 3000);
  }

  playConnectedTone() {
    this.stop();
    const ctx = this.initCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
    gain.gain.linearRampToValueAtTime(0, now + 0.25);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  playCallEndedTone() {
    this.stop();
    const ctx = this.initCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  playBusyTone() {
    this.stop();
    const ctx = this.initCtx();
    const playBeep = () => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.setValueAtTime(480, now);
      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gain.gain.setValueAtTime(0.15, now + 0.3);
      gain.gain.linearRampToValueAtTime(0, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.35);
      this.activeNodes.push(osc, gain);
    };

    playBeep();
    this.intervalId = setInterval(playBeep, 700);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.activeNodes.forEach(node => {
      try {
        if ('stop' in node) {
          (node as any).stop();
        }
      } catch (e) {}
    });
    this.activeNodes = [];
  }
}

export const audioSynth = new AudioSynthManager();
