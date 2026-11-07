import { useState } from 'react';

export function ComingSoonSplash({
  showLoginModal,
  setShowLoginModal,
  passwordInput,
  setPasswordInput,
  authError,
  onLogin
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans relative">
      <button
        onClick={() => setShowLoginModal(true)}
        className="absolute top-6 right-6 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs transition-colors"
      >
        Admin Login
      </button>

      <div className="max-w-md w-full text-center space-y-6 bg-slate-900/50 p-8 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-sm">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">Launching Soon</span>
          <h1 className="text-3xl font-bold tracking-tight text-white">Something Great is Coming</h1>
          <p className="text-sm text-slate-400">Enter your email to be notified when we go live.</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm"
              required
            />
            <button type="submit" className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-lg">
              Notify Me
            </button>
          </form>
        ) : (
          <div className="py-4 px-4 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 text-sm font-medium">
            Thank you! You are on the notification list.
          </div>
        )}
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="max-w-sm w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Admin Access</h2>
              <button onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>
            {authError && <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs">{authError}</div>}
            <form onSubmit={onLogin} className="space-y-3">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                required
                autoFocus
              />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowLoginModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-medium">Login</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}