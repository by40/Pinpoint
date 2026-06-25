// Lightweight Web Audio sound effects for the search experience.
// Everything is synthesized (no asset files) with soft sine/triangle tones and
// gentle envelopes, to match Pinpoint's warm, minimal aesthetic.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted: boolean | null = null; // lazily loaded from localStorage
let loadingTimer: ReturnType<typeof setInterval> | null = null;
let lastTick = 0; // throttles the slider tick

const STORAGE_KEY = "pinpoint-sound";

function loadMuted(): boolean {
  if (muted !== null) return muted;
  if (typeof window === "undefined") return true;
  try {
    // Sound is off by default; it's only on if the user has explicitly enabled it.
    muted = window.localStorage.getItem(STORAGE_KEY) !== "on";
  } catch {
    muted = true;
  }
  return muted;
}

export function isMuted(): boolean {
  return loadMuted();
}

export function setMuted(value: boolean) {
  muted = value;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? "off" : "on");
    } catch {
      /* ignore */
    }
  }
  if (value) stopLoadingLoop();
}

// Must be called from within a user gesture (e.g. a click) to satisfy browser
// autoplay policies. Safe to call repeatedly.
export function unlock() {
  if (typeof window === "undefined") return;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.18; // keep everything soft
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
}

// Schedule one soft tone with a click-free exponential envelope.
function tone(freq: number, delay: number, dur: number, gainVal: number, type: OscillatorType = "sine") {
  if (!ctx || !master) return;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gainVal, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.03);
}

// Soft, short "notch" tick as a slider moves one step. Dragging a slider is a
// user gesture, so it's safe to prime audio here. Lightly throttled so a fast
// drag doesn't machine-gun.
export function playTick() {
  unlock();
  if (loadMuted() || !ctx) return;
  const now = ctx.currentTime;
  if (now - lastTick < 0.03) return;
  lastTick = now;
  tone(720, 0, 0.03, 0.06); // brief soft tick
}

// Soft ascending two-note "depart" when a search begins.
export function playStart() {
  if (loadMuted() || !ctx) return;
  tone(523.25, 0, 0.12, 0.16); // C5
  tone(659.25, 0.06, 0.14, 0.14); // E5
}

// Gentle low ticking pulse while results are loading.
export function startLoadingLoop() {
  if (loadMuted() || !ctx) return;
  stopLoadingLoop();
  loadingTimer = setInterval(() => {
    if (loadMuted()) return;
    tone(330, 0, 0.07, 0.05); // E4 soft tick
  }, 520);
}

export function stopLoadingLoop() {
  if (loadingTimer) {
    clearInterval(loadingTimer);
    loadingTimer = null;
  }
}

// Soft major arpeggio with a high shimmer when shops are found.
export function playSuccess() {
  stopLoadingLoop();
  if (loadMuted() || !ctx) return;
  tone(523.25, 0, 0.16, 0.15); // C5
  tone(659.25, 0.09, 0.16, 0.14); // E5
  tone(783.99, 0.18, 0.2, 0.14); // G5
  tone(1046.5, 0.28, 0.28, 0.1); // C6
}

// Soft descending two-note when nothing is found.
export function playEmpty() {
  stopLoadingLoop();
  if (loadMuted() || !ctx) return;
  tone(659.25, 0, 0.16, 0.12); // E5
  tone(523.25, 0.1, 0.22, 0.11); // C5
}

// Muted low tone on error.
export function playError() {
  stopLoadingLoop();
  if (loadMuted() || !ctx) return;
  tone(220, 0, 0.3, 0.12, "triangle"); // A3
}
