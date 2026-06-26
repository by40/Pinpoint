import type { Metadata } from "next";
import GateForm from "@/components/GateForm";

export const metadata: Metadata = {
  title: "Pinpoint — launching soon",
  description: "Pinpoint is launching soon.",
  robots: { index: false, follow: false },
};

export default function GatePage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F7F6F3] text-[#141412] px-6">
      {/* Soft ambient glow behind the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 38%, rgba(20,20,18,0.06), transparent 70%)",
        }}
      />

      <div className="fade-up relative w-full max-w-sm">
        <div className="rounded-3xl border border-[#E3E1DB] bg-white/80 backdrop-blur-sm shadow-[0_1px_2px_rgba(20,20,18,0.04),0_12px_40px_-12px_rgba(20,20,18,0.18)] p-8 sm:p-9">
          {/* Logo badge */}
          <div className="flex items-center gap-2.5 mb-7">
            <div className="w-9 h-9 rounded-xl bg-[#141412] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </div>
            <span className="font-semibold tracking-tight">Pinpoint</span>
          </div>

          <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-medium uppercase tracking-wider text-[#57554E] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3F8A5B] animate-pulse" />
            Launching soon
          </span>

          <h1 className="text-2xl font-bold tracking-tight leading-[1.15] mb-2">
            This site is in private preview
          </h1>
          <p className="text-sm text-[#57554E] leading-relaxed mb-7">
            Pinpoint isn&apos;t public just yet. Enter the access password to take a
            look around.
          </p>

          <GateForm />
        </div>

        <p className="text-center text-[0.6875rem] text-[#9B988F] mt-5">
          © {new Date().getFullYear()} Pinpoint · pinpointapp.uk
        </p>
      </div>
    </main>
  );
}
