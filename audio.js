/**
 * 8-bit Sound Effects & Music using Web Audio API
 */

const AudioSystem = {
  ctx: null,
  enabled: true,
  musicPlaying: false,
  musicNodes: [],

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio not supported');
      this.enabled = false;
    }
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopMusic();
    }
    return this.enabled;
  },

  // Play a simple 8-bit tone
  playTone(freq, duration, type, volume, delay) {
    if (!this.enabled || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime + (delay || 0);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume || 0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + duration);
  },

  // Pet sound — gentle ascending notes
  pet() {
    this.playTone(523, 0.1, 'square', 0.08, 0);
    this.playTone(659, 0.1, 'square', 0.08, 0.08);
    this.playTone(784, 0.15, 'square', 0.06, 0.16);
  },

  // Bark — short punchy
  bark() {
    this.playTone(300, 0.08, 'square', 0.12, 0);
    this.playTone(450, 0.12, 'square', 0.1, 0.06);
  },

  // Happy bark — higher pitch
  happyBark() {
    this.playTone(400, 0.06, 'square', 0.1, 0);
    this.playTone(600, 0.06, 'square', 0.1, 0.06);
    this.playTone(800, 0.1, 'square', 0.08, 0.12);
    this.playTone(1000, 0.15, 'triangle', 0.06, 0.18);
  },

  // Eat / treat sound
  eat() {
    this.playTone(200, 0.05, 'square', 0.1, 0);
    this.playTone(250, 0.05, 'square', 0.1, 0.08);
    this.playTone(200, 0.05, 'square', 0.1, 0.16);
    this.playTone(300, 0.1, 'triangle', 0.08, 0.24);
  },

  // Play / bounce sound
  play() {
    const notes = [523, 587, 659, 784, 880];
    notes.forEach((n, i) => {
      this.playTone(n, 0.08, 'square', 0.07, i * 0.07);
    });
  },

  // Sleep / snore
  snore() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.linearRampToValueAtTime(60, t + 0.5);
    osc.frequency.linearRampToValueAtTime(80, t + 1);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.04, t + 0.2);
    gain.gain.linearRampToValueAtTime(0.02, t + 0.5);
    gain.gain.linearRampToValueAtTime(0.04, t + 0.8);
    gain.gain.linearRampToValueAtTime(0, t + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 1.2);
  },

  // Ambient background music — simple looping melody
  startMusic() {
    if (!this.enabled || !this.ctx || this.musicPlaying) return;
    this.resume();
    this.musicPlaying = true;
    this._playMusicLoop();
  },

  stopMusic() {
    this.musicPlaying = false;
  },

  _playMusicLoop() {
    if (!this.musicPlaying || !this.enabled) return;

    // Simple pentatonic melody
    const melody = [
      392, 0, 440, 0, 523, 0, 440, 0,
      392, 0, 349, 0, 330, 0, 349, 0,
      392, 0, 523, 0, 587, 0, 523, 0,
      440, 0, 392, 0, 349, 0, 0, 0,
    ];

    const noteLen = 0.22;
    melody.forEach((freq, i) => {
      if (freq > 0) {
        this.playTone(freq, noteLen * 0.8, 'triangle', 0.025, i * noteLen);
      }
    });

    // Loop after melody finishes
    const loopTime = melody.length * noteLen * 1000;
    const timerId = setTimeout(() => this._playMusicLoop(), loopTime);

    // Store for cleanup
    this._musicTimer = timerId;
  },
};
