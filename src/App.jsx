import React, { useState, useEffect, useRef } from "react";

// ==========================================
// 1. CONFIGURATION & CONSTANTS
// ==========================================
const SERVER_CONFIG = {
  publicKey: "olmL/38VvzEfbbemSRdgiU2eAy67lD15awZvakxlRXU=",
  endpoint: "201.79.39.236:51820",
  telemetryEndpoint: "http://201.79.39.236:5050/api/peers",
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
  },
  phone: {
    id: "phone",
    name: "Mobile Device (Phone)",
    icon: "📱",
    defaultOctet: "20",
    publicKey: "",
  },
};

const SOLID_COLORS = [
  { name: "Pure Red", hex: "#ef4444", border: "border-red-500/40", text: "text-red-300" },
  { name: "Pure Green", hex: "#22c55e", border: "border-green-500/40", text: "text-green-300" },
  { name: "Pure Blue", hex: "#3b82f6", border: "border-blue-500/40", text: "text-blue-300" },
  { name: "Pure White", hex: "#ffffff", border: "border-slate-300", text: "text-slate-200" },
  { name: "Pure Black (Bleed Check)", hex: "#000000", border: "border-slate-700", text: "text-slate-400", span: true },
];

// ==========================================
// 2. WIREGUARD PROVISIONING VIEW
// ==========================================
function WireguardEnrollmentView() {
  const [deviceType, setDeviceType] = useState("pc");
  const [octet, setOctet] = useState(DEFAULT_PROFILES.pc.defaultOctet);
  const [privateKey, setPrivateKey] = useState("");
  const [customPublicKey, setCustomPublicKey] = useState(DEFAULT_PROFILES.pc.publicKey);
  const [copiedConf, setCopiedConf] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const activeProfile = DEFAULT_PROFILES[deviceType];
  const assignedIp = `10.8.0.${octet}`;

  const clientConfig = `[Interface]
PrivateKey = ${privateKey.trim() || "<PASTE_YOUR_PRIVATE_KEY_HERE>"}
Address = ${assignedIp}/32
DNS = ${SERVER_CONFIG.dns}
MTU = ${SERVER_CONFIG.mtu}

[Peer]
PublicKey = ${SERVER_CONFIG.publicKey}
Endpoint = ${SERVER_CONFIG.endpoint}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = ${SERVER_CONFIG.keepalive}`;

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
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-white m-0">WireGuard Peer Provisioning</h2>
        <p className="text-xs text-slate-400 mt-1 m-0">
          Target Node: <span className="font-mono text-cyan-400">hermes-nexus</span> (201.79.39.236:51820)
        </p>
      </div>

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
                  Default: 10.8.0.{prof.defaultOctet}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

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
          Run this on <span className="font-mono text-slate-400">hermes-nexus</span> to live-bind the peer key directly into the kernel.
        </p>
      </div>
    </div>
  );
}

// ==========================================
// 3. HARDWARE DIAGNOSTICS VIEW
// ==========================================
function DiagnosticsView() {
  const [activeTab, setActiveTab] = useState("camera");

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const [micActive, setMicActive] = useState(false);
  const [micError, setMicError] = useState("");
  const [volume, setVolume] = useState(0);
  const micStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animFrameRef = useRef(null);

  const [activeColor, setActiveColor] = useState(null);

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => {
        t.stop();
        t.enabled = false;
      });
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError("");
    stopCamera();
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API not supported in this browser context.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });

      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err) {
      setCameraError(err.message || "Failed to access webcam. Check browser permissions.");
      setCameraActive(false);
    }
  };

  const stopMic = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => {
        t.stop();
        t.enabled = false;
      });
      micStreamRef.current = null;
    }
    setVolume(0);
    setMicActive(false);
  };

  const startMic = async () => {
    setMicError("");
    stopMic();
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Audio API not supported in this browser context.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);

      const trackLevel = () => {
        if (!analyser) return;
        analyser.getByteFrequencyData(buffer);
        let max = 0;
        for (let i = 0; i < buffer.length; i++) {
          if (buffer[i] > max) max = buffer[i];
        }
        const pct = Math.min(100, Math.round((max / 255) * 100));
        setVolume(pct);
        animFrameRef.current = requestAnimationFrame(trackLevel);
      };

      trackLevel();
      setMicActive(true);
    } catch (err) {
      setMicError(err.message || "Failed to access microphone. Check browser permissions.");
      setMicActive(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
      stopMic();
    };
  }, [activeTab]);

  return (
    <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8 text-left text-slate-200">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-white m-0">Hardware Diagnostics</h2>
        <p className="text-xs text-slate-400 mt-1 m-0">
          Verify connected webcams, audio capture levels, and display integrity.
        </p>
      </div>

      <div className="mt-5 flex gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("camera")}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
            activeTab === "camera"
              ? "border border-cyan-500/50 bg-cyan-950/70 text-cyan-300"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          📷 Camera Test
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("mic")}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
            activeTab === "mic"
              ? "border border-cyan-500/50 bg-cyan-950/70 text-cyan-300"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          🎙️ Microphone Test
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("display")}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
            activeTab === "display"
              ? "border border-cyan-500/50 bg-cyan-950/70 text-cyan-300"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          🖥️ Screen & Pixels
        </button>
      </div>

      {activeTab === "camera" && (
        <div className="mt-6 space-y-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover ${cameraActive ? "block" : "hidden"}`}
            />
            {!cameraActive && (
              <div className="text-center p-6 text-slate-500">
                <div className="text-3xl mb-2">📹</div>
                <div className="text-xs">Camera feed is offline.</div>
              </div>
            )}
            {cameraActive && (
              <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-slate-900/90 px-2.5 py-1 text-[11px] font-mono text-emerald-400 border border-emerald-500/30 shadow">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE STREAM
              </div>
            )}
          </div>

          {cameraError && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-950/30 p-2.5 text-xs text-rose-300">
              {cameraError}
            </div>
          )}

          <div className="flex gap-3">
            {!cameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-cyan-500 transition"
              >
                Start Camera
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="rounded-xl border border-rose-600/40 bg-rose-600/20 px-4 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-600/30 transition"
              >
                Stop Camera
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === "mic" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span>Input Sound Level</span>
              <span className="font-mono text-cyan-400 text-sm">{volume}%</span>
            </div>

            <div className="h-4 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  volume > 70
                    ? "bg-rose-500"
                    : volume > 30
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                }`}
                style={{ width: `${volume}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-400 m-0">
              Speak into your microphone. If the signal bar responds, the audio driver and permissions are functional.
            </p>
          </div>

          {micError && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-950/30 p-2.5 text-xs text-rose-300">
              {micError}
            </div>
          )}

          <div className="flex gap-3">
            {!micActive ? (
              <button
                type="button"
                onClick={startMic}
                className="rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-cyan-500 transition"
              >
                Start Mic Test
              </button>
            ) : (
              <button
                type="button"
                onClick={stopMic}
                className="rounded-xl border border-rose-600/40 bg-rose-600/20 px-4 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-600/30 transition"
              >
                Stop Mic Test
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === "display" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white m-0">Dead Pixel & Backlight Screening</h3>
            <p className="text-xs text-slate-400 m-0 leading-relaxed">
              Select a color below to take over the viewport. Look for stuck or dead subpixels. Click anywhere to exit.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {SOLID_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setActiveColor(c.hex)}
                  className={`rounded-lg border bg-slate-900/60 py-2.5 text-xs font-semibold transition hover:bg-slate-800 ${c.border} ${c.text} ${c.span ? "sm:col-span-4" : ""}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeColor && (
        <div
          onClick={() => setActiveColor(null)}
          style={{ backgroundColor: activeColor }}
          className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer select-none"
        >
          <span className="rounded-full bg-black/75 px-4 py-2 text-xs font-mono text-white backdrop-blur shadow opacity-60 hover:opacity-100 transition">
            Click anywhere to exit inspection
          </span>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. ADMIN DASHBOARD WITH LIVE TELEMETRY
// ==========================================
function AdminDashboardView({ passphrase }) {
  const [peers, setPeers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchPeers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(SERVER_CONFIG.telemetryEndpoint, {
        headers: { "x-api-key": passphrase || "Secret1234" },
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setPeers(data.peers || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(
        `Failed to reach telemetry daemon: ${err.message}. Confirm port 5050 is open on hermes-nexus and wg-telemetry service is active.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeers();
    const interval = setInterval(fetchPeers, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8 text-left text-slate-200">
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white m-0">Admin Telemetry & Live Peers</h2>
          <p className="text-xs text-slate-400 mt-1 m-0">
            Node: <span className="font-mono text-cyan-400">hermes-nexus</span> (201.79.39.236)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[11px] font-mono text-slate-500">Updated: {lastUpdated}</span>
          )}
          <button
            type="button"
            onClick={fetchPeers}
            disabled={loading}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      {/* Node Metrics Cards */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
          <div className="text-[10px] text-slate-500 font-mono">NODE HOST</div>
          <div className="text-sm font-bold text-white mt-0.5">hermes-nexus</div>
          <div className="text-xs text-cyan-400 font-mono mt-0.5">201.79.39.236</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
          <div className="text-[10px] text-slate-500 font-mono">PORTAL DEPLOYMENT</div>
          <div className="text-sm font-bold text-white mt-0.5">Render Cloud</div>
          <div className="text-xs text-emerald-400 font-mono mt-0.5">Service: Active</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
          <div className="text-[10px] text-slate-500 font-mono">WIREGUARD MESH</div>
          <div className="text-sm font-bold text-white mt-0.5">10.8.0.0/24</div>
          <div className="text-xs text-slate-400 font-mono mt-0.5">Gateway: 10.8.0.1</div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Live Peer Telemetry Table */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white m-0">Live Registered Peers</h3>
          <span className="text-[11px] font-mono text-cyan-400">{peers.length} Peers In Kernel</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
              <tr>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned IP</th>
                <th className="p-3">Public Key</th>
                <th className="p-3">Last Handshake</th>
                <th className="p-3 text-right">Transfer (Rx / Tx)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {peers.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="p-5 text-center text-slate-500 font-sans">
                    No connected peers reported or telemetry daemon offline.
                  </td>
                </tr>
              )}
              {peers.map((peer) => (
                <tr key={peer.publicKey} className="hover:bg-slate-900/30">
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-sans font-bold ${
                        peer.isActive
                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-900 text-slate-500 border border-slate-800"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          peer.isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
                        }`}
                      />
                      {peer.isActive ? "ONLINE" : "IDLE"}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-cyan-300">{peer.allowedIps}</td>
                  <td className="p-3 text-slate-400 truncate max-w-[140px]" title={peer.publicKey}>
                    {peer.publicKey.slice(0, 10)}...{peer.publicKey.slice(-4)}
                  </td>
                  <td className="p-3 text-slate-300">{peer.latestHandshake}</td>
                  <td className="p-3 text-right text-slate-400">
                    {peer.rxMB} MB ↓ / {peer.txMB} MB ↑
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-800 pt-4">
        <p className="text-[11px] text-slate-500 m-0">
          Telemetry daemon running on <span className="font-mono text-slate-400">port 5050</span> on node hermes-nexus via systemd (<span className="font-mono text-slate-400">wg-telemetry.service</span>).
        </p>
      </div>
    </div>
  );
}

// ==========================================
// 5. ROOT APPLICATION
// ==========================================
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [authError, setAuthError] = useState(false);
  const [activeTab, setActiveTab] = useState("diagnostics");

  const handleLogin = (e) => {
    e.preventDefault();
    if (passphrase === "Secret1234") {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassphrase("");
    setActiveTab("diagnostics");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
              CN
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white m-0">Cloud Nexus</h1>
              <p className="text-[10px] text-cyan-400 font-mono m-0">Ascendant Technology Partners</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/80 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("diagnostics")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === "diagnostics"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                🛠️ Diagnostics
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("enrollment")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === "enrollment"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                ⚡ WireGuard
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("admin")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === "admin"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                🔒 Admin
              </button>
            </nav>

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 hover:border-rose-900/50 transition ml-2"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        {activeTab === "diagnostics" && <DiagnosticsView />}

        {(activeTab === "enrollment" || activeTab === "admin") && (
          !isAuthenticated ? (
            <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl text-center">
              <div className="h-12 w-12 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-4 text-xl">
                🛡️
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Restricted Access</h2>
              <p className="text-xs text-slate-400 mb-6">
                Enter master passphrase to access {activeTab === "enrollment" ? "WireGuard Provisioning" : "Admin Dashboard"}
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="password"
                    placeholder="Master Passphrase"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition"
                    autoFocus
                  />
                  {authError && (
                    <p className="text-xs text-rose-400 mt-2 font-medium text-left">
                      Access Denied: Invalid Passphrase
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-cyan-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-cyan-500 transition"
                >
                  Unlock {activeTab === "enrollment" ? "WireGuard" : "Admin"}
                </button>
              </form>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              {activeTab === "enrollment" && <WireguardEnrollmentView />}
              {activeTab === "admin" && <AdminDashboardView passphrase={passphrase} />}
            </div>
          )
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-[11px] text-slate-600 font-mono">
        Cloud Nexus &bull; Node: hermes-nexus (201.79.39.236)
      </footer>
    </div>
  );
}