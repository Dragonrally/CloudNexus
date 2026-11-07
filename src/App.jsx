import React, { useState, useEffect } from "react";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [error, setError] = useState(false);
  const [adminPassword, setAdminPassword] = useState("Secret1234");

  // Check persistent session authentication
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("cloudnexus_admin_session");
    if (sessionAuth === "authenticated") {
      setIsAdminUnlocked(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === adminPassword) {
      sessionStorage.setItem("cloudnexus_admin_session", "authenticated");
      setIsAdminUnlocked(true);
      setShowLoginModal(false);
      setPassword("");
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem("cloudnexus_admin_session");
    setIsAdminUnlocked(false);
  };

  // If authenticated, render the Admin Control Panel
  if (isAdminUnlocked) {
    return (
      <AdminDashboard
        adminPassword={adminPassword}
        setAdminPassword={setAdminPassword}
        onLock={handleLock}
      />
    );
  }

  // Public High-Converting Stylized Splash
  return (
    <div className="relative min-h-screen w-full bg-slate-950 font-sans text-slate-100 antialiased selection:bg-cyan-500 selection:text-white flex flex-col justify-between overflow-x-hidden">
      {/* Background Radial Glow Elements */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[450px] w-[450px] rounded-full bg-indigo-500/10 blur-[130px]" />

      {/* Top Header */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 font-bold text-white shadow-lg shadow-cyan-950/50">
              CN
            </span>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white block">
                Cloud Nexus
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block">
                Ascendant Technology Partners
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowLoginModal(true)}
            className="rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-300 transition-all hover:border-cyan-500/60 hover:bg-slate-800 hover:text-white"
          >
            Client & Admin Portal
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        {/* Status Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-4 py-1.5 text-xs font-medium text-cyan-400 shadow-inner">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
          Enterprise MSP &bull; Infrastructure Architecture
        </div>

        {/* Headline */}
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-[1.15]">
          A Catalyst for Modern,{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            Tailored IT Solutions
          </span>
        </h1>

        {/* Narrative Copy */}
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
          Cloud Nexus transforms complex technical friction into automated operational leverage.
          We engineer high-throughput cloud environments, encrypted mesh networks, and resilient
          managed systems designed to accelerate your core business.
        </p>

        {/* Service Pillars Grid */}
        <div className="mt-12 grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-xl backdrop-blur-sm">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 font-bold">
              01
            </div>
            <h2 className="text-base font-bold text-white mb-1">Tailored Architecture</h2>
            <p className="text-xs leading-relaxed text-slate-400">
              Zero cookie-cutter templates. Custom cloud VPS provisioning, automated workflows, and purpose-built infrastructure.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-xl backdrop-blur-sm">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 font-bold">
              02
            </div>
            <h2 className="text-base font-bold text-white mb-1">Encrypted Telemetry</h2>
            <p className="text-xs leading-relaxed text-slate-400">
              Centralized WireGuard VPN mesh relays, automated peering protocols, and hardened network edge perimeter monitoring.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-6 shadow-xl backdrop-blur-sm">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 font-bold">
              03
            </div>
            <h2 className="text-base font-bold text-white mb-1">Strategic Catalyst</h2>
            <p className="text-xs leading-relaxed text-slate-400">
              Empowering executive teams with fractional CTO guidance, systems design, and hands-on administrative implementation.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            onClick={() => setShowLoginModal(true)}
            className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-950/60 transition-all hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            Access Authorized Console
          </button>
          <span className="text-xs text-slate-500">
            System intake pipelines provisioned for authorized client endpoints.
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-900 bg-slate-950/90 py-6 text-center text-xs text-slate-600">
        &copy; {new Date().getFullYear()} Cloud Nexus LLC &bull; Ascendant Technology Partners. All rights reserved.
      </footer>

      {/* Password Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-white">Admin Authentication</h2>
            <p className="mt-1 text-xs text-slate-400">
              Enter your master passphrase to unlock the operations control panel.
            </p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Master Passphrase..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  autoFocus
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                {error && (
                  <p className="mt-2 text-xs font-medium text-rose-400">
                    Incorrect password. Access denied.
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setError(false);
                    setPassword("");
                  }}
                  className="w-1/2 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 rounded-xl bg-cyan-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-cyan-500"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}