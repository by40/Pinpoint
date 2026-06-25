"use client";

import { useEffect, useState } from "react";
import { isMuted, setMuted, unlock } from "@/lib/sounds";

export default function SoundToggle() {
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    // Sync from localStorage after mount — the server can't know the persisted
    // preference, so we read it client-side to avoid a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMutedState(isMuted());
  }, []);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) unlock(); // enabling counts as the user gesture that primes audio
  };

  return (
    <button
      onClick={toggle}
      aria-label={muted ? "Enable sound effects" : "Mute sound effects"}
      title={muted ? "Sound off" : "Sound on"}
      className="flex items-center text-[#57554E] hover:text-[#141412] transition-colors"
    >
      {muted ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4V5z" />
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4V5z" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  );
}
