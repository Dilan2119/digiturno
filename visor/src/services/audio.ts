class AudioService {
  private ctx: AudioContext | null = null;
  private volume = 1;
  private _unlocked = false;

  get unlocked() { return this._unlocked; }

  unlock() {
    if (this._unlocked) return;
    try {
      this.ctx = new AudioContext();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(0);
      osc.stop(0.001);
      this._unlocked = true;
    } catch {}
  }

  private playTone(freq: number, delay: number, duration: number) {
    if (!this._unlocked || !this.ctx) return;
    const start = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(this.volume, start);
    gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(start);
    osc.stop(start + duration);
  }

  private speak(text: string) {
    if (!this._unlocked) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.1;
    utterance.volume = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  playTurnoLlamado(codigo: string, modulo: string, nombre?: string) {
    this.playTone(880, 0, 0.15);
    this.playTone(1100, 0.12, 0.15);
    this.playTone(1320, 0.35, 0.4);
    const text = `Turno ${codigo}, módulo ${modulo}${nombre ? `, ${nombre}` : ''}`;
    setTimeout(() => this.speak(text), 600);
  }

  playTurnoReLlamado(codigo: string, modulo: string, nombre?: string) {
    this.playTone(660, 0, 0.12);
    this.playTone(660, 0.18, 0.12);
    this.playTone(880, 0.45, 0.35);
    const text = `Turno ${codigo}, módulo ${modulo}${nombre ? `, ${nombre}` : ''}`;
    setTimeout(() => this.speak(text), 600);
  }
}

export const audioService = new AudioService();
