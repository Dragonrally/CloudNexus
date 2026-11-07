import React, { useState, useEffect, useRef } from "react";

const SOLID_COLORS = [
  { name: "Pure Red", hex: "#ef4444", border: "border-red-500/40", text: "text-red-300" },
  { name: "Pure Green", hex: "#22c55e", border: "border-green-500/40", text: "text-green-300" },
  { name: "Pure Blue", hex: "#3b82f6", border: "border-blue-500/40", text: "text-blue-300" },
  { name: "Pure White", hex: "#ffffff", border: "border-slate-300", text: "text-slate-200" },
  { name: "Pure Black (Bleed Check)", hex: "#000000", border: "border-slate-700", text: "text-slate-400", span: true },
];

export default function Diagnostics() {
  const [activeTab, setActiveTab] = useState("camera"); // "camera" | "mic" | "display"

  // ---------------- CAMERA STATE ----------------
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  // ---------------- MIC STATE ----------------
  const [micActive, setMicActive] = useState(false);
  const [micError, setMicError] = useState("");
  const [volume, setVolume] = useState(0);
  const micStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animFrameRef = useRef(null);

  // ---------------- DISPLAY STATE ----------------
  const [activeColor, setActiveColor] = useState(null);

  // Helper: Stop Camera completely
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

  // Helper: Start Camera
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

  // Helper: Stop Microphone & Visualizer completely
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

  // Helper: Start Microphone & Audio Meter
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
        // Normalize 0-255 to percentage 0-100
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

  // Safe teardown when switching tabs or unmounting component
  useEffect(() => {
    return () => {
      stopCamera();
      stopMic();
    };
  }, [activeTab]);

  return (
    <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8 text-left text-slate-200">
      {/* Top Banner */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-white m-0">
          Hardware & Peripheral Diagnostics
        </h2>
        <p className="text-xs text-slate-400 mt-1 m-0">
          Test video capture, live microphone levels, and screen integrity directly in the browser.
        </p>
      </div>

      {/* Mode Navigation Tabs */}
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

      {/* TAB 1: CAMERA */}
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
                <div className="text-xs">Camera feed is idle.</div>
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

      {/* TAB 2: MICROPHONE */}
      {activeTab === "mic" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span>Input Sound Level</span>
              <span className="font-mono text-cyan-400 text-sm">{volume}%</span>
            </div>

            {/* Signal bar indicator */}
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
              Speak normally. If the bar moves into green/yellow, your operating system and browser audio drivers are capturing input properly.
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

      {/* TAB 3: SCREEN DEAD PIXEL TEST */}
      {activeTab === "display" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white m-0">Dead Pixel & Backlight Bleed Test</h3>
            <p className="text-xs text-slate-400 m-0 leading-relaxed">
              Select a color below to enter full-screen color mode. Look across your screen for stuck subpixels (dots of the wrong color) or back-light edge bleed. Tap or press anywhere to exit.
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

      {/* Full-viewport overlay for screen test */}
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