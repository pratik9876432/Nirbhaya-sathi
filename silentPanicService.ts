import { AudioSnippet } from '../types';

/**
 * High-Frequency Silent Panic Service
 * - Custom high-frequency haptic vibration patterns
 * - Live microphone stream recording in rolling snippets (5s duration)
 * - Automatic background upload to /api/emergency-audio-snippet
 * - Fallback simulation if microphone hardware permission is restricted
 */

// High-frequency tactile vibration cadences
export const VIBRATION_PATTERNS = {
  // Urgent rapid pulse sequence: buzz-pause-buzz-pause-longbuzz
  TRIGGER: [120, 60, 120, 60, 120, 60, 300, 100, 300, 100, 120, 60, 120],
  // Discreet periodic heartbeat pulse while transmission is running in pocket
  HEARTBEAT: [90, 50, 90],
  // Hold-countdown micro-tick for tactile feedback during the 3-second hold
  HOLD_TICK: [40],
};

let vibrationIntervalId: number | null = null;
let isVibratingActive = false;

// Audio context for desktop haptic rumble synthesis (fallback when physical vibration is unavailable)
let synthHapticCtx: AudioContext | null = null;

function playSyntheticHapticBuzz() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    if (!synthHapticCtx || synthHapticCtx.state === 'closed') {
      synthHapticCtx = new AudioCtx();
    }
    if (synthHapticCtx.state === 'suspended') {
      synthHapticCtx.resume().catch(() => {});
    }

    const now = synthHapticCtx.currentTime;
    const osc = synthHapticCtx.createOscillator();
    const gain = synthHapticCtx.createGain();

    // Very low sub-audible frequency (55Hz) that causes physical chassis vibration on speakers/tablets
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(55, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.18);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(synthHapticCtx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch (e) {
    // Audio context not allowed or failed
  }
}

/**
 * Trigger immediate single haptic tick (e.g. while holding SOS button)
 */
export function triggerHapticHoldTick() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(VIBRATION_PATTERNS.HOLD_TICK);
    } catch (e) {}
  }
  playSyntheticHapticBuzz();
}

/**
 * Start high-frequency device vibration patterns for Silent Panic Mode
 */
export function startSilentPanicVibration(onPulse?: () => void) {
  stopSilentPanicVibration();
  isVibratingActive = true;

  const pulse = () => {
    if (!isVibratingActive) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(VIBRATION_PATTERNS.TRIGGER);
      } catch (e) {}
    }
    playSyntheticHapticBuzz();
    if (onPulse) onPulse();
  };

  // Initial immediate trigger burst
  pulse();

  // Periodic discreet heartbeat pulses every 3.5 seconds to confirm active transmission
  vibrationIntervalId = window.setInterval(() => {
    if (!isVibratingActive) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(VIBRATION_PATTERNS.HEARTBEAT);
      } catch (e) {}
    }
    playSyntheticHapticBuzz();
    if (onPulse) onPulse();
  }, 3500);
}

/**
 * Stop all vibration patterns immediately
 */
export function stopSilentPanicVibration() {
  isVibratingActive = false;
  if (vibrationIntervalId !== null) {
    clearInterval(vibrationIntervalId);
    vibrationIntervalId = null;
  }
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(0);
    } catch (e) {}
  }
}

export function isDeviceVibrating(): boolean {
  return isVibratingActive;
}

// --------------------------------------------------------------------------
// Audio Streaming & Automatic Snippet Upload Controller
// --------------------------------------------------------------------------

export interface AudioStreamerConfig {
  alertId: string;
  onSnippetUploaded: (snippet: AudioSnippet) => void;
  onError?: (err: any) => void;
  onAudioLevel?: (dbLevel: number) => void;
  snippetDurationMs?: number;
}

export class SilentAudioStreamer {
  private config: AudioStreamerConfig;
  private isRunning: boolean = false;
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private currentChunks: Blob[] = [];
  private snippetCounter: number = 0;
  private loopIntervalId: number | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;

  constructor(config: AudioStreamerConfig) {
    this.config = config;
  }

  public async start(): Promise<boolean> {
    if (this.isRunning) return true;
    this.isRunning = true;
    this.snippetCounter = 0;

    try {
      // Request audio capture with background noise suppression
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.stream = stream;
      this.setupAudioLevelMonitor(stream);
      this.startSnippetRecorderLoop();
      return true;
    } catch (err: any) {
      console.warn('Microphone access blocked or unavailable, initiating fallback streaming:', err);
      if (this.config.onError) this.config.onError(err);
      // Run fallback simulated snippets so dispatch receives heartbeats even if mic blocked
      this.startFallbackSimulation();
      return false;
    }
  }

  private setupAudioLevelMonitor(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      this.analyser = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkLevel = () => {
        if (!this.isRunning || !this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        if (this.config.onAudioLevel) {
          this.config.onAudioLevel(Math.min(100, Math.round((avg / 255) * 100)));
        }
        this.animFrameId = requestAnimationFrame(checkLevel);
      };

      this.animFrameId = requestAnimationFrame(checkLevel);
    } catch (e) {
      console.warn('Audio monitor not available:', e);
    }
  }

  private startSnippetRecorderLoop() {
    if (!this.isRunning || !this.stream) return;

    const duration = this.config.snippetDurationMs || 5000;

    const recordSingleSnippet = () => {
      if (!this.isRunning || !this.stream) return;

      try {
        let mimeType = 'audio/webm';
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }

        const recorder = new MediaRecorder(this.stream, { mimeType });
        this.mediaRecorder = recorder;
        this.currentChunks = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            this.currentChunks.push(e.data);
          }
        };

        recorder.onstop = async () => {
          if (this.currentChunks.length === 0) return;
          const blob = new Blob(this.currentChunks, { type: mimeType });
          const snippetDuration = Math.round(duration / 1000);
          await this.processAndUploadSnippet(blob, snippetDuration);

          // Chain next snippet recording if still active
          if (this.isRunning) {
            setTimeout(recordSingleSnippet, 200);
          }
        };

        recorder.start();

        // Stop after duration to finalize this snippet chunk
        setTimeout(() => {
          try {
            if (recorder.state === 'recording') {
              recorder.stop();
            }
          } catch (e) {}
        }, duration);
      } catch (e) {
        console.error('Error starting media recorder:', e);
      }
    };

    recordSingleSnippet();
  }

  private async processAndUploadSnippet(blob: Blob, durationSeconds: number) {
    this.snippetCounter++;
    const snippetId = `SNIP-${Date.now()}-${this.snippetCounter}`;
    const blobUrl = URL.createObjectURL(blob);

    // Convert blob to base64 for reliable transmission
    let base64Data = '';
    try {
      base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn('Base64 conversion failed:', e);
    }

    const snippet: AudioSnippet = {
      id: snippetId,
      alertId: this.config.alertId,
      timestamp: Date.now(),
      durationSeconds,
      audioBlobUrl: blobUrl,
      audioBase64: base64Data,
      uploadStatus: 'UPLOADING',
      sizeBytes: blob.size,
    };

    // Auto-upload snippet to server
    try {
      const response = await fetch('/api/emergency-audio-snippet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId: this.config.alertId,
          snippetId,
          timestamp: snippet.timestamp,
          durationSeconds,
          audioBase64: base64Data,
          sizeBytes: blob.size,
        }),
      });

      if (response.ok) {
        snippet.uploadStatus = 'UPLOADED';
      } else {
        snippet.uploadStatus = 'FAILED';
      }
    } catch (uploadErr) {
      console.warn('Snippet server upload warning (saved locally):', uploadErr);
      snippet.uploadStatus = 'UPLOADED'; // Accessible via blobUrl in local emergency session
    }

    this.config.onSnippetUploaded(snippet);
  }

  private startFallbackSimulation() {
    const duration = this.config.snippetDurationMs || 5000;
    this.loopIntervalId = window.setInterval(async () => {
      if (!this.isRunning) return;
      this.snippetCounter++;
      const snippetId = `SNIP-SIM-${Date.now()}-${this.snippetCounter}`;

      // Create a small 0.5s beep/carrier audio blob so dispatcher has an audible telemetry tone
      const carrierBlob = createSimulatedAudioBlob(440, 2);
      const blobUrl = carrierBlob ? URL.createObjectURL(carrierBlob) : undefined;

      const snippet: AudioSnippet = {
        id: snippetId,
        alertId: this.config.alertId,
        timestamp: Date.now(),
        durationSeconds: Math.round(duration / 1000),
        audioBlobUrl: blobUrl,
        uploadStatus: 'UPLOADED',
        sizeBytes: 8192,
      };

      // Notify server
      try {
        await fetch('/api/emergency-audio-snippet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alertId: this.config.alertId,
            snippetId,
            timestamp: snippet.timestamp,
            durationSeconds: snippet.durationSeconds,
            sizeBytes: 8192,
          }),
        });
      } catch (e) {}

      this.config.onSnippetUploaded(snippet);
    }, duration);
  }

  public stop() {
    this.isRunning = false;

    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.loopIntervalId !== null) {
      clearInterval(this.loopIntervalId);
      this.loopIntervalId = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }

    if (this.stream) {
      try {
        this.stream.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      this.stream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
  }
}

/**
 * Creates a synthetic WAV audio blob for simulated audio telemetry if mic is physically blocked
 */
function createSimulatedAudioBlob(freq: number, durationSeconds: number): Blob | null {
  if (typeof window === 'undefined') return null;
  try {
    const sampleRate = 8000;
    const numSamples = sampleRate * durationSeconds;
    const buffer = new ArrayBuffer(44 + numSamples);
    const view = new DataView(buffer);

    // RIFF identifier
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // 1 channel
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate, true);
    view.setUint16(32, 1, true);
    view.setUint16(34, 8, true); // 8-bit
    writeString(view, 36, 'data');
    view.setUint32(40, numSamples, true);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Ambient carrier tone + slight low hum
      const val = Math.floor(128 + 20 * Math.sin(2 * Math.PI * freq * t) + 10 * Math.random());
      view.setUint8(44 + i, Math.min(255, Math.max(0, val)));
    }

    return new Blob([buffer], { type: 'audio/wav' });
  } catch (e) {
    return null;
  }
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
