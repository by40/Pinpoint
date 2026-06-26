export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center animate-pulse">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
        </div>
        <span className="text-sm text-faint">Loading…</span>
      </div>
    </div>
  );
}
