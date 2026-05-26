import React, { useState, useEffect } from "react";
import { Panel, Group, Separator } from "react-resizable-panels";
import "./App.css";
import { DatabaseService } from "./services/DatabaseService";
import type { MediaItem } from "./services/DatabaseService";
import { WindowManagementService } from "./services/WindowManagementService";

const fmt = (s: number) => `00:${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const Icon = ({ type, size = 13 }: { type: MediaItem["type"]; size?: number }) => {
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

const Screen = ({ item, playback }: { item: MediaItem | null, playback: number }) => {
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

export default function App() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [programMedia, setProgramMedia] = useState<MediaItem | null>(null);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [transitionDuration] = useState(600);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [newMediaName, setNewMediaName] = useState("");
  const [newMediaType, setNewMediaType] = useState<MediaItem["type"]>("image");
  const [newMediaContent, setNewMediaContent] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | MediaItem["type"]>("all");

  // Detecção da Janela de Projeção
  const isProjectionMode = typeof window !== "undefined" && window.location.search.includes("projection=true");

  const [projMedia, setProjMedia] = useState<MediaItem | null>(null);
  const [testText, setTestText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("Geral");

  // Estados do Inspetor do Banco de Dados
  const [debugDbSongs, setDebugDbSongs] = useState<any[]>([]);
  const [selectedDebugSong, setSelectedDebugSong] = useState<any | null>(null);
  const [rawQueryText, setRawQueryText] = useState("SELECT * FROM songs LIMIT 10;");
  const [rawQueryResult, setRawQueryResult] = useState<any[] | null>(null);
  const [rawQueryError, setRawQueryError] = useState<string | null>(null);
  const [dbStats, setDbStats] = useState({ total: 0, songs: 0, slides: 0, media: 0 });
  const [dbSubTab, setDbSubTab] = useState<"records" | "console">("records");

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleDeleteMedia = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await DatabaseService.deleteMedia(id);
    setMediaList(prev => prev.filter(m => m.id !== id));
    setMenuOpenId(null);
    if (previewMedia?.id === id) setPreviewMedia(null);
    if (programMedia?.id === id) setProgramMedia(null);
  };

  const loadDebugDb = () => {
    DatabaseService.debugGetAll()
      .then(rows => {
        setDebugDbSongs(rows);
        // Calcula estatísticas rápidas
        const stats = { total: rows.length, songs: 0, slides: 0, media: 0 };
        rows.forEach(r => {
          if (r.type === 'slide') stats.slides++;
          else if (r.type === 'image' || r.type === 'video' || r.type === 'audio') stats.media++;
          else stats.songs++;
        });
        setDbStats(stats);
      })
      .catch(err => console.error("Erro ao carregar debug DB:", err));
  };

  // Carrega os dados de debug se a aba Banco de Dados for aberta
  useEffect(() => {
    if (isSettingsOpen && activeSettingsTab === "Banco de Dados") {
      loadDebugDb();
      setRawQueryResult(null);
      setRawQueryError(null);
      setSelectedDebugSong(null);
    }
  }, [isSettingsOpen, activeSettingsTab]);

  // Carrega as mídias da base de dados/SQLite mock usando a query de busca FTS5
  useEffect(() => {
    DatabaseService.searchSongs(searchQuery).then(list => setMediaList(list));
  }, [searchQuery]);

  // Escuta os comandos na Janela 2 (Projeção)
  useEffect(() => {
    if (!isProjectionMode) return;
    const channel = WindowManagementService.getChannel();
    channel.onmessage = (event) => {
      const { action, payload } = event.data;
      if (action === "update_media") {
        setProjMedia(payload);
        setTestText("");
      } else if (action === "update_text") {
        setProjMedia(null);
        setTestText(payload);
      }
    };
    return () => WindowManagementService.closeChannel();
  }, [isProjectionMode]);

  // Transmite as mídias da Janela 1 (Painel do Operador) para a Janela 2
  useEffect(() => {
    if (isProjectionMode) return;
    WindowManagementService.sendMedia(programMedia);
  }, [programMedia, isProjectionMode]);

  // Função para abrir a Janela 2 (Projeção)
  const openProjectionWindow = () => {
    WindowManagementService.openProjectionWindow();
  };

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


  // Filtro
  const filtered = mediaList.filter(i => activeCategory === "all" || i.type === activeCategory);

  // Ações
  const selectMedia = (item: MediaItem) => { if (!isTransitioning) setPreviewMedia(item); };

  const addMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaName.trim()) return;
    const ext = { image: "jpg", video: "mp4", audio: "mp3", slide: "txt", music: "mp3", sequence: "seq", collection: "col", tempo: "timer", arquivo: "bin" }[newMediaType];
    const item = await DatabaseService.addMedia({
      name: newMediaName.includes(".") ? newMediaName : `${newMediaName}.${ext}`,
      type: newMediaType,
      content: newMediaContent || undefined,
      duration: newMediaType === "audio" ? "03:45" : undefined,
    });
    setMediaList(prev => [...prev, item]);
    setNewMediaName(""); setNewMediaContent(""); setShowAddForm(false);
  };

  const triggerFileImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let type: MediaItem["type"] = "arquivo";
      let content = "";
      
      // Auto-detect based on mime-type and extension
      if (file.type.startsWith("image/")) {
        type = "image";
      } else if (file.type.startsWith("video/")) {
        type = "video";
      } else if (file.type.startsWith("audio/")) {
        type = "audio";
      } else if (file.name.endsWith(".txt")) {
        type = "slide";
      } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        type = "arquivo";
      }

      // Convert to Base64 to save persistent offline inside SQLite WASM
      if (type === "slide") {
        content = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string || "");
          reader.readAsText(file);
        });
      } else if (type === "image" || type === "audio" || file.type === "application/pdf") {
        if (file.size < 12 * 1024 * 1024) {
          content = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as string || "");
            reader.readAsDataURL(file);
          });
        } else {
          content = URL.createObjectURL(file);
        }
      } else {
        content = URL.createObjectURL(file);
      }

      const item = await DatabaseService.addMedia({
        name: file.name,
        type,
        content: content || undefined,
        duration: type === "audio" ? "03:45" : undefined,
      });

      setMediaList(prev => [...prev, item]);
    }
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

  // Suporte a Teclas de Atalho (Hotkeys) para a Equipe de Projeção
  useEffect(() => {
    if (isProjectionMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.tagName === "SELECT")) {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        executeFade();
      } else if (e.code === "Enter") {
        e.preventDefault();
        executeCut();
      } else if (e.code === "Escape") {
        e.preventDefault();
        setProgramMedia(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewMedia, programMedia, isTransitioning, isProjectionMode]);



  // Se for a Janela de Projeção (Janela 2) - Modo Tela Cheia/Projetor Nativo
  if (isProjectionMode) {
    return (
      <div style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative"
      }}>
        {testText ? (
          <div style={{
            color: "#00ffee",
            fontSize: "clamp(24px, 5vw, 64px)",
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif"
          }}>
            {testText}
          </div>
        ) : (
          <Screen item={projMedia} playback={playback} />
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────
  return (
    <div style={{ height: "100%", background: "#0b0b0d", color: "#e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileImport} 
        multiple 
        accept="image/*,video/*,audio/*,application/pdf,.txt,.doc,.docx" 
        style={{ display: "none" }} 
      />

      {/* ── TITLEBAR ── */}
      <div style={{ height: 42, flexShrink: 0, padding: "0 16px", background: "#0f0f11", borderBottom: "1px solid #1c1c22", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/StageVision.png" alt="Logo" style={{ width: 22, height: 22, objectFit: "contain", borderRadius: 4 }} />
          <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: 1, color: "#fff" }}>
            Stage<span style={{ color: "#00ffee" }}>Vision</span>
          </h2>
          <span style={{ fontSize: 9, background: "#1c1c22", color: "#555", padding: "1px 5px", borderRadius: 3 }}>v1.2</span>

          <button
            onClick={() => setIsSettingsOpen(true)}
            style={{ marginLeft: 6, background: "transparent", border: "none", color: "#aaa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 4, borderRadius: 4 }}
            title="Configurações"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <button onClick={openProjectionWindow}
            style={{
              background: "#0a1b1a",
              border: "1px solid #003330",
              borderRadius: 6,
              color: "#00ffee",
              padding: "5px 10px",
              fontSize: 10,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4
            }}>
            <span>🖥️</span> PROJETAR
          </button>
          <div style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: "#00ffee", background: "#0a1b1a", padding: "3px 9px", borderRadius: 4, border: "1px solid #003330" }}>
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
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00ffee" strokeWidth="2.5">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#aaa", fontWeight: 700 }}>Biblioteca</span>
                </div>

                {/* Split Dropdown Button */}
                <div style={{ position: "relative", display: "flex", alignItems: "center", zIndex: 50 }}>
                  {showAddForm ? (
                    <button
                      onClick={() => setShowAddForm(false)}
                      style={{
                        background: "#ef4444", border: "none", color: "white", fontWeight: "bold",
                        width: 108, height: 28, borderRadius: 6, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, lineHeight: 1, flexShrink: 0
                      }}
                    >
                      × Fechar
                    </button>
                  ) : (
                    <div style={{ display: "flex", background: "#00ffee", borderRadius: 6, overflow: "hidden", border: "1px solid #00ffee", height: 28, width: 115 }}>
                      <button
                        onClick={triggerFileImport}
                        style={{
                          flex: 1, background: "transparent", border: "none", color: "black",
                          fontWeight: 800, fontSize: 11, cursor: "pointer", outline: "none",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          padding: "0 8px"
                        }}
                      >
                        Adicionar +
                      </button>
                      <div style={{ width: 1, background: "rgba(0, 0, 0, 0.3)", alignSelf: "stretch" }} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddDropdown(!showAddDropdown);
                        }}
                        style={{
                          width: 24, background: "transparent", border: "none", color: "black",
                          cursor: "pointer", outline: "none", display: "flex",
                          alignItems: "center", justifyContent: "center", fontSize: 8
                        }}
                      >
                        ▼
                      </button>
                    </div>
                  )}

                  {/* Dropdown Menu Overlay */}
                  {showAddDropdown && !showAddForm && (
                    <>
                      <div
                        onClick={() => setShowAddDropdown(false)}
                        style={{ position: "fixed", inset: 0, zIndex: 999 }}
                      />
                      <div style={{
                        position: "absolute", top: 32, right: 0, background: "#18181c",
                        border: "1px solid #27272a", borderRadius: 6, width: 120,
                        padding: "4px 0", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)",
                        zIndex: 1000, display: "flex", flexDirection: "column"
                      }}>
                        {[
                          { label: "Letras", type: "music" },
                          { label: "Coleção", type: "collection" },
                          { label: "Sequência", type: "sequence" },
                          { label: "Tempo", type: "tempo" },
                          { label: "Arquivo", type: "arquivo" }
                        ].map((opt) => (
                          <button
                            key={opt.label}
                            onClick={() => {
                              if (opt.type === "arquivo") {
                                triggerFileImport();
                              } else {
                                setNewMediaType(opt.type as MediaItem["type"]);
                                setShowAddForm(true);
                              }
                              setShowAddDropdown(false);
                            }}
                            style={{
                              background: "transparent", border: "none", color: "#e4e4e7",
                              textAlign: "left", padding: "8px 12px", fontSize: 11,
                              cursor: "pointer", transition: "background 0.15s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#27272a"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
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
                    <option value="music">Letras</option>
                    <option value="sequence">Sequência</option>
                    <option value="collection">Coleção</option>
                    <option value="tempo">Tempo</option>
                    <option value="arquivo">Arquivo</option>
                  </select>
                  {(newMediaType === "slide" || newMediaType === "image") && (
                    <textarea value={newMediaContent} onChange={e => setNewMediaContent(e.target.value)}
                      placeholder={newMediaType === "slide" ? "Texto..." : "URL da imagem"}
                      style={{ padding: "4px 7px", fontSize: 10, background: "#0b0b0d", border: "1px solid #333", borderRadius: 4, color: "white", outline: "none", resize: "none", height: 40, width: "100%" }} />
                  )}
                  <button type="submit" style={{ padding: "5px 0", background: "#00ffee", border: "none", color: "black", borderRadius: 4, cursor: "pointer", fontSize: 10, fontWeight: 800 }}>
                    ADICIONAR
                  </button>
                </form>
              )}

              {/* Busca */}
              <div style={{ padding: "6px 8px", background: "#0b0b0d", borderBottom: "1px solid #1c1c22", flexShrink: 0 }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar na biblioteca (FTS5)..."
                  style={{ width: "100%", padding: "5px 8px", fontSize: 10, background: "#1a1a22", border: "1px solid #333", borderRadius: 4, color: "white", outline: "none" }}
                />
              </div>

              {/* Filtros */}
              <div style={{ display: "flex", gap: 3, padding: "6px 8px", overflowX: "auto", flexShrink: 0, borderBottom: "1px solid #161618", background: "#0f0f12" }}>
                {(["all", "image", "video", "slide", "audio", "music", "sequence", "collection", "tempo", "arquivo"] as const).map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: "3px 7px", fontSize: 8, fontWeight: 700, textTransform: "uppercase", borderRadius: 10, border: "none", cursor: "pointer", flexShrink: 0,
                      background: activeCategory === cat ? "#00ffee" : "#1e1e26",
                      color: activeCategory === cat ? "black" : "#aaa", transition: "all 0.15s"
                    }}>
                    {cat === "all" ? "TODOS" : cat === "image" ? "IMAGEM" : cat === "video" ? "VÍDEO" : cat === "slide" ? "SLIDE" : cat === "audio" ? "ÁUDIO" : cat === "music" ? "LETRAS" : cat === "sequence" ? "SEQUÊNCIA" : cat === "collection" ? "COLEÇÃO" : cat === "tempo" ? "TEMPO" : "ARQUIVO"}
                  </button>
                ))}
              </div>

              {/* Lista */}
              <div style={{ overflowY: "auto", flex: 1, padding: 7, display: "flex", flexDirection: "column", gap: 4 }}>
                {filtered.length > 0 ? filtered.map(item => {
                  return (
                    <div key={item.id} onClick={() => selectMedia(item)} className="media-item"
                      style={{
                        padding: "7px 9px",
                        background: "#1a1a22",
                        borderRadius: 5,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 6
                      }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                        <span style={{ color: "#888", flexShrink: 0, display: "flex" }}>
                          <Icon type={item.type} />
                        </span>
                        <span style={{
                          fontSize: 11,
                          color: "#ccc",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {item.name}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 9, color: "#555" }}>{item.duration ?? "—"}</span>
                        
                        <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId(menuOpenId === item.id ? null : item.id);
                            }}
                            style={{
                              background: "transparent", border: "none", color: "#888",
                              cursor: "pointer", padding: "2px", borderRadius: 4,
                              display: "flex", alignItems: "center", justifyContent: "center"
                            }}
                            title="Opções"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="5" r="1.5"></circle>
                              <circle cx="12" cy="12" r="1.5"></circle>
                              <circle cx="12" cy="19" r="1.5"></circle>
                            </svg>
                          </button>
                          
                          {menuOpenId === item.id && (
                            <>
                              <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); }} />
                              <div style={{
                                position: "absolute", top: "100%", right: 0, marginTop: 4,
                                background: "#18181c", border: "1px solid #27272a", borderRadius: 6,
                                padding: "4px", boxShadow: "0 4px 12px rgba(0,0,0,0.5)", zIndex: 999,
                                minWidth: 100
                              }}>
                                <button
                                  onClick={(e) => handleDeleteMedia(item.id, e)}
                                  style={{
                                    width: "100%", background: "transparent", border: "none", color: "#ef4444",
                                    textAlign: "left", padding: "6px 12px", fontSize: 11,
                                    cursor: "pointer", borderRadius: 4, display: "flex", alignItems: "center", gap: 6
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = "#27272a"}
                                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                  </svg>
                                  Deletar
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div style={{ padding: 20, color: "#333", textAlign: "center", fontSize: 10 }}>Vazio</div>
                )}
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
                  </div>
                  {/* Screen container wrapping responsive aspect-ratio box */}
                  <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", containerType: "size" }}>
                    <div style={{
                      width: "min(100cqw, calc(100cqh * 16 / 9))",
                      height: "min(100cqh, calc(100cqw * 9 / 16))",
                      position: "relative",
                      border: "1px solid #2e2e38",
                      borderRadius: 0,
                      overflow: "hidden",
                      background: "#000"
                    }}>
                      <Screen item={previewMedia} playback={playback} />
                    </div>
                  </div>
                </div>

                {/* BOTÕES CUT / FADE / FTB */}
                <div style={{ width: 72, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
                  <button onClick={executeFade} disabled={isTransitioning}
                    style={{
                      width: "100%", padding: "11px 0",
                      background: isTransitioning ? "#004a45" : "#00ffee",
                      border: "none", borderRadius: 6, color: isTransitioning ? "#888" : "black", fontWeight: 800, fontSize: 11, letterSpacing: 1,
                      cursor: isTransitioning ? "not-allowed" : "pointer"
                    }}>
                    Play
                  </button>
                  <button onClick={executeCut} disabled={isTransitioning}
                    style={{
                      width: "100%", padding: "11px 0", background: "#1c1c24",
                      border: "1px solid #3a3a44", borderRadius: 6, color: "white", fontWeight: 800, fontSize: 11, letterSpacing: 1,
                      cursor: isTransitioning ? "not-allowed" : "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.5)"
                    }}>
                    CUT
                  </button>
                </div>

                {/* PROGRAM */}
                <div style={{ flex: 1, alignSelf: "stretch", display: "flex", flexDirection: "column", minWidth: 0, justifyContent: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#888" }}>
                      PROGRAM
                    </span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setProgramMedia(null)}
                        style={{ background: "#585858", borderRadius: 6, border: "none", color: "#ffffff", fontSize: 9, cursor: "pointer", padding: "4px 8px", fontWeight: "bold" }}>
                        FTB
                      </button>
                      <button onClick={() => setProgramMedia(null)}
                        style={{ background: "#585858", borderRadius: 6, border: "none", color: "#ffffff", fontSize: 9, cursor: "pointer", padding: "4px 8px", fontWeight: "bold" }}>
                        LIMPAR
                      </button>
                    </div>
                  </div>
                  {/* Screen container wrapping responsive aspect-ratio box */}
                  <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", containerType: "size" }}>
                    <div style={{
                      width: "min(100cqw, calc(100cqh * 16 / 9))",
                      height: "min(100cqh, calc(100cqw * 9 / 16))",
                      position: "relative",
                      border: "1px solid #2e2e38",
                      borderRadius: 0,
                      overflow: "hidden",
                      background: "#000"
                    }}>
                      <Screen item={programMedia} playback={playback} />
                      {/* Cross-fade overlay */}
                      {(isTransitioning || transitionProgress > 0) && previewMedia && (
                        <div style={{ position: "absolute", inset: 0, opacity: transitionProgress / 100, zIndex: 5, overflow: "hidden" }}>
                          <Screen item={previewMedia} playback={playback} />
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

      {/* ── SETTINGS MODAL ── */}
      {isSettingsOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0, 0, 0, 0.65)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            width: "85vw", maxWidth: 900, height: "80vh", maxHeight: 650,
            background: "#18181b", borderRadius: 12, border: "1px solid #27272a",
            display: "flex", flexDirection: "column", overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
          }}>
            {/* Modal Header */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #27272a", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1f1f23" }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#eee" }}>Configurações - {activeSettingsTab}</h3>
              <button onClick={() => setIsSettingsOpen(false)} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
              {/* Sidebar */}
              <div style={{ width: 220, background: "#18181b", borderRight: "1px solid #27272a", padding: "16px 0", overflowY: "auto" }}>
                {(["Geral", "Conta", "Permissões", "Aparência", "Notificações", "Atalhos", "Banco de Dados", "Avançado"]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveSettingsTab(tab)}
                    style={{
                      width: "100%", textAlign: "left", padding: "8px 24px",
                      background: activeSettingsTab === tab ? "#27272a" : "transparent",
                      border: "none", color: activeSettingsTab === tab ? "#00ffee" : "#a1a1aa",
                      fontSize: 13, cursor: "pointer", transition: "background 0.2s"
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div style={{ flex: 1, background: "#131316", padding: "24px 32px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
                <h4 style={{ margin: "0 0 16px 0", color: "#fff", fontSize: 16, fontWeight: 500, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{activeSettingsTab === "Banco de Dados" ? "Inspetor de Banco de Dados (SQLite WASM)" : `Opções de ${activeSettingsTab}`}</span>
                  {activeSettingsTab === "Banco de Dados" && (
                    <button
                      onClick={loadDebugDb}
                      style={{
                        background: "#1c1c24", border: "1px solid #3a3a44", color: "#eee",
                        padding: "4px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38l5.67-5.67" /></svg>
                      Recarregar
                    </button>
                  )}
                </h4>

                {activeSettingsTab === "Banco de Dados" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, minHeight: 0 }}>
                    {/* Stats Row */}
                    <div style={{ display: "flex", gap: 12 }}>
                      {[
                        { label: "Total Registros", val: dbStats.total, color: "#00ffee" },
                        { label: "Músicas (Songs)", val: dbStats.songs, color: "#c084fc" },
                        { label: "Slides", val: dbStats.slides, color: "#60a5fa" },
                        { label: "Mídias de Fundo", val: dbStats.media, color: "#34d399" }
                      ].map((stat, idx) => (
                        <div key={idx} style={{ flex: 1, background: "#1c1c20", border: "1px solid #27272f", padding: "10px 14px", borderRadius: 8 }}>
                          <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>{stat.label}</div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: stat.color }}>{stat.val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Sub-tab selection */}
                    <div style={{ display: "flex", borderBottom: "1px solid #27272a", gap: 16 }}>
                      <button
                        onClick={() => setDbSubTab("records")}
                        style={{
                          background: "transparent", border: "none", borderBottom: dbSubTab === "records" ? "2px solid #00ffee" : "2px solid transparent",
                          color: dbSubTab === "records" ? "#00ffee" : "#888", padding: "6px 8px 8px 8px", cursor: "pointer", fontSize: 13, fontWeight: 500
                        }}
                      >
                        Registros (`songs`)
                      </button>
                      <button
                        onClick={() => setDbSubTab("console")}
                        style={{
                          background: "transparent", border: "none", borderBottom: dbSubTab === "console" ? "2px solid #00ffee" : "2px solid transparent",
                          color: dbSubTab === "console" ? "#00ffee" : "#888", padding: "6px 8px 8px 8px", cursor: "pointer", fontSize: 13, fontWeight: 500
                        }}
                      >
                        Console SQL Avançado
                      </button>
                    </div>

                    {dbSubTab === "records" ? (
                      <div style={{ display: "flex", gap: 16, flex: 1, minHeight: 0, overflow: "hidden" }}>
                        {/* Records List Column */}
                        <div style={{ width: "45%", display: "flex", flexDirection: "column", gap: 8, background: "#18181c", borderRadius: 8, border: "1px solid #27272a", padding: 12, overflow: "hidden" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#a1a1aa" }}>Lista de Músicas e Mídias</span>
                          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                            {debugDbSongs.length === 0 ? (
                              <div style={{ padding: 16, color: "#666", textAlign: "center", fontSize: 12 }}>Nenhum registro no banco.</div>
                            ) : (
                              debugDbSongs.map(song => (
                                <div
                                  key={song.id}
                                  onClick={() => setSelectedDebugSong(song)}
                                  style={{
                                    padding: "8px 12px", borderRadius: 6, cursor: "pointer",
                                    background: selectedDebugSong?.id === song.id ? "#27272f" : "#131316",
                                    border: selectedDebugSong?.id === song.id ? "1px solid #00ffee" : "1px solid #1c1c22",
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    transition: "all 0.15s ease"
                                  }}
                                >
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: "#eee", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                      {song.title || song.name}
                                    </div>
                                    <div style={{ fontSize: 10, color: "#888", display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
                                      <span style={{ background: "#222", padding: "1px 4px", borderRadius: 2, textTransform: "uppercase", fontSize: 8 }}>{song.type}</span>
                                      <span>{song.artist || "Sem artista"}</span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (confirm(`Tem certeza que deseja apagar "${song.title || song.name}" do banco de dados SQLite?`)) {
                                        await DatabaseService.deleteMedia(song.id);
                                        if (selectedDebugSong?.id === song.id) setSelectedDebugSong(null);
                                        loadDebugDb();
                                        // Also trigger update of main list
                                        DatabaseService.searchSongs(searchQuery).then(list => setMediaList(list));
                                      }
                                    }}
                                    style={{
                                      background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: 4, display: "flex", alignItems: "center"
                                    }}
                                    title="Excluir do SQLite"
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" /></svg>
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Details Column */}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, background: "#18181c", borderRadius: 8, border: "1px solid #27272a", padding: 16, overflowY: "auto" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#a1a1aa" }}>Detalhamento da Linha (Campos Brutos)</span>
                          {selectedDebugSong ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                              <div>
                                <div style={{ fontSize: 9, color: "#555", fontWeight: 700, textTransform: "uppercase" }}>ID (UUID/Chave Primária)</div>
                                <div style={{ fontSize: 11, fontFamily: "monospace", color: "#00ffee", background: "#131316", padding: 6, borderRadius: 4, border: "1px solid #222", overflowX: "auto" }}>
                                  {selectedDebugSong.id}
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 9, color: "#555", fontWeight: 700, textTransform: "uppercase" }}>Título</div>
                                  <div style={{ fontSize: 12, color: "#fff", background: "#131316", padding: 6, borderRadius: 4, border: "1px solid #222" }}>
                                    {selectedDebugSong.title || selectedDebugSong.name}
                                  </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 9, color: "#555", fontWeight: 700, textTransform: "uppercase" }}>Artista</div>
                                  <div style={{ fontSize: 12, color: "#fff", background: "#131316", padding: 6, borderRadius: 4, border: "1px solid #222" }}>
                                    {selectedDebugSong.artist || "[Nulo/Vazio]"}
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 9, color: "#555", fontWeight: 700, textTransform: "uppercase" }}>Tipo de Registro</div>
                                  <div style={{ fontSize: 12, color: "#fff", background: "#131316", padding: 6, borderRadius: 4, border: "1px solid #222", textTransform: "capitalize" }}>
                                    {selectedDebugSong.type}
                                  </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 9, color: "#555", fontWeight: 700, textTransform: "uppercase" }}>Duração</div>
                                  <div style={{ fontSize: 12, color: "#fff", background: "#131316", padding: 6, borderRadius: 4, border: "1px solid #222" }}>
                                    {selectedDebugSong.duration || "[Sem duração]"}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: 9, color: "#555", fontWeight: 700, textTransform: "uppercase" }}>URL / Conteúdo do Slide</div>
                                <div style={{ fontSize: 11, fontFamily: "monospace", color: "#a1a1aa", background: "#131316", padding: 6, borderRadius: 4, border: "1px solid #222", maxHeight: 80, overflowY: "auto", whiteSpace: "pre-wrap" }}>
                                  {selectedDebugSong.content || "[Vazio]"}
                                </div>
                              </div>
                              {selectedDebugSong.lyrics && (
                                <div>
                                  <div style={{ fontSize: 9, color: "#555", fontWeight: 700, textTransform: "uppercase" }}>Letra da Música (lyrics)</div>
                                  <div style={{ fontSize: 11, color: "#ddd", background: "#131316", padding: 10, borderRadius: 4, border: "1px solid #222", maxHeight: 150, overflowY: "auto", whiteSpace: "pre-wrap", fontFamily: "Georgia, serif" }}>
                                    {selectedDebugSong.lyrics}
                                  </div>
                                </div>
                              )}
                              {selectedDebugSong.created_at && (
                                <div>
                                  <div style={{ fontSize: 9, color: "#555", fontWeight: 700, textTransform: "uppercase" }}>Data de Inserção</div>
                                  <div style={{ fontSize: 10, color: "#888" }}>
                                    {new Date(selectedDebugSong.created_at).toLocaleString('pt-BR')}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 12, flexDirection: "column", gap: 8 }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 17h6M9 12h6M9 7h4" /></svg>
                              Selecione um registro na lista lateral para inspecionar seus valores internos brutos.
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      // CONSOLE SQL TAB
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, minHeight: 0, overflow: "hidden" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#a1a1aa" }}>Console SQL Interativo</span>
                          <span style={{ fontSize: 10, color: "#666" }}>Digite uma query SQL válida (a tabela se chama <b>songs</b>) e execute diretamente no motor SQLite WASM rodando no Web Worker.</span>
                        </div>
                        <div style={{ position: "relative" }}>
                          <textarea
                            value={rawQueryText}
                            onChange={(e) => setRawQueryText(e.target.value)}
                            style={{
                              width: "100%", height: 80, background: "#0b0b0d", color: "#a2f6ff",
                              border: "1px solid #27272a", borderRadius: 6, padding: "8px 12px",
                              fontFamily: "monospace", fontSize: 12, resize: "none",
                              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.8)"
                            }}
                          />
                          <button
                            onClick={async () => {
                              try {
                                setRawQueryError(null);
                                setRawQueryResult(null);
                                const result = await DatabaseService.runRawQuery(rawQueryText);
                                setRawQueryResult(result);
                              } catch (err: any) {
                                setRawQueryError(err.message);
                              }
                            }}
                            style={{
                              position: "absolute", bottom: 10, right: 12,
                              background: "#00ffee", color: "#000", fontWeight: 700,
                              fontSize: 10, padding: "6px 12px", border: "none", borderRadius: 4,
                              cursor: "pointer", letterSpacing: 0.5, boxShadow: "0 2px 8px rgba(0,255,238,0.3)"
                            }}
                          >
                            Executar
                          </button>
                        </div>

                        {/* Templates Row */}
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 9, color: "#555", fontWeight: 700 }}>ATALHOS DE BUSCA:</span>
                          {[
                            { label: "Ver Tabelas", sql: "SELECT name, sql FROM sqlite_master WHERE type='table';" },
                            { label: "Ver Todas Músicas", sql: "SELECT * FROM songs ORDER BY title ASC;" },
                            { label: "Contagem por Tipo", sql: "SELECT type, count(*) as count FROM songs GROUP BY type;" },
                            { label: "FTS5 Teste MATCH", sql: "SELECT * FROM songs_fts WHERE songs_fts MATCH 'Culto';" }
                          ].map((t, idx) => (
                            <button
                              key={idx}
                              onClick={() => setRawQueryText(t.sql)}
                              style={{
                                background: "#1c1c20", border: "1px solid #27272f", color: "#a1a1aa",
                                fontSize: 9, padding: "4px 8px", borderRadius: 4, cursor: "pointer"
                              }}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>

                        {/* SQL Result Console */}
                        <div style={{ flex: 1, border: "1px solid #27272a", borderRadius: 8, background: "#18181c", padding: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#a1a1aa", marginBottom: 8 }}>Resultado do Console</span>

                          <div style={{ flex: 1, overflow: "auto" }}>
                            {rawQueryError && (
                              <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 6, padding: 12, color: "#f87171", fontSize: 11, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                                <b>Erro do SQLite WASM:</b> {rawQueryError}
                              </div>
                            )}

                            {rawQueryResult && (
                              rawQueryResult.length === 0 ? (
                                <div style={{ color: "#888", fontSize: 12, padding: 8 }}>
                                  Query executada com sucesso. Retornou 0 linhas.
                                </div>
                              ) : (
                                <div style={{ overflowX: "auto" }}>
                                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "monospace", color: "#ddd" }}>
                                    <thead>
                                      <tr style={{ background: "#27272a", borderBottom: "1px solid #3f3f46" }}>
                                        {Object.keys(rawQueryResult[0]).map(key => (
                                          <th key={key} style={{ padding: "8px 10px", textAlign: "left", color: "#00ffee", fontWeight: 600 }}>{key}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {rawQueryResult.map((row, rowIdx) => (
                                        <tr key={rowIdx} style={{ borderBottom: "1px solid #222", background: rowIdx % 2 === 0 ? "#131316" : "transparent" }}>
                                          {Object.keys(rawQueryResult[0]).map(key => (
                                            <td key={key} style={{ padding: "6px 10px", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={String(row[key])}>
                                              {row[key] === null ? <span style={{ color: "#555", fontStyle: "italic" }}>NULL</span> : String(row[key])}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )
                            )}

                            {!rawQueryError && !rawQueryResult && (
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#444", fontSize: 11, flexDirection: "column", gap: 4 }}>
                                Digite sua query SQL e clique no botão "Executar" para inspecionar os dados.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // DUMMY SETTINGS CARDS FOR OTHER TABS
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 20, borderBottom: "1px solid #27272a" }}>
                      <div>
                        <div style={{ color: "#eee", fontSize: 14, marginBottom: 4 }}>Tema Escuro Profundo</div>
                        <div style={{ color: "#888", fontSize: 12 }}>Utiliza tons de preto absoluto (#000) para economizar bateria em telas OLED.</div>
                      </div>
                      <div style={{ width: 44, height: 24, background: "#00ffee", borderRadius: 12, position: "relative", cursor: "pointer" }}>
                        <div style={{ width: 20, height: 20, background: "#000", borderRadius: "50%", position: "absolute", top: 2, right: 2 }}></div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 20, borderBottom: "1px solid #27272a" }}>
                      <div>
                        <div style={{ color: "#eee", fontSize: 14, marginBottom: 4 }}>Aceleração de Hardware</div>
                        <div style={{ color: "#888", fontSize: 12 }}>Usa a GPU para renderizar transições suaves sem sobrecarregar a CPU.</div>
                      </div>
                      <div style={{ width: 44, height: 24, background: "#00ffee", borderRadius: 12, position: "relative", cursor: "pointer" }}>
                        <div style={{ width: 20, height: 20, background: "#000", borderRadius: "50%", position: "absolute", top: 2, right: 2 }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "14px 24px", borderTop: "1px solid #27272a", background: "#18181b", display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                onClick={() => setIsSettingsOpen(false)}
                style={{ padding: "8px 16px", background: "transparent", border: "1px solid #3f3f46", color: "#e4e4e7", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
              >
                Fechar sem Salvar
              </button>
              <button
                onClick={() => setIsSettingsOpen(false)}
                style={{ padding: "8px 16px", background: "#00ffee", border: "none", color: "#000", fontWeight: 600, borderRadius: 6, fontSize: 13, cursor: "pointer" }}
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}