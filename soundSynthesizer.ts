/**
 * Web Audio API synthesizer for realistic Police Sirens, dispatch radio beeps, and emergency audio.
 * 100% Client-side. Zero external backend required.
 */

export type PoliceSirenTone = 'YELP' | 'WAIL' | 'HILO' | 'AIRHORN' | 'KOLKATA_112' | 'CUSTOM';

let sirenAudioContext: AudioContext | null = null;
let activeOsc1: OscillatorNode | null = null;
let activeOsc2: OscillatorNode | null = null;
let activeLFO: OscillatorNode | null = null;
let activeLFOGain: GainNode | null = null;
let activeFilter: BiquadFilterNode | null = null;
let activeMasterGain: GainNode | null = null;
let hiLoIntervalId: number | null = null;
let currentSirenTone: PoliceSirenTone | null = null;
let isSirenActive = false;

// Custom uploaded audio storage in localStorage / memory
let customAudioElement: HTMLAudioElement | null = null;
let customAudioDataUrl: string | null = null;

try {
  const saved = localStorage.getItem('shakti_custom_siren_audio');
  if (saved) {
    customAudioDataUrl = saved;
  }
} catch (e) {}

export function setCustomSirenAudio(dataUrl: string, name?: string) {
  customAudioDataUrl = dataUrl;
  try {
    localStorage.setItem('shakti_custom_siren_audio', dataUrl);
    if (name) {
      localStorage.setItem('shakti_custom_siren_name', name);
    }
  } catch (e) {
    console.warn('Could not save custom siren to localStorage:', e);
  }
}

export function getCustomSirenAudio(): { dataUrl: string | null; name: string } {
  const name = localStorage.getItem('shakti_custom_siren_name') || 'Custom Uploaded Siren';
  return { dataUrl: customAudioDataUrl, name };
}

export function removeCustomSirenAudio() {
  customAudioDataUrl = null;
  try {
    localStorage.removeItem('shakti_custom_siren_audio');
    localStorage.removeItem('shakti_custom_siren_name');
  } catch (e) {}
  if (customAudioElement) {
    customAudioElement.pause();
    customAudioElement = null;
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sirenAudioContext || sirenAudioContext.state === 'closed') {
    sirenAudioContext = new AudioCtx();
  }
  if (sirenAudioContext.state === 'suspended') {
    sirenAudioContext.resume().catch(() => {});
  }
  return sirenAudioContext;
}

/**
 * Starts realistic acoustic police vehicle siren with authentic frequency glide,
 * dual harmonic oscillators, loudspeaker cabinet resonance, or custom audio file.
 */
export function startPoliceSiren(tone: PoliceSirenTone = 'YELP', volume = 0.5) {
  stopPoliceSiren();

  if (tone === 'CUSTOM') {
    if (customAudioDataUrl) {
      try {
        if (!customAudioElement) {
          customAudioElement = new Audio(customAudioDataUrl);
          customAudioElement.loop = true;
        } else {
          customAudioElement.src = customAudioDataUrl;
          customAudioElement.loop = true;
        }
        customAudioElement.volume = Math.max(0.1, Math.min(1.0, volume));
        customAudioElement.play().catch(e => {
          console.warn('Custom audio playback failed, falling back to synthesis:', e);
          startPoliceSiren('KOLKATA_112', volume);
        });
        currentSirenTone = 'CUSTOM';
        isSirenActive = true;
        return;
      } catch (e) {
        console.error('Error playing custom audio:', e);
      }
    }
    // Fallback if no custom audio uploaded
    tone = 'KOLKATA_112';
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.01, now);
    masterGain.gain.exponentialRampToValueAtTime(Math.min(1.0, volume), now + 0.15);

    // Cabinet filter to simulate roof-mounted loudspeaker horn projection
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2800, now);
    filter.Q.setValueAtTime(2.2, now);

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    if (tone === 'KOLKATA_112') {
      // Authentic West Bengal / Kolkata Police PCR Van Yelp & Wail Combo (850Hz <-> 1650Hz dual sweep)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const subOsc = ctx.createOscillator();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      subOsc.type = 'sine';

      osc1.frequency.setValueAtTime(1150, now);
      osc2.frequency.setValueAtTime(1156, now); // slight chorus spread
      subOsc.frequency.setValueAtTime(575, now);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sawtooth';
      lfo.frequency.setValueAtTime(2.6, now); // 2.6Hz high speed Indian PCR modulation
      lfoGain.gain.setValueAtTime(460, now);

      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      const oscGain1 = ctx.createGain();
      const oscGain2 = ctx.createGain();
      const subGain = ctx.createGain();
      oscGain1.gain.value = 0.65;
      oscGain2.gain.value = 0.35;
      subGain.gain.value = 0.25;

      osc1.connect(oscGain1);
      osc2.connect(oscGain2);
      subOsc.connect(subGain);

      oscGain1.connect(filter);
      oscGain2.connect(filter);
      subGain.connect(filter);

      lfo.start(now);
      osc1.start(now);
      osc2.start(now);
      subOsc.start(now);

      activeOsc1 = osc1;
      activeOsc2 = osc2;
      activeLFO = lfo;
      activeLFOGain = lfoGain;
    } else if (tone === 'WAIL') {
      // Classic Indian / International Police Slow Wail (600Hz <-> 1450Hz over ~3.8s)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(900, now);
      osc2.frequency.setValueAtTime(904, now); // subtle detune chorus

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'triangle';
      lfo.frequency.setValueAtTime(0.26, now); // ~3.8 sec full period cycle
      lfoGain.gain.setValueAtTime(450, now); // +/- 450Hz sweep

      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      const oscGain1 = ctx.createGain();
      const oscGain2 = ctx.createGain();
      oscGain1.gain.value = 0.65;
      oscGain2.gain.value = 0.35;

      osc1.connect(oscGain1);
      osc2.connect(oscGain2);
      oscGain1.connect(filter);
      oscGain2.connect(filter);

      lfo.start(now);
      osc1.start(now);
      osc2.start(now);

      activeOsc1 = osc1;
      activeOsc2 = osc2;
      activeLFO = lfo;
      activeLFOGain = lfoGain;
    } else if (tone === 'YELP') {
      // Authentic Rapid PCR Van Yelp (750Hz <-> 1550Hz at ~3.2Hz rapid sweep)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(1100, now);
      osc2.frequency.setValueAtTime(1103, now);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sawtooth'; // Classic sharp rising Yelp curve
      lfo.frequency.setValueAtTime(3.2, now); // 3.2 sweeps per second
      lfoGain.gain.setValueAtTime(420, now);

      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      const oscGain1 = ctx.createGain();
      const oscGain2 = ctx.createGain();
      oscGain1.gain.value = 0.7;
      oscGain2.gain.value = 0.3;

      osc1.connect(oscGain1);
      osc2.connect(oscGain2);
      oscGain1.connect(filter);
      oscGain2.connect(filter);

      lfo.start(now);
      osc1.start(now);
      osc2.start(now);

      activeOsc1 = osc1;
      activeOsc2 = osc2;
      activeLFO = lfo;
      activeLFOGain = lfoGain;
    } else if (tone === 'HILO') {
      // European / Hi-Lo Piercing Two-Tone (920Hz and 700Hz alternating)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc2.type = 'square';

      osc1.frequency.setValueAtTime(920, now);
      osc2.frequency.setValueAtTime(920, now);

      const oscGain1 = ctx.createGain();
      const oscGain2 = ctx.createGain();
      oscGain1.gain.value = 0.55;
      oscGain2.gain.value = 0.25;

      osc1.connect(oscGain1);
      osc2.connect(oscGain2);
      oscGain1.connect(filter);
      oscGain2.connect(filter);

      osc1.start(now);
      osc2.start(now);

      let isHigh = true;
      hiLoIntervalId = window.setInterval(() => {
        if (!activeOsc1 || !activeOsc2 || !sirenAudioContext) return;
        const t = sirenAudioContext.currentTime;
        const targetFreq = isHigh ? 700 : 920;
        activeOsc1.frequency.setTargetAtTime(targetFreq, t, 0.02);
        activeOsc2.frequency.setTargetAtTime(targetFreq, t, 0.02);
        isHigh = !isHigh;
      }, 480);

      activeOsc1 = osc1;
      activeOsc2 = osc2;
    } else if (tone === 'AIRHORN') {
      // Powerful Heavy Police Airhorn Blast (Deep 435Hz + 580Hz dual blast with brass formant)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const subOsc = ctx.createOscillator();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      subOsc.type = 'triangle';

      osc1.frequency.setValueAtTime(435, now);
      osc2.frequency.setValueAtTime(580, now); // Major Third / Fourth power chord
      subOsc.frequency.setValueAtTime(217.5, now);

      // Mild vibrato on horn
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(14, now);
      lfoGain.gain.setValueAtTime(8, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      const hornGain = ctx.createGain();
      hornGain.gain.value = 0.45;

      osc1.connect(hornGain);
      osc2.connect(hornGain);
      subOsc.connect(hornGain);
      hornGain.connect(filter);

      lfo.start(now);
      osc1.start(now);
      osc2.start(now);
      subOsc.start(now);

      activeOsc1 = osc1;
      activeOsc2 = osc2;
      activeLFO = lfo;
      activeLFOGain = lfoGain;
    }

    activeFilter = filter;
    activeMasterGain = masterGain;
    currentSirenTone = tone;
    isSirenActive = true;
  } catch (e) {
    console.error('Error starting police siren:', e);
  }
}

export function stopPoliceSiren() {
  if (customAudioElement) {
    try {
      customAudioElement.pause();
      customAudioElement.currentTime = 0;
    } catch (e) {}
  }

  if (hiLoIntervalId) {
    clearInterval(hiLoIntervalId);
    hiLoIntervalId = null;
  }

  if (activeMasterGain && sirenAudioContext) {
    try {
      const now = sirenAudioContext.currentTime;
      activeMasterGain.gain.setValueAtTime(activeMasterGain.gain.value, now);
      activeMasterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    } catch (e) {}
  }

  setTimeout(() => {
    try {
      if (activeOsc1) {
        activeOsc1.stop();
        activeOsc1.disconnect();
      }
      if (activeOsc2) {
        activeOsc2.stop();
        activeOsc2.disconnect();
      }
      if (activeLFO) {
        activeLFO.stop();
        activeLFO.disconnect();
      }
      if (activeLFOGain) activeLFOGain.disconnect();
      if (activeFilter) activeFilter.disconnect();
      if (activeMasterGain) activeMasterGain.disconnect();
    } catch (e) {}

    activeOsc1 = null;
    activeOsc2 = null;
    activeLFO = null;
    activeLFOGain = null;
    activeFilter = null;
    activeMasterGain = null;
    currentSirenTone = null;
    isSirenActive = false;
  }, 130);
}

export function isPoliceSirenPlaying(): boolean {
  return isSirenActive;
}

export function getCurrentSirenTone(): PoliceSirenTone | null {
  return currentSirenTone;
}

/**
 * Compatible bridge for startPiercingAlarm
 */
export function startPiercingAlarm(type: 'POLICE' | 'HIGH_ALARM' | 'STUTTER' = 'POLICE') {
  if (type === 'POLICE') {
    startPoliceSiren('YELP', 0.6);
  } else if (type === 'HIGH_ALARM') {
    startPoliceSiren('WAIL', 0.6);
  } else {
    startPoliceSiren('HILO', 0.6);
  }
}

export function stopPiercingAlarm() {
  stopPoliceSiren();
}

export function isAlarmRunning(): boolean {
  return isSirenActive;
}

/**
 * Police Radio Dispatch Beep
 */
export function playDispatchRadioChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.08);
    osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.16);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

/**
 * Fake Phone Ringtone generator (Indian standard dual-tone multi-frequency ring pattern)
 */
export function playFakeRingtone(): () => void {
  const ctx = getAudioContext();
  if (!ctx) return () => {};

  let intervalId: number | null = null;
  let activeOsc1: OscillatorNode | null = null;
  let activeOsc2: OscillatorNode | null = null;
  let isRinging = true;

  const ringBurst = () => {
    if (!isRinging) return;
    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(400, now);
      osc2.frequency.setValueAtTime(450, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.setValueAtTime(0.3, now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.4);
      osc2.stop(now + 1.4);

      activeOsc1 = osc1;
      activeOsc2 = osc2;
    } catch (e) {}
  };

  ringBurst();
  intervalId = window.setInterval(ringBurst, 3000);

  return () => {
    isRinging = false;
    if (intervalId) clearInterval(intervalId);
    try {
      if (activeOsc1) activeOsc1.stop();
      if (activeOsc2) activeOsc2.stop();
    } catch (e) {}
  };
}

/**
 * Realistic Police Radio Squelch & Static Noise Burst (Web Audio API)
 */
export function playPoliceRadioStatic(durationMs = 180) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const bufferSize = ctx.sampleRate * (durationMs / 1000);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1; // White noise
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    // Bandpass filter to simulate 400Hz - 3000Hz walkie-talkie spectrum
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1400, ctx.currentTime);
    bandpass.Q.setValueAtTime(1.8, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    whiteNoise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();
  } catch (e) {}
}

/**
 * Control Room Dispatch Voice Synthesizer (Text-to-Speech)
 */
export function speakDispatchAnnouncement(message: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    playPoliceRadioStatic(120);

    setTimeout(() => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      utterance.volume = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        playPoliceRadioStatic(160);
      };

      window.speechSynthesis.speak(utterance);
    }, 140);
  } catch (e) {}
}

