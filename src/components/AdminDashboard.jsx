import React, { useEffect, useState } from "react";
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

  function AdminDashboardView() {
    const [peers, setPeers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchPeers = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://201.79.39.236:5050/api/peers", {
          headers: { "x-api-key": "Secret1234" },
        });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        setPeers(data.peers || []);
      } catch (err) {
        setError("Unable to reach telemetry daemon on hermes-nexus (check port 5050 & service status).");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchPeers();
      const interval = setInterval(fetchPeers, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8 text-left text-slate-200">
        <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white m-0">Admin Telemetry & Live Peers</h2>
            <p className="text-xs text-slate-400 mt-1 m-0">
              Node: <span className="font-mono text-cyan-400">hermes-nexus</span> (201.79.39.236)
            </p>
          </div>
          <button
            onClick={fetchPeers}
            disabled={loading}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Live Peers Table */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-white mb-3">Active Kernel Peers</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-slate-800 bg-slate-900/50 text-slate-400">
                <tr>
                  <th className="p-3">Status</th>
                  <th className="p-3">Assigned IP</th>
                  <th className="p-3">Public Key</th>
                  <th className="p-3">Handshake</th>
                  <th className="p-3 text-right">Transfer (Rx / Tx)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {peers.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-slate-500">
                      No active peers returned or daemon offline.
                    </td>
                  </tr>
                )}
                {peers.map((p) => (
                  <tr key={p.publicKey} className="hover:bg-slate-900/30">
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-sans font-bold ${
                        p.isActive
                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-900 text-slate-500 border border-slate-800"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${p.isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                        {p.isActive ? "ONLINE" : "IDLE"}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-cyan-300">{p.allowedIps}</td>
                    <td className="p-3 text-slate-400 truncate max-w-[140px]" title={p.publicKey}>
                      {p.publicKey.slice(0, 10)}...{p.publicKey.slice(-4)}
                    </td>
                    <td className="p-3 text-slate-300">{p.latestHandshake}</td>
                    <td className="p-3 text-right text-slate-400">
                      {p.rxMB} MB ↓ / {p.txMB} MB ↑
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

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