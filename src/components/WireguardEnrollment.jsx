import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

function generateRandomKey() {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

export default function WireguardEnrollment() {
  const [subnetBase, setSubnetBase] = useState("10.8.0");
  const [hostOctet, setHostOctet] = useState("4");
  const [clientPrivateKey, setClientPrivateKey] = useState(() => generateRandomKey());
  const [serverPublicKey, setServerPublicKey] = useState("SERVER_PUBLIC_KEY_HERE");
  const [serverEndpoint, setServerEndpoint] = useState("201.79.39.236:51820");
  const [dns, setDns] = useState("1.1.1.1, 1.0.0.1");
  const [copied, setCopied] = useState(false);

  // Computed dynamic client peer target
  const peerTargetIp = `${subnetBase.trim()}.${hostOctet.trim()}`;

  // Standardized WireGuard client profile
  const configContent = `[Interface]
PrivateKey = ${clientPrivateKey}
Address = ${peerTargetIp}/32
DNS = ${dns}

[Peer]
PublicKey = ${serverPublicKey}
Endpoint = ${serverEndpoint}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25`;

  const handleCopy = () => {
    navigator.clipboard.writeText(configContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleRegenerateKey = () => {
    setClientPrivateKey(generateRandomKey());
  };

  const handleDownload = () => {
    const blob = new Blob([configContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wg0-${peerTargetIp.replace(/\./g, "_")}.conf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleNextIp = () => {
    const next = parseInt(hostOctet, 10) + 1;
    if (!isNaN(next) && next <= 254) {
      setHostOctet(next.toString());
      setClientPrivateKey(generateRandomKey());
    }
  };

  const handlePrevIp = () => {
    const prev = parseInt(hostOctet, 10) - 1;
    if (!isNaN(prev) && prev >= 2) {
      setHostOctet(prev.toString());
      setClientPrivateKey(generateRandomKey());
    }
  };

  return (
    <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            WireGuard Peer Provisioning
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Node: <span className="font-mono text-cyan-400">hermes-nexus</span> &bull; 201.79.39.236:51820
          </p>
        </div>
        <button
          onClick={handleRegenerateKey}
          className="self-start rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
        >
          Regenerate Key Pair
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Configuration Inputs (7 Cols) */}
        <div className="space-y-5 lg:col-span-7">
          {/* Peer Target Selector */}
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Target Client IP Assignment
              </label>
              <span className="text-[11px] font-mono text-slate-400">CIDR: /32</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs">
                <input
                  type="text"
                  value={subnetBase}
                  onChange={(e) => setSubnetBase(e.target.value)}
                  className="w-20 bg-transparent text-white outline-none"
                  placeholder="10.8.0"
                />
                <span className="text-slate-500 font-bold">.</span>
                <input
                  type="number"
                  min="2"
                  max="254"
                  value={hostOctet}
                  onChange={(e) => setHostOctet(e.target.value)}
                  className="w-16 bg-transparent text-cyan-400 font-bold outline-none px-1"
                  placeholder="4"
                />
              </div>

              {/* Step Controls */}
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={handlePrevIp}
                  title="Previous IP"
                  className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={handleNextIp}
                  title="Next IP"
                  className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Quick Pick Presets */}
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Presets:</span>
              {["2", "3", "4", "5", "10", "20", "50", "100"].map((ip) => (
                <button
                  key={ip}
                  type="button"
                  onClick={() => {
                    setHostOctet(ip);
                    setClientPrivateKey(generateRandomKey());
                  }}
                  className={`rounded border px-2 py-0.5 text-[10px] font-mono transition ${
                    hostOctet === ip
                      ? "border-cyan-500 bg-cyan-950 text-cyan-300 font-bold"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  .{ip}
                </button>
              ))}
            </div>
          </div>

          {/* Server Config & Endpoint */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Server Endpoint
              </label>
              <input
                type="text"
                value={serverEndpoint}
                onChange={(e) => setServerEndpoint(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                DNS Resolvers
              </label>
              <input
                type="text"
                value={dns}
                onChange={(e) => setDns(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Server Public Key (hermes-nexus)
            </label>
            <input
              type="text"
              value={serverPublicKey}
              onChange={(e) => setServerPublicKey(e.target.value)}
              placeholder="Paste wg0 server public key..."
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Config Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Profile Preview
              </label>
              <span className="text-[10px] text-cyan-400 font-mono">
                Assigned: {peerTargetIp}/32
              </span>
            </div>
            <textarea
              readOnly
              rows={8}
              value={configContent}
              className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-300 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 rounded-xl bg-cyan-600 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-cyan-500"
            >
              {copied ? "Copied Configuration!" : "Copy Configuration"}
            </button>
            <button
              onClick={handleDownload}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              Download .conf
            </button>
          </div>
        </div>

        {/* Right: Dynamic QR Enrollment (5 Cols) */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-950/70 p-6 text-center lg:col-span-5">
          <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Mobile Enrollment Scanner
          </span>

          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-mono text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Target: {peerTargetIp}
          </div>

          {/* High-Contrast Container for Camera Optics */}
          <div className="rounded-2xl border-4 border-slate-800 bg-white p-3.5 shadow-2xl">
            <QRCodeSVG
              value={configContent}
              size={190}
              level="M"
              includeMargin={false}
            />
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            Open the <strong>WireGuard</strong> app on iOS/Android, tap <strong>(+)</strong>, and scan this code to link device directly as <code className="text-cyan-400">{peerTargetIp}</code>.
          </p>
        </div>
      </div>
    </div>
  );
}