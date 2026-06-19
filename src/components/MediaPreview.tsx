import type { MediaItem } from "../services/DatabaseService";

const fmt = (s: number) => `00:${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export const Icon = ({ type, size = 13 }: { type: MediaItem["type"]; size?: number }) => {
  const p: Record<MediaItem["type"], string> = {
    image: "M3 3h18v18H3zM3 9l4-4 5 5 3-3 5 5M15 7a1 1 0 110-2 1 1 0 010 2",
    video: "M23 7l-7 5 7 5V7zM1 5h15v14H1z",
    audio: "M9 18V5l12-2v13M6 21a3 3 0 100-6 3 3 0 000 6zM18 19a3 3 0 100-6 3 3 0 000 6",
    slide: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
    music: "M9 18V5l12-2v13M6 21a3 3 0 100-6 3 3 0 000 6zM18 19a3 3 0 100-6 3 3 0 000 6",
    sequence: "M4 6h16M4 12h16M4 18h16",
    collection: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
    tempo: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-14v6l4 2",
    arquivo: "M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9zM13 2v7h7M9 13h6M9 17h6",
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {p[type].split("M").filter(Boolean).map((d, i) => <path key={i} d={`M${d}`} />)}
    </svg>
  );
};

export const Screen = ({ item, playback }: { item: MediaItem | null, playback: number }) => {
  if (!item) return (
    <div style={{ width: "100%", height: "100%", background: "#000" }} />
  );

  if (item.type === "image") return item.content
    ? <img src={item.content} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#1e1b4b,#311042)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#666", fontSize: 10 }}>Sem URL</span>
    </div>;

  if (item.type === "video") return (
    <div style={{ width: "100%", height: "100%", background: "linear-gradient(45deg,#020617,#0f172a)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <div className="video-glow" style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.25) 0%,transparent 70%)" }} />
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" style={{ zIndex: 2, marginBottom: 6 }}>
        <rect x="1" y="5" width="15" height="14" rx="2" /><path d="M23 7l-7 5 7 5V7z" />
      </svg>
      <span style={{ fontSize: 9, color: "#6366f1", fontWeight: 600, zIndex: 2, letterSpacing: 1 }}>VÍDEO · {fmt(playback)}</span>
      <div style={{ width: "55%", height: 2, background: "#1e1e2e", borderRadius: 1, marginTop: 7, zIndex: 2 }}>
        <div style={{ height: "100%", width: `${(playback / 300) * 100}%`, background: "#6366f1", boxShadow: "0 0 4px #6366f1", transition: "width 1s linear" }} />
      </div>
    </div>
  );

  if (item.type === "audio") return (
    <div style={{ width: "100%", height: "100%", background: "#060814", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 36, marginBottom: 8 }}>
        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className={`eq-bar eq-bar-${i}`} />)}
      </div>
      <span style={{ fontSize: 9, color: "#3b82f6", fontWeight: 600, letterSpacing: 1 }}>ÁUDIO · {fmt(playback)}</span>
    </div>
  );

  return (
    <div style={{ width: "100%", height: "100%", background: "radial-gradient(circle at center,#111827,#030712)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ color: "#f3f4f6", fontSize: "clamp(9px,1.3vw,15px)", lineHeight: 1.7, textAlign: "center", fontFamily: "Georgia,serif", whiteSpace: "pre-wrap" }}>
        {item.content || "[Slide em branco]"}
      </div>
    </div>
  );
};
