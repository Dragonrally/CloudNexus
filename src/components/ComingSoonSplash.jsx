import React, { useState } from "react";

export default function ComingSoonSplash({ onAdminUnlock }) {
  const [password, setPassword] = useState("");
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [error, setError] = useState(false);

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError(true);
      return;
    }
    if (onAdminUnlock) {
      const success = onAdminUnlock(password);
      if (success === false) {
        setError(true);
      }
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />

      <main className="relative z-10 w-full max-w-lg space-y-8 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        {/* Status Badge */}
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-medium text-cyan-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            Infrastructure Staging
          </span>
        </div>

        {/* Branding & Messaging */}
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Cloud Nexus
          </h1>
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
            Ascendant Technology Partners
          </p>
          <p className="pt-2 text-sm leading-relaxed text-slate-400 sm:text-base">
            Managed Service Provider infrastructure, encrypted telemetry, and our client command console are currently provisioning.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-800/60 bg-slate-950/50 p-4 text-center">
          <div>
            <p className="text-xs text-slate-500">VPN Core</p>
            <p className="mt-1 text-sm font-semibold text-emerald-400">Nominal</p>
          </div>
          <div className="border-x border-slate-800/80">
            <p className="text-xs text-slate-500">Network Edge</p>
            <p className="mt-1 text-sm font-semibold text-cyan-400">10 Gbps</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Telemetry</p>
            <p className="mt-1 text-sm font-semibold text-indigo-400">Active</p>
          </div>
        </div>

        {/* Admin Access Panel */}
        <div className="pt-2">
          {!showAdminPrompt ? (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowAdminPrompt(true)}
                className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-300 focus:outline-none"
              >
                Authorized Personnel Access
              </button>
            </div>
          ) : (
            <form onSubmit={handleAdminSubmit} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Enter access passphrase..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  autoFocus
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3.5 py-2 text-sm text-white placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  Verify
                </button>
              </div>
              {error && (
                <p className="text-center text-xs text-rose-400">
                  Invalid security credentials. Access denied.
                </p>
              )}
            </form>
          )}
        </div>
      </main>

      <footer className="mt-8 text-center text-xs text-slate-600">
        &copy; {new Date().getFullYear()} Cloud Nexus LLC. All rights reserved.
      </footer>
    </div>
  );
}

// Redundant named export to support both:
// import ComingSoonSplash from '...'
// import { ComingSoonSplash } from '...'
export { ComingSoonSplash };