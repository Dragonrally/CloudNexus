import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

// ==========================================
// HARDCODED WIREGUARD SERVER INFRASTRUCTURE
// ==========================================
const SERVER_ENDPOINT = "201.79.39.236:51820";
const SERVER_PUBLIC_KEY = "olmL/38VvzEfbbemSRdgiU2eAy67lD15awZvakxlRXU=";
const DNS_SERVERS = "1.1.1.1, 1.0.0.1";

// Hardcoded private keys by device profile
// Replace these strings with your exact 44-character keys from /etc/wireguard/
const DEVICE_PROFILES = {
  phone: {
    name: "Mobile Phone",
    defaultOctet: "3",
    privateKey: "8Fbp72mox9WvmWGSqOHJzi459Waz/UtglXruTrw3RUs="
  },
  pc: {
    name: "Workstation / PC",
    defaultOctet: "2",
    privateKey: "+HLSr8lisGx7SVFCyIlCEul6HHNDUkRoJN8UiM965mo="
  },
};

// Strict sanitization: strips quotes, line breaks, and whitespace
const sanitizeKey = (key) => (key || "").replace(/['"\r\n\s]/g, "").trim();

export default function WireguardEnrollment() {
  const [deviceType, setDeviceType] = useState("phone");
  const [subnetBase, setSubnetBase] = useState("10.8.0");
  const [hostOctet, setHostOctet] = useState(DEVICE_PROFILES["phone"].defaultOctet);
  const [copied, setCopied] = useState(false);

  const activeProfile = DEVICE_PROFILES[deviceType];
  const clientIp = `${subnetBase.trim()}.${hostOctet.trim()}`;
  
  // Cleaned keys
  const cleanPrivateKey = sanitizeKey(activeProfile.privateKey);
  const cleanServerPubKey = sanitizeKey(SERVER_PUBLIC_KEY);

  // Verification check: WireGuard keys are exactly 44 base64 characters
  const isKeyValid = cleanPrivateKey.length === 44 && cleanServerPubKey.length === 44;

  // Exact WireGuard config string format
  const configContent = `[Interface]
PrivateKey = ${cleanPrivateKey}
Address = ${clientIp}/32
DNS = ${DNS_SERVERS}

[Peer]
PublicKey = ${cleanServerPubKey}
Endpoint = ${SERVER_ENDPOINT}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25\n`;

  const handleDeviceChange = (type) => {
    setDeviceType(type);
    setHostOctet(DEVICE_PROFILES[type].defaultOctet);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(configContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = () => {
    const blob = new Blob([configContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wg0-${deviceType}-${clientIp.replace(/\./g, "_")}.conf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8 text-left">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-white m-0">
          Device Enrollment & Peer Provisioning
        </h2>
        <p className="text-xs text-slate-400 mt-1 m-0">
          Node: <span className="font-mono text-cyan-400">hermes-nexus</span> &bull; {SERVER_ENDPOINT}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2 items-center">
        {/* Left Side: Device Selection & IP Configuration */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Device Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDeviceChange("phone")}
                className={`rounded-xl border py-2.5 px-3 text-xs font-semibold transition ${
                  deviceType === "phone"
                    ? "border-cyan-500 bg-cyan-950/70 text-cyan-300 shadow-md"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                📱 Mobile Phone
              </button>
              <button
                type="button"
                onClick={() => handleDeviceChange("pc")}
                className={`rounded-xl border py-2.5 px-3 text-xs font-semibold transition ${
                  deviceType === "pc"
                    ? "border-cyan-500 bg-cyan-950/70 text-cyan-300 shadow-md"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                💻 Workstation / PC
              </button>
            </div>
          </div>

          {/* Target IP Selector */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
                Target IP Allocation
              </label>
              <span className="font-mono text-[10px] text-slate-500">Subnet: /32</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs">
                <input
                  type="text"
                  value={subnetBase}
                  onChange={(e) => setSubnetBase(e.target.value)}
                  className="w-20 bg-transparent text-slate-300 outline-none"
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
                />
              </div>

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const prev = Math.max(2, parseInt(hostOctet || "2", 10) - 1);
                    setHostOctet(prev.toString());
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.min(254, parseInt(hostOctet || "2", 10) + 1);
                    setHostOctet(next.toString());
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
                >
                  +1
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Quick Pick:</span>
              {["2", "3", "4", "5", "10", "20", "50"].map((ip) => (
                <button
                  key={ip}
                  type="button"
                  onClick={() => setHostOctet(ip)}
                  className={`rounded border px-2 py-0.5 text-[10px] font-mono transition ${
                    hostOctet === ip
                      ? "border-cyan-500 bg-cyan-950 text-cyan-300 font-bold"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  .{ip}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 rounded-xl bg-cyan-600 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-cyan-500"
            >
              {copied ? "Copied Config!" : "Copy Configuration"}
            </button>
            <button
              onClick={handleDownload}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              Download .conf
            </button>
          </div>
        </div>

        {/* Right Side: QR Code Scanner with Diagnostic Guard */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-950/70 p-6 text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-mono text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {activeProfile.name}: {clientIp}
          </div>

          <div className="rounded-2xl border-4 border-slate-800 bg-white p-3.5 shadow-2xl">
            {isKeyValid ? (
              <QRCodeSVG
                value={configContent}
                size={185}
                level="M"
                includeMargin={false}
              />
            ) : (
              <div className="w-[185px] h-[185px] flex flex-col items-center justify-center p-3 text-center bg-slate-100 text-rose-600 font-sans text-xs">
                <span className="font-bold">Invalid Key Length</span>
                <span className="text-[10px] text-slate-600 mt-1">
                  PrivateKey length: {cleanPrivateKey.length} / 44 chars
                </span>
                <span className="text-[10px] text-slate-600">
                  PublicKey length: {cleanServerPubKey.length} / 44 chars
                </span>
              </div>
            )}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-400 max-w-[220px]">
            {isKeyValid ? (
              <>Scan with the <strong>WireGuard</strong> mobile app to provision as <code className="text-cyan-400">{clientIp}</code>.</>
            ) : (
              <span className="text-rose-400 text-xs font-medium">Check character count in VS Code.</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}