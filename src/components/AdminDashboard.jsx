import React, { useState } from "react";
import WireguardEnrollment from "./WireguardEnrollment";

export default function AdminDashboard({ adminPassword, setAdminPassword, onLock }) {
  const [activeTab, setActiveTab] = useState("wireguard"); // Defaulting to WireGuard for quick access
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans flex flex-col items-center">
      {/* Top Application Bar */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-800 mb-6 max-w-5xl w-full gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white m-0">
            Admin Control Panel
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cloud Nexus &bull; Node: <span className="font-mono text-cyan-400">hermes-nexus</span> (201.79.39.236)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onLock}
            className="px-4 py-2 bg-rose-600/90 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-lg shadow-rose-950/40"
          >
            Lock & Return to Splash
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-5xl w-full flex border-b border-slate-800/80 mb-8 gap-2">
        <button
          onClick={() => setActiveTab("wireguard")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-t border-x ${
            activeTab === "wireguard"
              ? "bg-slate-900 border-slate-800 text-cyan-400 border-b-2 border-b-slate-900"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          WireGuard Peer Setup & QR
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-t border-x ${
            activeTab === "security"
              ? "bg-slate-900 border-slate-800 text-cyan-400 border-b-2 border-b-slate-900"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
          }`}
        >
          Overview & Security
        </button>
      </div>

      {/* Tab Panels */}
      <div className="max-w-5xl w-full flex justify-center">
        {/* WireGuard Provisioning Tab */}
        {activeTab === "wireguard" && (
          <div className="w-full flex justify-center">
            <WireguardEnrollment />
          </div>
        )}

        {/* Security & System Status Tab */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Status Card */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-semibold text-emerald-400 m-0">System Status</h2>
                <p className="text-xs text-slate-400 mt-1">Active services on digital ocean instance</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs mt-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Access Gate</span>
                  <span className="font-semibold text-slate-200 mt-1 block">Passphrase Active</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">VPN Mesh</span>
                  <span className="font-semibold text-emerald-400 mt-1 block">WireGuard Online</span>
                </div>
              </div>
            </div>

            {/* Password Management Card */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-xl space-y-4">
              <h2 className="text-base font-semibold text-white m-0">Update Admin Passphrase</h2>
              <p className="text-xs text-slate-400 m-0">
                Change the credential required to access this panel from the splash page.
              </p>

              {successMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 text-xs font-medium">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-3">
                <div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new master password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors text-xs shadow-md"
                >
                  Save New Password
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}