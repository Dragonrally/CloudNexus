import React, { useState } from "react";

const SERVER_CONFIG = {
  publicKey: "olmL/38VvzEfbbemSRdgiU2eAy67lD15awZvakxlRXU=",
  endpoint: "201.79.39.236:51820",
  dns: "1.1.1.1, 1.0.0.1",
  mtu: "1360",
  keepalive: "25",
};

const DEFAULT_PROFILES = {
  pc: {
    id: "pc",
    name: "Workstation (PC)",
    icon: "💻",
    defaultOctet: "11",
    publicKey: "m/74BKrjQs0wol5nUUf4dRzpNcW9x/Z+UGZlGFzQlno=",
    privateKey: "",
  },
  phone: {
    id: "phone",
    name: "Mobile Device (Phone)",
    icon: "📱",
    defaultOctet: "20",
    publicKey: "",
    privateKey: "",
  },
};

export default function WireguardEnrollment() {
  const [deviceType, setDeviceType] = useState("pc");
  const [octet, setOctet] = useState(DEFAULT_PROFILES.pc.defaultOctet);
  const [privateKey, setPrivateKey] = useState("");
  const [customPublicKey, setCustomPublicKey] = useState(DEFAULT_PROFILES.pc.publicKey);
  const [copiedConf, setCopiedConf] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const activeProfile = DEFAULT_PROFILES[deviceType];
  const assignedIp = `10.8.0.${octet}`;

  // Build the bulletproof client configuration
  const clientConfig = `[Interface]
PrivateKey = ${privateKey.trim() || "GP+xQk1ypZRjAyC3PEzVDWO5UzByxkTMVk2UeiYxrGo="}
Address = ${assignedIp}/32
DNS = ${SERVER_CONFIG.dns}
MTU = ${SERVER_CONFIG.mtu}

[Peer]
PublicKey = ${SERVER_CONFIG.publicKey}
Endpoint = ${SERVER_CONFIG.endpoint}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = ${SERVER_CONFIG.keepalive}`;

  // Build the corresponding server hot-allow command
  const effectivePubKey = customPublicKey.trim() || "<PEER_PUBLIC_KEY>";
  const serverAllowCmd = `sudo wg set wg0 peer "${effectivePubKey}" allowed-ips ${assignedIp}/32`;

  const handleDeviceSwitch = (type) => {
    setDeviceType(type);
    setOctet(DEFAULT_PROFILES[type].defaultOctet);
    setCustomPublicKey(DEFAULT_PROFILES[type].publicKey);
    setCopiedConf(false);
    setCopiedCmd(false);
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(clientConfig);
    setCopiedConf(true);
    setTimeout(() => setCopiedConf(false), 2500);
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(serverAllowCmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const handleDownloadConf = () => {
    const blob = new Blob([clientConfig], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${deviceType}-${octet}.conf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8 text-left text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-white m-0">WireGuard Peer Provisioning</h2>
        <p className="text-xs text-slate-400 mt-1 m-0">
          Target Node: <span className="font-mono text-cyan-400">hermes-nexus</span> (201.79.39.236:51820)
        </p>
      </div>

      {/* Device Preset Selector */}
      <div className="mt-5">
        <label className="text-xs font-semibold text-slate-300 block mb-2">Device Preset</label>
        <div className="grid grid-cols-2 gap-3">
          {Object.values(DEFAULT_PROFILES).map((prof) => (
            <button
              key={prof.id}
              type="button"
              onClick={() => handleDeviceSwitch(prof.id)}
              className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition ${
                deviceType === prof.id
                  ? "border-cyan-500 bg-cyan-950/40 text-white shadow-sm"
                  : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <span className="text-2xl">{prof.icon}</span>
              <div>
                <div className="text-xs font-semibold">{prof.name}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Default Subnet: 10.8.0.{prof.defaultOctet}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Target IP Octet Allocation */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">Assigned Tunnel IP</label>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-400 w-full">
              <span>10.8.0.</span>
              <input
                type="number"
                min="2"
                max="254"
                value={octet}
                onChange={(e) => setOctet(e.target.value)}
                className="w-16 bg-transparent text-white font-bold outline-none pl-1"
              />
              <span>/32</span>
            </div>

            <div className="flex gap-1">
              {["2", "11", "15", "20"].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setOctet(num)}
                  className={`rounded-lg px-2.5 py-2 text-xs font-mono transition ${
                    octet === num
                      ? "bg-cyan-600 text-white font-bold"
                      : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  .{num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Optional Private Key Injection */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Device Private Key <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <input
            type="password"
            placeholder="Paste 44-char base64 private key"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-mono text-white placeholder-slate-600 outline-none focus:border-cyan-500 transition"
          />
        </div>
      </div>

      {/* Client Configuration Block */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300">
            Client Profile: <span className="font-mono text-cyan-400">{assignedIp}/32</span>
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDownloadConf}
              className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
            >
              📥 Download .conf
            </button>
            <button
              type="button"
              onClick={handleCopyConfig}
              className="rounded-lg border border-cyan-500/40 bg-cyan-950/60 px-3 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-900/60 transition"
            >
              {copiedConf ? "✓ Copied" : "Copy Config"}
            </button>
          </div>
        </div>

        <pre className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-cyan-300/90 overflow-x-auto leading-relaxed select-all">
          {clientConfig}
        </pre>
      </div>

      {/* Matching Server-Side Kernel Allow Command */}
      <div className="mt-6 border-t border-slate-800 pt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300">Server Authorization 1-Liner</span>
          <button
            type="button"
            onClick={handleCopyCommand}
            className="rounded-lg border border-emerald-500/40 bg-emerald-950/50 px-3 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-900/50 transition"
          >
            {copiedCmd ? "✓ Copied Command" : "Copy Command"}
          </button>
        </div>

        <div className="mb-2">
          <input
            type="text"
            value={customPublicKey}
            onChange={(e) => setCustomPublicKey(e.target.value)}
            placeholder="Peer Public Key for Server Command"
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-mono text-slate-400 placeholder-slate-600 outline-none focus:border-cyan-500"
          />
        </div>

        <pre className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-emerald-400 overflow-x-auto select-all">
          {serverAllowCmd}
        </pre>
        <p className="text-[11px] text-slate-500 mt-2 m-0">
          Run this command on <span className="font-mono text-slate-400">hermes-nexus</span> to live-bind the peer key directly into the running kernel table.
        </p>
      </div>
    </div>
  );
}