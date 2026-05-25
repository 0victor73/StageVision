import React, { useState, useEffect } from "react";
import { Panel, Group, Separator } from "react-resizable-panels";
import "./App.css";

interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video" | "audio" | "slide";
  content?: string;
  duration?: string;
}

const INITIAL_MEDIA: MediaItem[] = [
  { id: "1", name: "🌅 Abertura Culto.jpg", type: "image", content: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80" },
  { id: "2", name: "📹 Motion Loop.mp4", type: "video" },
  { id: "3", name: "🎵 Instrumental de Adoração.mp3", type: "audio", duration: "05:12" },
  { id: "4", name: "📝 Versículo do Dia (Sl 23).txt", type: "slide", content: "O Senhor é o meu pastor,\nnada me faltará.\n\n— Salmo 23:1" },
  { id: "5", name: "🌅 Encerramento Culto.png", type: "image", content: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" },
];

export default function App() {
  const [mediaList, setMediaList] = useState<MediaItem[]>(INITIAL_MEDIA);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [programMedia, setProgramMedia] = useState<MediaItem | null>(null);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [transitionDuration] = useState(600);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMediaName, setNewMediaName] = useState("");
  const [newMediaType, setNewMediaType] = useState<MediaItem["type"]>("image");
  const [newMediaContent, setNewMediaContent] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | MediaItem["type"]>("all");

  // Relógio
  const [clock, setClock] = useState("00:00:00");
  useEffect(() => {
    const t = setInterval(() => {
      const n = new Date();
      setClock(`${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}:${String(n.getSeconds()).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Timecode de playback simulado
  const [playback, setPlayback] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPlayback(p => p >= 300 ? 0 : p + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = (s: number) => `00:${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Filtro
  const filtered = mediaList.filter(i => activeCategory === "all" || i.type === activeCategory);

  // Ações
  const selectMedia = (item: MediaItem) => { if (!isTransitioning) setPreviewMedia(item); };

  const addMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaName.trim()) return;
    const ext = { image: "jpg", video: "mp4", audio: "mp3", slide: "txt" }[newMediaType];
    setMediaList(prev => [...prev, {
      id: String(Date.now()),
      name: newMediaName.includes(".") ? newMediaName : `${newMediaName}.${ext}`,
      type: newMediaType,
      content: newMediaContent || undefined,
      duration: newMediaType === "audio" ? "03:45" : undefined,
    }]);
    setNewMediaName(""); setNewMediaContent(""); setShowAddForm(false);
  };

  const executeCut = () => {
    if (isTransitioning) return;
    const tmp = programMedia; setProgramMedia(previewMedia); setPreviewMedia(tmp);
  };

  const executeFade = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / transitionDuration, 1);
      setTransitionProgress(Math.round(p * 100));
      if (p < 1) { requestAnimationFrame(tick); }
      else {
        const tmp = programMedia; setProgramMedia(previewMedia); setPreviewMedia(tmp);
        setIsTransitioning(false); setTransitionProgress(0);
      }
    };
    requestAnimationFrame(tick);
  };

  // Ícones
  const Icon = ({ type, size = 13 }: { type: MediaItem["type"]; size?: number }) => {
    const p: Record<MediaItem["type"], string> = {
      image: "M3 3h18v18H3zM3 9l4-4 5 5 3-3 5 5M15 7a1 1 0 110-2 1 1 0 010 2",
      video: "M23 7l-7 5 7 5V7zM1 5h15v14H1z",
      audio: "M9 18V5l12-2v13M6 21a3 3 0 100-6 3 3 0 000 6zM18 19a3 3 0 100-6 3 3 0 000 6",
      slide: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
    };
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {p[type].split("M").filter(Boolean).map((d, i) => <path key={i} d={`M${d}`} />)}
      </svg>
    );
  };

  // Conteúdo das telas
  const Screen = ({ item }: { item: MediaItem | null }) => {
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

    // slide
    return (
      <div style={{ width: "100%", height: "100%", background: "radial-gradient(circle at center,#111827,#030712)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ color: "#f3f4f6", fontSize: "clamp(9px,1.3vw,15px)", lineHeight: 1.7, textAlign: "center", fontFamily: "Georgia,serif", whiteSpace: "pre-wrap" }}>
          {item.content || "[Slide em branco]"}
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────
  return (
    <div style={{ height: "100%", background: "#0b0b0d", color: "#e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── TITLEBAR ── */}
      <div style={{ height: 42, flexShrink: 0, padding: "0 16px", background: "#0f0f11", borderBottom: "1px solid #1c1c22", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: "linear-gradient(135deg,#FED700,#b29600)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 8px rgba(254,215,0,0.35)" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="black"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          </div>
          <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: 1, color: "#fff" }}>
            Stage<span style={{ color: "#FED700" }}>Vision</span>
          </h2>
          <span style={{ fontSize: 9, background: "#1c1c22", color: "#555", padding: "1px 5px", borderRadius: 3 }}>v1.2</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: "#FED700", background: "#1a1810", padding: "3px 9px", borderRadius: 4, border: "1px solid #332b00" }}>
            {clock}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          LAYOUT PRINCIPAL — Group vertical:
            Panel superior  (biblioteca + monitores)
            Separator ↕
            Panel inferior  (largura total)
      ══════════════════════════════════════════ */}
      <Group id="root-v" orientation="vertical" style={{ flex: 1, overflow: "hidden" }}>

        {/* ── PAINEL SUPERIOR ── */}
        <Panel id="top-panel" defaultSize={60} minSize={30}
          style={{ display: "flex", overflow: "hidden" }}>

          {/* Group horizontal dentro do painel superior */}
          <Group id="top-h" orientation="horizontal" style={{ flex: 1, overflow: "hidden" }}>

            {/* ── BIBLIOTECA ── */}
            <Panel id="library-panel" defaultSize={25} minSize={10}
              style={{ background: "#121216", display: "flex", flexDirection: "column", overflow: "hidden" }}>

              {/* Header */}
              <div style={{ padding: "10px 13px", borderBottom: "1px solid #1c1c22", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FED700" strokeWidth="2.5">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#aaa", fontWeight: 700 }}>Biblioteca</span>
                </div>
                <button onClick={() => setShowAddForm(!showAddForm)}
                  style={{ background: showAddForm ? "#ef4444" : "linear-gradient(135deg,#FED700,#b29600)", border: "none", color: showAddForm ? "white" : "black", fontWeight: "bold", width: 18, height: 18, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, lineHeight: 1, flexShrink: 0 }}>
                  {showAddForm ? "×" : "+"}
                </button>
              </div>

              {/* Form */}
              {showAddForm && (
                <form onSubmit={addMedia} style={{ padding: 9, background: "#1a1a22", borderBottom: "1px solid #2e2840", flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  <input value={newMediaName} onChange={e => setNewMediaName(e.target.value)} placeholder="Nome" required
                    style={{ padding: "4px 7px", fontSize: 10, background: "#0b0b0d", border: "1px solid #333", borderRadius: 4, color: "white", outline: "none", width: "100%" }} />
                  <select value={newMediaType} onChange={e => setNewMediaType(e.target.value as MediaItem["type"])}
                    style={{ padding: "4px 7px", fontSize: 10, background: "#0b0b0d", border: "1px solid #333", borderRadius: 4, color: "white", outline: "none" }}>
                    <option value="image">Imagem</option>
                    <option value="video">Vídeo</option>
                    <option value="audio">Áudio</option>
                    <option value="slide">Slide</option>
                  </select>
                  {(newMediaType === "slide" || newMediaType === "image") && (
                    <textarea value={newMediaContent} onChange={e => setNewMediaContent(e.target.value)}
                      placeholder={newMediaType === "slide" ? "Texto..." : "URL da imagem"}
                      style={{ padding: "4px 7px", fontSize: 10, background: "#0b0b0d", border: "1px solid #333", borderRadius: 4, color: "white", outline: "none", resize: "none", height: 40, width: "100%" }} />
                  )}
                  <button type="submit" style={{ padding: "5px 0", background: "#FED700", border: "none", color: "black", borderRadius: 4, cursor: "pointer", fontSize: 10, fontWeight: 800 }}>
                    ADICIONAR
                  </button>
                </form>
              )}

              {/* Filtros */}
              <div style={{ display: "flex", gap: 3, padding: "6px 8px", overflowX: "auto", flexShrink: 0, borderBottom: "1px solid #161618", background: "#0f0f12" }}>
                {(["all", "image", "video", "audio", "slide"] as const).map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: "3px 7px", fontSize: 8, fontWeight: 700, textTransform: "uppercase", borderRadius: 10, border: "none", cursor: "pointer", flexShrink: 0,
                      background: activeCategory === cat ? "#FED700" : "#1e1e26",
                      color: activeCategory === cat ? "black" : "#aaa", transition: "all 0.15s"
                    }}>
                    {cat === "all" ? "Todos" : cat === "image" ? "IMG" : cat === "video" ? "VID" : cat === "audio" ? "ÁUD" : "SLD"}
                  </button>
                ))}
              </div>

              {/* Lista */}
              <div style={{ overflowY: "auto", flex: 1, padding: 7, display: "flex", flexDirection: "column", gap: 4 }}>
                {filtered.length > 0 ? filtered.map(item => {
                  const isPrev = previewMedia?.id === item.id;
                  const isLive = programMedia?.id === item.id;
                  return (
                    <div key={item.id} onClick={() => selectMedia(item)} className="media-item"
                      style={{
                        padding: "7px 9px", background: isLive ? "rgba(239,68,68,0.07)" : isPrev ? "rgba(16,185,129,0.07)" : "#1a1a22",
                        borderLeft: `3px solid ${isLive ? "#ef4444" : isPrev ? "#10b981" : "transparent"}`,
                        borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6
                      }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                        <span style={{ color: isLive ? "#ef4444" : isPrev ? "#10b981" : "#555", flexShrink: 0, display: "flex" }}>
                          <Icon type={item.type} />
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: isPrev || isLive ? 700 : 400,
                          color: isLive ? "#ef4444" : isPrev ? "#10b981" : "#ccc",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                        }}>
                          {item.name}
                        </span>
                      </div>
                      {isLive
                        ? <span style={{ fontSize: 7, fontWeight: 800, color: "#ef4444", border: "1px solid #ef4444", padding: "1px 3px", borderRadius: 3, flexShrink: 0 }}>LIVE</span>
                        : isPrev
                          ? <span style={{ fontSize: 7, fontWeight: 800, color: "#10b981", border: "1px solid #10b981", padding: "1px 3px", borderRadius: 3, flexShrink: 0 }}>PREV</span>
                          : <span style={{ fontSize: 9, color: "#3a3a3a", flexShrink: 0 }}>{item.duration ?? "—"}</span>}
                    </div>
                  );
                }) : (
                  <div style={{ padding: 20, color: "#333", textAlign: "center", fontSize: 10 }}>Vazio</div>
                )}
              </div>

              {/* Dica */}
              <div style={{ padding: "7px 12px", borderTop: "1px solid #1c1c22", flexShrink: 0, fontSize: 9, color: "#444", lineHeight: 1.5 }}>
                💡 Clique → <b style={{ color: "#888" }}>PREV</b> → <b style={{ color: "#FED700" }}>CUT</b> / <b style={{ color: "#FED700" }}>FADE</b>
              </div>
            </Panel>

            {/* Separador vertical (biblioteca ↔ monitores) */}
            <Separator id="lib-sep" style={{ width: 6 }} />

            {/* ── ÁREA DOS MONITORES ── */}
            <Panel id="monitors-panel" defaultSize={50} minSize={30}
              style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: "#0d0d10" }}>

              {/* Preview + Botões + Program — verticalmente centrado */}
              <div style={{ flex: 1, display: "flex", flexDirection: "row", alignItems: "center", padding: "14px 16px", gap: 14, overflow: "hidden" }}>

                {/* PREVIEW */}
                <div style={{ flex: 1, alignSelf: "stretch", display: "flex", flexDirection: "column", minWidth: 0, justifyContent: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#888" }}>
                      PREVIEW
                    </span>
                    {previewMedia && (
                      <button onClick={() => setPreviewMedia(null)}
                        style={{ background: "none", border: "none", color: "#444", fontSize: 9, cursor: "pointer", padding: 0 }}>CLEAR</button>
                    )}
                  </div>
                  {/* Screen container wrapping responsive aspect-ratio box */}
                  <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", containerType: "size" }}>
                    <div style={{
                      width: "min(100cqw, calc(100cqh * 16 / 9))",
                      height: "min(100cqh, calc(100cqw * 9 / 16))",
                      position: "relative",
                      border: "1px solid #2e2e38",
                      borderRadius: 6,
                      overflow: "hidden",
                      background: "#000"
                    }}>
                      <Screen item={previewMedia} />
                    </div>
                  </div>
                </div>

                {/* BOTÕES CUT / FADE */}
                <div style={{ width: 72, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
                  <button onClick={executeCut} disabled={isTransitioning} className="btn-transition"
                    style={{
                      width: "100%", padding: "11px 0", background: "linear-gradient(180deg,#2d2d38,#1c1c24)",
                      border: "1px solid #3a3a44", borderRadius: 6, color: "white", fontWeight: 800, fontSize: 11, letterSpacing: 1,
                      cursor: isTransitioning ? "not-allowed" : "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.5)"
                    }}>
                    CUT
                  </button>
                  <button onClick={executeFade} disabled={isTransitioning} className="btn-transition"
                    style={{
                      width: "100%", padding: "11px 0",
                      background: isTransitioning ? "linear-gradient(135deg,#4a3e00,#6b5b00)" : "linear-gradient(135deg,#FED700,#b29600)",
                      border: "none", borderRadius: 6, color: isTransitioning ? "#888" : "black", fontWeight: 800, fontSize: 11, letterSpacing: 1,
                      cursor: isTransitioning ? "not-allowed" : "pointer", boxShadow: "0 2px 10px rgba(254,215,0,0.3)"
                    }}>
                    FADE
                  </button>
                </div>

                {/* PROGRAM */}
                <div style={{ flex: 1, alignSelf: "stretch", display: "flex", flexDirection: "column", minWidth: 0, justifyContent: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#888" }}>
                      PROGRAM
                    </span>
                    {programMedia && (
                      <button onClick={() => setProgramMedia(null)}
                        style={{ background: "none", border: "none", color: "#444", fontSize: 9, cursor: "pointer", padding: 0 }}>BLACK</button>
                    )}
                  </div>
                  {/* Screen container wrapping responsive aspect-ratio box */}
                  <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", containerType: "size" }}>
                    <div style={{
                      width: "min(100cqw, calc(100cqh * 16 / 9))",
                      height: "min(100cqh, calc(100cqw * 9 / 16))",
                      position: "relative",
                      border: "1px solid #2e2e38",
                      borderRadius: 6,
                      overflow: "hidden",
                      background: "#000"
                    }}>
                      <Screen item={programMedia} />
                      {/* Cross-fade overlay */}
                      {(isTransitioning || transitionProgress > 0) && previewMedia && (
                        <div style={{ position: "absolute", inset: 0, opacity: transitionProgress / 100, zIndex: 5, overflow: "hidden" }}>
                          <Screen item={previewMedia} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </Panel>

          </Group>{/* fim top-h */}
        </Panel>{/* fim top-panel */}

        {/* Separador horizontal (top ↕ bottom) — largura total */}
        <Separator id="bottom-sep" style={{ height: 6 }} />

        {/* ── PAINEL INFERIOR — largura total ── */}
        <Panel id="bottom-panel" defaultSize={40} minSize={15}
          style={{ background: "#0f0f12", display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Header */}
          <div style={{ height: 34, flexShrink: 0, padding: "0 14px", borderBottom: "1px solid #1c1c22", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
            </svg>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#555" }}>Painel de Controle</span>
            <span style={{ fontSize: 9, color: "#2e2e36", fontStyle: "italic", marginLeft: 4 }}>— área reservada para funcionalidades futuras</span>
          </div>

          {/* Placeholder */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 32, padding: 20 }}>
            {(["Cronômetro", "Agenda", "Efeitos", "Scriptura"] as const).map((label, i) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.18 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, border: "1px dashed #555", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5">
                    {i === 0 && <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>}
                    {i === 1 && <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>}
                    {i === 2 && <><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></>}
                    {i === 3 && <><path d="M4 19V5a2 2 0 012-2h13" /><path d="M8 21h12a1 1 0 001-1V7" /></>}
                  </svg>
                </div>
                <span style={{ fontSize: 9, color: "#666", letterSpacing: 0.5 }}>{label}</span>
              </div>
            ))}
          </div>

        </Panel>{/* fim bottom-panel */}

      </Group>{/* fim root-v */}
    </div>
  );
}