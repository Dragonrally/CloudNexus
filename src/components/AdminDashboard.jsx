import { useState } from 'react';

export default function AdminDashboard({ adminPassword, setAdminPassword, onLock }) {
  const [newPassword, setNewPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (newPassword.trim()) {
      setAdminPassword(newPassword.trim());
      setNewPassword("");
      setSuccessMessage("Admin password successfully updated!");
      setTimeout(() => setSuccessMessage(""), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans flex flex-col">
      {/* Top Bar */}
      <header className="flex justify-between items-center pb-6 border-b border-slate-800 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Admin Control Panel</h1>
          <p className="text-sm text-slate-400">Manage site configuration and security credentials.</p>
        </div>
        <button
          onClick={onLock}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-rose-950/50"
        >
          Lock & Return to Splash
        </button>
      </header>

      {/* Main Content Grid */}
      <div className="max-w-xl w-full mx-auto space-y-6">
        
        {/* Status Card */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-xl space-y-3">
          <h2 className="text-lg font-semibold text-emerald-400">System Status</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-xs">Mode</span>
              <span className="font-medium text-slate-200">Coming Soon Splash Active</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-xs">Security</span>
              <span className="font-medium text-emerald-400">Protected</span>
            </div>
          </div>
        </div>

        {/* Password Management Card */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-lg font-semibold text-white">Update Admin Password</h2>
          <p className="text-sm text-slate-400">
            Change the master password required to access this control panel from the splash page.
          </p>

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 text-sm font-medium">
              {successMessage}
            </div>
          )}

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                New Master Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors text-sm shadow-lg shadow-emerald-900/20"
            >
              Update Password
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}