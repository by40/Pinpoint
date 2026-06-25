"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F6F3] text-[#141412] px-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-[#141412] flex items-center justify-center mb-6">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h1>
      <p className="text-sm text-[#57554E] max-w-sm leading-relaxed mb-8">
        This is usually temporary — the live map data service can be briefly unavailable. Try again in a moment.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="bg-[#141412] hover:bg-[#2A2A28] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="bg-white hover:bg-[#EAE8E3] text-[#141412] border border-[#E3E1DB] font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
