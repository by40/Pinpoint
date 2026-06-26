"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GateForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        // Cookie is now set; re-render the current route (proxy lets us through).
        router.refresh();
      } else {
        setError(true);
        setLoading(false);
      }
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="gate-password" className="sr-only">
        Access password
      </label>
      <input
        id="gate-password"
        type="password"
        autoFocus
        autoComplete="off"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (error) setError(false);
        }}
        placeholder="Enter password"
        aria-invalid={error}
        className="w-full rounded-xl border border-[#E3E1DB] bg-white px-4 py-3 text-sm text-[#141412] placeholder:text-[#9B988F] outline-none focus:border-[#141412] transition-colors"
      />
      <button
        type="submit"
        disabled={loading || !password}
        className="w-full rounded-xl bg-[#141412] hover:bg-[#2A2A28] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-3 transition-colors"
      >
        {loading ? "Checking…" : "Enter"}
      </button>
      <p
        aria-live="polite"
        className={`text-xs text-center min-h-4 transition-opacity ${
          error ? "text-[#B4423A] opacity-100" : "opacity-0"
        }`}
      >
        Incorrect password — try again.
      </p>
    </form>
  );
}
