/**
 * SoundManager.js
 * Generates tactile audio feedback using procedural Web Audio API synthesis.
 * Completely standalone without requiring external audio files.
 */
class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.inverterHumNode = null;
    this.inverterGainNode = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.inverterGainNode) {
      this.inverterGainNode.gain.value = 0;
    }
    return this.enabled;
  }

  playSwitch(isOn) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Primary mechanical snap
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(isOn ? 1200 : 700, t);
    osc1.frequency.exponentialRampToValueAtTime(isOn ? 200 : 120, t + 0.04);
    gain1.gain.setValueAtTime(0.35, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.05);

    // Secondary click bounce
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(isOn ? 900 : 500, t + 0.015);
    osc2.frequency.exponentialRampToValueAtTime(80, t + 0.045);
    gain2.gain.setValueAtTime(0.2, t + 0.015);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(t + 0.015);
    osc2.stop(t + 0.05);
  }

  playDrawer(opening) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Friction slide sound with filtered noise
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(opening ? 450 : 350, t);
    filter.frequency.linearRampToValueAtTime(opening ? 280 : 520, t + 0.3);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);

    // Stop clunk at completion
    const clunk = this.ctx.createOscillator();
    const clunkGain = this.ctx.createGain();
    clunk.type = 'sine';
    clunk.frequency.setValueAtTime(opening ? 160 : 120, t + 0.32);
    clunk.frequency.exponentialRampToValueAtTime(40, t + 0.42);
    clunkGain.gain.setValueAtTime(0.2, t + 0.32);
    clunkGain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
    clunk.connect(clunkGain);
    clunkGain.connect(this.ctx.destination);
    clunk.start(t + 0.32);
    clunk.stop(t + 0.42);
  }

  playPhoneConnect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Pleasant dual chime (C6 -> E6 -> G6)
    [
      { freq: 523.25, time: 0 },
      { freq: 659.25, time: 0.08 },
      { freq: 783.99, time: 0.16 }
    ].forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, t + note.time);
      gain.gain.setValueAtTime(0.18, t + note.time);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.time + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + note.time);
      osc.stop(t + note.time + 0.35);
    });
  }

  playPhoneDisconnect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Pleasant descending chime (G6 -> C6)
    [
      { freq: 783.99, time: 0 },
      { freq: 523.25, time: 0.09 }
    ].forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, t + note.time);
      gain.gain.setValueAtTime(0.14, t + note.time);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.time + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + note.time);
      osc.stop(t + note.time + 0.25);
    });
  }

  playBeep() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.5, t);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  setInverterHum(active, loadFactor = 0.5) {
    if (!this.enabled || !active) {
      if (this.inverterGainNode) {
        this.inverterGainNode.gain.setTargetAtTime(0, this.ctx ? this.ctx.currentTime : 0, 0.2);
      }
      return;
    }
    this.init();
    if (!this.ctx) return;

    if (!this.inverterHumNode) {
      this.inverterHumNode = this.ctx.createOscillator();
      this.inverterHumNode.type = 'sawtooth';
      this.inverterHumNode.frequency.setValueAtTime(60, this.ctx.currentTime); // 60 Hz hum

      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(180, this.ctx.currentTime);

      this.inverterGainNode = this.ctx.createGain();
      this.inverterGainNode.gain.setValueAtTime(0, this.ctx.currentTime);

      this.inverterHumNode.connect(lowpass);
      lowpass.connect(this.inverterGainNode);
      this.inverterGainNode.connect(this.ctx.destination);
      this.inverterHumNode.start();
    }

    const targetGain = Math.min(0.03, 0.01 + loadFactor * 0.02);
    this.inverterGainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.3);
  }
}

export const soundManager = new SoundManager();
