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

  // ── DB Admin ──────────────────────────────────────────────────────────────
  const [dbTables, setDbTables] = useState<{name:string,rowCount:number}[]>([]);
  const [dbSelectedTable, setDbSelectedTable] = useState<string|null>(null);
  const [dbSchema, setDbSchema] = useState<any[]>([]);
  const [dbData, setDbData] = useState<any[]>([]);
  const [dbAdminTab, setDbAdminTab] = useState<'schema'|'data'|'sql'>('schema');
  const [rawQueryText, setRawQueryText] = useState("SELECT name FROM sqlite_master WHERE type='table';");
  const [rawQueryResult, setRawQueryResult] = useState<any[]|null>(null);
  const [rawQueryError, setRawQueryError] = useState<string|null>(null);
  // Criar tabela
  const [dbShowCreateTable, setDbShowCreateTable] = useState(false);
  const [dbNewTableName, setDbNewTableName] = useState('');
  const [dbNewTableCols, setDbNewTableCols] = useState<{name:string,type:string,pk:boolean,notnull:boolean}[]>([{name:'id',type:'TEXT',pk:true,notnull:true}]);
  // Adicionar coluna
  const [dbShowAddCol, setDbShowAddCol] = useState(false);
  const [dbNewColName, setDbNewColName] = useState('');
  const [dbNewColType, setDbNewColType] = useState('TEXT');
  const [dbNewColNotnull, setDbNewColNotnull] = useState(false);
  const [dbNewColDefault, setDbNewColDefault] = useState('');
  // Editar / adicionar linha
  const [dbEditingRowid, setDbEditingRowid] = useState<number|null>(null);
  const [dbEditValues, setDbEditValues] = useState<Record<string,string>>({});
  const [dbShowAddRow, setDbShowAddRow] = useState(false);
  const [dbNewRowValues, setDbNewRowValues] = useState<Record<string,string>>({});

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleDeleteMedia = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await DatabaseService.deleteMedia(id);
    setMediaList(prev => prev.filter(m => m.id !== id));
    setMenuOpenId(null);
    if (previewMedia?.id === id) setPreviewMedia(null);
    if (programMedia?.id === id) setProgramMedia(null);
  };

  const loadDbTables = async () => {
    try {
      const tables = await DatabaseService.getTables();
      setDbTables(tables);
    } catch(e) { console.error('loadDbTables:', e); }
  };

  const selectTable = async (name: string) => {
    setDbSelectedTable(name);
    setDbEditingRowid(null);
    setDbShowAddRow(false);
    setDbShowAddCol(false);
    setDbShowCreateTable(false);
    try {
      const [schema, data] = await Promise.all([
        DatabaseService.getTableSchema(name),
        DatabaseService.getTableData(name)
      ]);
      setDbSchema(schema);
      setDbData(data);
    } catch(e) { console.error('selectTable:', e); }
  };

  const refreshTableData = async (tableName?: string) => {
    const t = tableName || dbSelectedTable;
    if (!t) return;
    try {
      const [data, tables] = await Promise.all([
        DatabaseService.getTableData(t),
        DatabaseService.getTables()
      ]);
      setDbData(data);
      setDbTables(tables);
    } catch(e) { console.error('refreshTableData:', e); }
  };

  // Carrega as tabelas ao abrir a aba Banco de Dados
  useEffect(() => {
    if (isSettingsOpen && activeSettingsTab === "Banco de Dados") {
      loadDbTables();
      setRawQueryResult(null);
      setRawQueryError(null);
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
            color: "#10B981",
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
    <div style={{ height: "100%", background: "#27272A", color: "#E2E8F0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileImport} 
        multiple 
        accept="image/*,video/*,audio/*,application/pdf,.txt,.doc,.docx" 
        style={{ display: "none" }} 
      />

      {/* ── TITLEBAR ── */}
      <div style={{ height: 42, flexShrink: 0, padding: "0 16px", background: "#18181B", borderBottom: "1px solid #3F3F46", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/StageVision.png" alt="Logo" style={{ width: 22, height: 22, objectFit: "contain", borderRadius: 4 }} />
          <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: 1, color: "#fff" }}>
            Stage<span style={{ color: "#10B981" }}>Vision</span>
          </h2>
          <span style={{ fontSize: 9, background: "#3F3F46", color: "#E2E8F0", padding: "1px 5px", borderRadius: 3 }}>v1.2</span>

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
              background: "#064e3b",
              border: "1px solid #047857",
              borderRadius: 6,
              color: "#10B981",
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
          <div style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: "#10B981", background: "#064e3b", padding: "3px 9px", borderRadius: 4, border: "1px solid #047857" }}>
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
              style={{ background: "#27272A", display: "flex", flexDirection: "column", overflow: "hidden" }}>

              {/* Header */}
              <div style={{ padding: "10px 13px", borderBottom: "1px solid #3F3F46", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
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
                    <div style={{ display: "flex", background: "#10B981", borderRadius: 6, overflow: "hidden", border: "1px solid #10B981", height: 28, width: 115 }}>
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
                        position: "absolute", top: 32, right: 0, background: "#3F3F46",
                        border: "1px solid #52525B", borderRadius: 6, width: 120,
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
                            onMouseEnter={(e) => e.currentTarget.style.background = "#52525B"}
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
                <form onSubmit={addMedia} style={{ padding: 9, background: "#3F3F46", borderBottom: "1px solid #52525B", flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  <input value={newMediaName} onChange={e => setNewMediaName(e.target.value)} placeholder="Nome" required
                    style={{ padding: "4px 7px", fontSize: 10, background: "#27272A", border: "1px solid #52525B", borderRadius: 4, color: "white", outline: "none", width: "100%" }} />
                  <select value={newMediaType} onChange={e => setNewMediaType(e.target.value as MediaItem["type"])}
                    style={{ padding: "4px 7px", fontSize: 10, background: "#27272A", border: "1px solid #52525B", borderRadius: 4, color: "white", outline: "none" }}>
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
                      style={{ padding: "4px 7px", fontSize: 10, background: "#27272A", border: "1px solid #52525B", borderRadius: 4, color: "white", outline: "none", resize: "none", height: 40, width: "100%" }} />
                  )}
                  <button type="submit" style={{ padding: "5px 0", background: "#10B981", border: "none", color: "black", borderRadius: 4, cursor: "pointer", fontSize: 10, fontWeight: 800 }}>
                    ADICIONAR
                  </button>
                </form>
              )}

              {/* Busca */}
              <div style={{ padding: "6px 8px", background: "#27272A", borderBottom: "1px solid #3F3F46", flexShrink: 0 }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar na biblioteca (FTS5)..."
                  style={{ width: "100%", padding: "5px 8px", fontSize: 10, background: "#3F3F46", border: "1px solid #52525B", borderRadius: 4, color: "white", outline: "none" }}
                />
              </div>

              {/* Filtros */}
              <div style={{ display: "flex", gap: 3, padding: "6px 8px", overflowX: "auto", flexShrink: 0, borderBottom: "1px solid #3F3F46", background: "#18181B" }}>
                {(["all", "image", "video", "slide", "audio", "music", "sequence", "collection", "tempo", "arquivo"] as const).map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: "3px 7px", fontSize: 8, fontWeight: 700, textTransform: "uppercase", borderRadius: 10, border: "none", cursor: "pointer", flexShrink: 0,
                      background: activeCategory === cat ? "#10B981" : "#3F3F46",
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
                        background: "#3F3F46",
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
                                background: "#3F3F46", border: "1px solid #52525B", borderRadius: 6,
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
                                  onMouseEnter={(e) => e.currentTarget.style.background = "#52525B"}
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
              style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: "#27272A" }}>

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
                      border: "1px solid #3F3F46",
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
                      background: isTransitioning ? "#065f46" : "#10B981",
                      border: "none", borderRadius: 6, color: isTransitioning ? "#888" : "black", fontWeight: 800, fontSize: 11, letterSpacing: 1,
                      cursor: isTransitioning ? "not-allowed" : "pointer"
                    }}>
                    Play
                  </button>
                  <button onClick={executeCut} disabled={isTransitioning}
                    style={{
                      width: "100%", padding: "11px 0", background: "#3F3F46",
                      border: "1px solid #52525B", borderRadius: 6, color: "white", fontWeight: 800, fontSize: 11, letterSpacing: 1,
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
                      border: "1px solid #3F3F46",
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
          </Group>
        </Panel>

        {/* Separador horizontal (top ↕ bottom) — largura total */}
        <Separator id="bottom-sep" style={{ height: 6 }} />

        {/* ── PAINEL INFERIOR — largura total ── */}
        <Panel id="bottom-panel" defaultSize={40} minSize={15}
          style={{ background: "#27272A", display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Header */}
          <div style={{ height: 34, flexShrink: 0, padding: "0 14px", borderBottom: "1px solid #3F3F46", display: "flex", alignItems: "center", gap: 8 }}>
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
            width: "85vw", maxWidth: 900, height: "88vh",
            background: "#27272A", borderRadius: 12, border: "1px solid #3F3F46",
            display: "flex", flexDirection: "column", overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
          }}>
            {/* Modal Header */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #3F3F46", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#18181B" }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#eee" }}>Configurações - {activeSettingsTab}</h3>
              <button onClick={() => setIsSettingsOpen(false)} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
              {/* Sidebar */}
              <div style={{ width: 220, background: "#18181B", borderRight: "1px solid #3F3F46", padding: "16px 0", overflowY: "auto" }}>
                {(["Geral", "Conta", "Permissões", "Aparência", "Notificações", "Atalhos", "Banco de Dados", "Avançado"]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveSettingsTab(tab)}
                    style={{
                      width: "100%", textAlign: "left", padding: "8px 24px",
                      background: activeSettingsTab === tab ? "#3F3F46" : "transparent",
                      border: "none", color: activeSettingsTab === tab ? "#10B981" : "#E2E8F0",
                      fontSize: 13, cursor: "pointer", transition: "background 0.2s"
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div style={{ flex: 1, background: "#27272A", padding: activeSettingsTab === "Banco de Dados" ? "16px" : "24px 32px", overflowY: "auto", display: "flex", flexDirection: "column", minHeight: 0 }}>
                {activeSettingsTab !== "Banco de Dados" && (
                  <h4 style={{ margin: "0 0 16px 0", color: "#fff", fontSize: 16, fontWeight: 500 }}>
                    Opções de {activeSettingsTab}
                  </h4>
                )}

                {activeSettingsTab === "Banco de Dados" ? (
                  // ══ DB ADMIN PANEL ════════════════════════════════════════
                  <div style={{ display: "flex", gap: 0, flex: 1, minHeight: 0, height: '100%' }}>

                    {/* ── Coluna Esquerda: lista de tabelas ── */}
                    <div style={{ width: 180, display: "flex", flexDirection: "column", gap: 8, borderRight: "1px solid #3F3F46", paddingRight: 12, marginRight: 16 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "#52525B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>TABELAS ({dbTables.length})</div>
                      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                        {dbTables.length === 0 ? (
                          <div style={{ color: "#52525B", fontSize: 11, textAlign: "center", padding: "20px 0" }}>Nenhuma tabela</div>
                        ) : dbTables.map(t => (
                          <button key={t.name} onClick={() => selectTable(t.name)} style={{
                            background: dbSelectedTable === t.name ? "#3F3F46" : "transparent",
                            border: dbSelectedTable === t.name ? "1px solid #10B981" : "1px solid transparent",
                            borderRadius: 6, padding: "7px 8px", cursor: "pointer",
                            display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", textAlign: "left"
                          }}>
                            <span style={{ fontSize: 12, color: dbSelectedTable === t.name ? "#10B981" : "#E2E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110 }}>{t.name}</span>
                            <span style={{ fontSize: 9, background: "#52525B", color: "#a1a1aa", padding: "1px 5px", borderRadius: 8, flexShrink: 0 }}>{t.rowCount}</span>
                          </button>
                        ))}
                      </div>
                      <button onClick={() => { setDbShowCreateTable(true); setDbSelectedTable(null); setDbNewTableName(''); setDbNewTableCols([{name:'id',type:'TEXT',pk:true,notnull:true}]); }} style={{
                        background: "#10B981", color: "#000", border: "none", borderRadius: 6, padding: "8px",
                        fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4
                      }}>+ Nova Tabela</button>
                      <button onClick={() => { setDbSelectedTable(null); setDbShowCreateTable(false); setDbAdminTab('sql'); setRawQueryResult(null); setRawQueryError(null); }} style={{
                        background: dbAdminTab === 'sql' && !dbSelectedTable && !dbShowCreateTable ? "#3F3F46" : "transparent",
                        color: dbAdminTab === 'sql' && !dbSelectedTable && !dbShowCreateTable ? "#10B981" : "#a1a1aa",
                        border: dbAdminTab === 'sql' && !dbSelectedTable && !dbShowCreateTable ? "1px solid #10B98140" : "1px solid transparent",
                        borderRadius: 6, padding: "8px", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
                        Console SQL
                      </button>
                      <button onClick={async () => {
                        if (confirm("Apagar TODAS as tabelas e dados? Esta ação não pode ser desfeita.")) {
                          await DatabaseService.resetDatabase();
                          setDbSelectedTable(null); setDbSchema([]); setDbData([]);
                          setDbShowCreateTable(false);
                          loadDbTables();
                        }
                      }} style={{ background: "transparent", color: "#ef4444", border: "1px solid #ef444430", borderRadius: 6, padding: "6px", fontSize: 11, cursor: "pointer" }}>
                        ⚠ Resetar DB
                      </button>
                    </div>

                    {/* ── Área Principal ── */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>

                      {/* FORMULÁRIO: Criar nova tabela */}
                      {dbShowCreateTable ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Criar Nova Tabela</span>
                            <button onClick={() => setDbShowCreateTable(false)} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: 18 }}>×</button>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 11, color: "#a1a1aa", width: 80, flexShrink: 0 }}>Nome:</span>
                            <input value={dbNewTableName} onChange={e => setDbNewTableName(e.target.value)}
                              placeholder="nome_da_tabela"
                              style={{ flex: 1, background: "#18181B", border: "1px solid #52525B", borderRadius: 4, padding: "6px 10px", color: "#fff", fontSize: 12, fontFamily: "monospace" }} />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: "#a1a1aa" }}>COLUNAS</span>
                              <button onClick={() => setDbNewTableCols(prev => [...prev, { name: '', type: 'TEXT', pk: false, notnull: false }])} style={{ background: "#3F3F46", border: "1px solid #52525B", color: "#eee", borderRadius: 4, padding: "3px 8px", fontSize: 10, cursor: "pointer" }}>+ Coluna</button>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 50px 60px 28px", gap: "4px 6px", alignItems: "center" }}>
                              <span style={{ fontSize: 9, color: "#555", fontWeight: 700 }}>NOME</span>
                              <span style={{ fontSize: 9, color: "#555", fontWeight: 700 }}>TIPO</span>
                              <span style={{ fontSize: 9, color: "#555", fontWeight: 700, textAlign: "center" }}>PK</span>
                              <span style={{ fontSize: 9, color: "#555", fontWeight: 700, textAlign: "center" }}>NOT NULL</span>
                              <span></span>
                              {dbNewTableCols.map((col, ci) => (
                                <React.Fragment key={ci}>
                                  <input value={col.name} onChange={e => setDbNewTableCols(p => p.map((c, i) => i === ci ? { ...c, name: e.target.value } : c))}
                                    placeholder="nome_coluna"
                                    style={{ background: "#18181B", border: "1px solid #3F3F46", borderRadius: 3, padding: "5px 8px", color: "#fff", fontSize: 11, fontFamily: "monospace" }} />
                                  <select value={col.type} onChange={e => setDbNewTableCols(p => p.map((c, i) => i === ci ? { ...c, type: e.target.value } : c))}
                                    style={{ background: "#18181B", border: "1px solid #3F3F46", borderRadius: 3, padding: "5px 4px", color: "#E2E8F0", fontSize: 11 }}>
                                    {['TEXT','INTEGER','REAL','BLOB','DATETIME','BOOLEAN'].map(t => <option key={t}>{t}</option>)}
                                  </select>
                                  <div style={{ display: "flex", justifyContent: "center" }}>
                                    <input type="checkbox" checked={col.pk} onChange={e => setDbNewTableCols(p => p.map((c, i) => i === ci ? { ...c, pk: e.target.checked } : c))} />
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "center" }}>
                                    <input type="checkbox" checked={col.notnull} onChange={e => setDbNewTableCols(p => p.map((c, i) => i === ci ? { ...c, notnull: e.target.checked } : c))} />
                                  </div>
                                  <button onClick={() => setDbNewTableCols(p => p.filter((_, i) => i !== ci))} disabled={dbNewTableCols.length === 1}
                                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14, padding: 0, opacity: dbNewTableCols.length === 1 ? 0.3 : 1 }}>×</button>
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                          {/* SQL Preview */}
                          {dbNewTableName && dbNewTableCols.some(c => c.name) && (
                            <div style={{ background: "#18181B", border: "1px solid #3F3F46", borderRadius: 4, padding: "8px 12px", fontFamily: "monospace", fontSize: 10, color: "#10B981", whiteSpace: "pre-wrap" }}>
                              {`CREATE TABLE "${dbNewTableName}" (\n${dbNewTableCols.filter(c=>c.name).map(c => `  "${c.name}" ${c.type}${c.pk?' PRIMARY KEY':''}${c.notnull&&!c.pk?' NOT NULL':''}`).join(',\n')}\n);`}
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={async () => {
                              if (!dbNewTableName.trim()) { alert('Informe o nome da tabela'); return; }
                              const validCols = dbNewTableCols.filter(c => c.name.trim());
                              if (validCols.length === 0) { alert('Adicione pelo menos uma coluna'); return; }
                              try {
                                await DatabaseService.createTable(dbNewTableName.trim(), validCols);
                                setDbShowCreateTable(false);
                                await loadDbTables();
                                selectTable(dbNewTableName.trim());
                              } catch(err: any) { alert('Erro: ' + err.message); }
                            }} style={{ background: "#10B981", color: "#000", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                              Criar Tabela
                            </button>
                            <button onClick={() => setDbShowCreateTable(false)} style={{ background: "transparent", border: "1px solid #3F3F46", color: "#888", borderRadius: 6, padding: "8px 16px", fontSize: 12, cursor: "pointer" }}>Cancelar</button>
                          </div>
                        </div>

                      ) : dbSelectedTable ? (
                        // TABELA SELECIONADA
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                          {/* Header da tabela */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                              <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "monospace" }}>{dbSelectedTable}</span>
                              <span style={{ fontSize: 11, color: "#888" }}>{dbTables.find(t => t.name === dbSelectedTable)?.rowCount ?? 0} linhas</span>
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => refreshTableData()} style={{ background: "#3F3F46", border: "1px solid #52525B", color: "#eee", borderRadius: 4, padding: "4px 10px", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38" /></svg>Atualizar
                              </button>
                              <button onClick={async () => {
                                if (confirm(`Deletar tabela "${dbSelectedTable}"? Esta ação não pode ser desfeita.`)) {
                                  await DatabaseService.dropTable(dbSelectedTable);
                                  setDbSelectedTable(null); setDbSchema([]); setDbData([]);
                                  loadDbTables();
                                }
                              }} style={{ background: "transparent", border: "1px solid #ef444440", color: "#ef4444", borderRadius: 4, padding: "4px 10px", fontSize: 10, cursor: "pointer" }}>
                                🗑 Deletar Tabela
                              </button>
                            </div>
                          </div>

                          {/* Sub-abas */}
                          <div style={{ display: "flex", borderBottom: "1px solid #3F3F46", gap: 0 }}>
                            {([['schema','Estrutura'],['data','Dados'],['sql','Console SQL']] as const).map(([key, label]) => (
                              <button key={key} onClick={() => setDbAdminTab(key)} style={{
                                background: "transparent", border: "none",
                                borderBottom: dbAdminTab === key ? "2px solid #10B981" : "2px solid transparent",
                                color: dbAdminTab === key ? "#10B981" : "#888",
                                padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 500
                              }}>{label}</button>
                            ))}
                          </div>

                          {/* ─ ABA: ESTRUTURA ─ */}
                          {dbAdminTab === 'schema' && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "monospace" }}>
                                <thead>
                                  <tr style={{ background: "#3F3F46" }}>
                                    {['#','Nome','Tipo','Null','Default','PK'].map(h => (
                                      <th key={h} style={{ padding: "7px 10px", textAlign: "left", color: "#10B981", fontWeight: 600, fontSize: 10 }}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {dbSchema.map((col, ci) => (
                                    <tr key={ci} style={{ borderBottom: "1px solid #3F3F46", background: ci%2===0?"#27272A":"#2d2d30" }}>
                                      <td style={{ padding: "6px 10px", color: "#555" }}>{col.cid}</td>
                                      <td style={{ padding: "6px 10px", color: "#E2E8F0", fontWeight: 600 }}>{col.name}</td>
                                      <td style={{ padding: "6px 10px", color: "#c084fc" }}>{col.type}</td>
                                      <td style={{ padding: "6px 10px", color: col.notnull?"#ef4444":"#52525B" }}>{col.notnull?'NOT NULL':'NULL'}</td>
                                      <td style={{ padding: "6px 10px", color: "#888", fontStyle: col.dflt_value===null?"italic":"normal" }}>{col.dflt_value===null?'—':String(col.dflt_value)}</td>
                                      <td style={{ padding: "6px 10px", color: col.pk?"#10B981":"#555" }}>{col.pk?'✓ PK':''}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {/* Adicionar coluna */}
                              {dbShowAddCol ? (
                                <div style={{ background: "#18181B", border: "1px solid #3F3F46", borderRadius: 6, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                                  <span style={{ fontSize: 11, fontWeight: 600, color: "#a1a1aa" }}>Adicionar Coluna</span>
                                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <input value={dbNewColName} onChange={e => setDbNewColName(e.target.value)} placeholder="nome_coluna"
                                      style={{ flex: 1, background: "#27272A", border: "1px solid #52525B", borderRadius: 4, padding: "6px 8px", color: "#fff", fontSize: 11, fontFamily: "monospace" }} />
                                    <select value={dbNewColType} onChange={e => setDbNewColType(e.target.value)}
                                      style={{ background: "#27272A", border: "1px solid #52525B", borderRadius: 4, padding: "6px 4px", color: "#E2E8F0", fontSize: 11 }}>
                                      {['TEXT','INTEGER','REAL','BLOB','DATETIME','BOOLEAN'].map(t => <option key={t}>{t}</option>)}
                                    </select>
                                    <input value={dbNewColDefault} onChange={e => setDbNewColDefault(e.target.value)} placeholder="default (opcional)"
                                      style={{ width: 120, background: "#27272A", border: "1px solid #52525B", borderRadius: 4, padding: "6px 8px", color: "#fff", fontSize: 11 }} />
                                    <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#888", whiteSpace: "nowrap" }}>
                                      <input type="checkbox" checked={dbNewColNotnull} onChange={e => setDbNewColNotnull(e.target.checked)} /> NOT NULL
                                    </label>
                                  </div>
                                  <div style={{ display: "flex", gap: 6 }}>
                                    <button onClick={async () => {
                                      if (!dbNewColName.trim()) { alert('Informe o nome da coluna'); return; }
                                      try {
                                        await DatabaseService.addColumn(dbSelectedTable, { name: dbNewColName.trim(), type: dbNewColType, notnull: dbNewColNotnull, defaultValue: dbNewColDefault });
                                        setDbShowAddCol(false); setDbNewColName(''); setDbNewColDefault(''); setDbNewColNotnull(false);
                                        const schema = await DatabaseService.getTableSchema(dbSelectedTable);
                                        setDbSchema(schema);
                                      } catch(err: any) { alert('Erro: ' + err.message); }
                                    }} style={{ background: "#10B981", color: "#000", border: "none", borderRadius: 4, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Adicionar</button>
                                    <button onClick={() => { setDbShowAddCol(false); setDbNewColName(''); }} style={{ background: "transparent", border: "1px solid #3F3F46", color: "#888", borderRadius: 4, padding: "6px 12px", fontSize: 11, cursor: "pointer" }}>Cancelar</button>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => setDbShowAddCol(true)} style={{ background: "#3F3F46", border: "1px dashed #52525B", color: "#a1a1aa", borderRadius: 6, padding: "8px", fontSize: 11, cursor: "pointer", alignSelf: "flex-start" }}>+ Adicionar Coluna</button>
                              )}
                            </div>
                          )}

                          {/* ─ ABA: DADOS ─ */}
                          {dbAdminTab === 'data' && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {/* Botão adicionar linha */}
                              {!dbShowAddRow && !dbEditingRowid && (
                                <button onClick={() => {
                                  setDbShowAddRow(true);
                                  const init: Record<string,string> = {};
                                  dbSchema.forEach(col => { init[col.name] = ''; });
                                  setDbNewRowValues(init);
                                }} style={{ background: "#10B981", color: "#000", border: "none", borderRadius: 6, padding: "7px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer", alignSelf: "flex-start" }}>+ Nova Linha</button>
                              )}

                              {/* Form: nova linha */}
                              {dbShowAddRow && (
                                <div style={{ background: "#18181B", border: "1px solid #10B98140", borderRadius: 6, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                                  <span style={{ fontSize: 11, fontWeight: 600, color: "#10B981" }}>Inserir Nova Linha</span>
                                  <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "6px 10px", alignItems: "center" }}>
                                    {dbSchema.map(col => (
                                      <React.Fragment key={col.name}>
                                        <label style={{ fontSize: 10, color: "#888", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{col.name} <span style={{color:"#c084fc"}}>{col.type}</span></label>
                                        <input value={dbNewRowValues[col.name]||''} onChange={e => setDbNewRowValues(p => ({...p, [col.name]: e.target.value}))}
                                          placeholder={col.dflt_value !== null ? `default: ${col.dflt_value}` : 'NULL'}
                                          style={{ background: "#27272A", border: "1px solid #3F3F46", borderRadius: 3, padding: "5px 8px", color: "#fff", fontSize: 11, fontFamily: "monospace" }} />
                                      </React.Fragment>
                                    ))}
                                  </div>
                                  <div style={{ display: "flex", gap: 6 }}>
                                    <button onClick={async () => {
                                      try {
                                        const vals: Record<string,string> = {};
                                        Object.entries(dbNewRowValues).forEach(([k,v]) => { if (v !== '') vals[k] = v; });
                                        await DatabaseService.insertRow(dbSelectedTable, vals);
                                        setDbShowAddRow(false);
                                        await refreshTableData();
                                      } catch(err: any) { alert('Erro: ' + err.message); }
                                    }} style={{ background: "#10B981", color: "#000", border: "none", borderRadius: 4, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Inserir</button>
                                    <button onClick={() => setDbShowAddRow(false)} style={{ background: "transparent", border: "1px solid #3F3F46", color: "#888", borderRadius: 4, padding: "6px 12px", fontSize: 11, cursor: "pointer" }}>Cancelar</button>
                                  </div>
                                </div>
                              )}

                              {/* Tabela de dados */}
                              {dbData.length === 0 ? (
                                <div style={{ color: "#52525B", fontSize: 12, textAlign: "center", padding: "24px 0" }}>Tabela vazia — insira a primeira linha acima.</div>
                              ) : (
                                <div style={{ overflowX: "auto" }}>
                                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "monospace" }}>
                                    <thead>
                                      <tr style={{ background: "#3F3F46" }}>
                                        {Object.keys(dbData[0]).filter(k => k !== '__rowid__').map(k => (
                                          <th key={k} style={{ padding: "6px 10px", textAlign: "left", color: "#10B981", fontWeight: 600, fontSize: 10, whiteSpace: "nowrap" }}>{k}</th>
                                        ))}
                                        <th style={{ padding: "6px 10px", color: "#555", fontSize: 10 }}>Ações</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {dbData.map((row, ri) => (
                                        <tr key={ri} style={{ borderBottom: "1px solid #3F3F46", background: dbEditingRowid === row.__rowid__ ? "#18181B" : ri%2===0?"#27272A":"#2d2d30" }}>
                                          {dbEditingRowid === row.__rowid__ ? (
                                            // Linha em edição
                                            <>
                                              {Object.keys(row).filter(k => k !== '__rowid__').map(k => (
                                                <td key={k} style={{ padding: "4px 6px" }}>
                                                  <input value={dbEditValues[k]??''} onChange={e => setDbEditValues(p => ({...p, [k]: e.target.value}))}
                                                    style={{ width: "100%", minWidth: 60, background: "#27272A", border: "1px solid #10B981", borderRadius: 3, padding: "4px 6px", color: "#fff", fontSize: 11, fontFamily: "monospace" }} />
                                                </td>
                                              ))}
                                              <td style={{ padding: "4px 6px", whiteSpace: "nowrap", display: "flex", gap: 4 }}>
                                                <button onClick={async () => {
                                                  try {
                                                    await DatabaseService.updateRow(dbSelectedTable, dbEditingRowid, dbEditValues);
                                                    setDbEditingRowid(null);
                                                    await refreshTableData();
                                                  } catch(err: any) { alert('Erro: ' + err.message); }
                                                }} style={{ background: "#10B981", color: "#000", border: "none", borderRadius: 3, padding: "3px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>✓</button>
                                                <button onClick={() => setDbEditingRowid(null)} style={{ background: "#3F3F46", border: "none", color: "#888", borderRadius: 3, padding: "3px 8px", fontSize: 10, cursor: "pointer" }}>✕</button>
                                              </td>
                                            </>
                                          ) : (
                                            // Linha normal
                                            <>
                                              {Object.keys(row).filter(k => k !== '__rowid__').map(k => (
                                                <td key={k} style={{ padding: "6px 10px", color: row[k]===null?"#555":"#E2E8F0", fontStyle: row[k]===null?"italic":"normal", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={row[k]===null?'NULL':String(row[k])}>
                                                  {row[k]===null?<span style={{color:"#555"}}>NULL</span>:String(row[k])}
                                                </td>
                                              ))}
                                              <td style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>
                                                <div style={{ display: "flex", gap: 4 }}>
                                                  <button onClick={() => {
                                                    const vals: Record<string,string> = {};
                                                    Object.keys(row).filter(k => k !== '__rowid__').forEach(k => { vals[k] = row[k] === null ? '' : String(row[k]); });
                                                    setDbEditValues(vals);
                                                    setDbEditingRowid(row.__rowid__);
                                                    setDbShowAddRow(false);
                                                  }} style={{ background: "#3F3F46", border: "none", color: "#E2E8F0", borderRadius: 3, padding: "3px 7px", fontSize: 10, cursor: "pointer" }}>✏</button>
                                                  <button onClick={async () => {
                                                    if (confirm('Deletar esta linha?')) {
                                                      await DatabaseService.deleteRow(dbSelectedTable, row.__rowid__);
                                                      await refreshTableData();
                                                    }
                                                  }} style={{ background: "transparent", border: "1px solid #ef444430", color: "#ef4444", borderRadius: 3, padding: "3px 7px", fontSize: 10, cursor: "pointer" }}>🗑</button>
                                                </div>
                                              </td>
                                            </>
                                          )}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ─ ABA: CONSOLE SQL ─ */}
                          {dbAdminTab === 'sql' && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <span style={{ fontSize: 11, color: "#666" }}>Execute qualquer SQL diretamente no banco de dados SQLite WASM.</span>
                                <div style={{ position: "relative" }}>
                                  <textarea value={rawQueryText} onChange={e => setRawQueryText(e.target.value)}
                                    style={{ width: "100%", height: 90, background: "#18181B", color: "#a2f6ff", border: "1px solid #52525B", borderRadius: 6, padding: "8px 12px", fontFamily: "monospace", fontSize: 12, resize: "vertical", boxSizing: "border-box" }} />
                                  <button onClick={async () => {
                                    try {
                                      setRawQueryError(null); setRawQueryResult(null);
                                      const result = await DatabaseService.runRawQuery(rawQueryText);
                                      setRawQueryResult(result);
                                      await loadDbTables();
                                    } catch(err: any) { setRawQueryError(err.message); }
                                  }} style={{ position: "absolute", bottom: 10, right: 10, background: "#10B981", color: "#000", fontWeight: 700, fontSize: 10, padding: "5px 12px", border: "none", borderRadius: 4, cursor: "pointer" }}>Executar</button>
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {[
                                  { label: "Ver Tabelas", sql: "SELECT name, sql FROM sqlite_master WHERE type='table';" },
                                  { label: `Todos de ${dbSelectedTable}`, sql: `SELECT * FROM "${dbSelectedTable}" LIMIT 50;` },
                                  { label: "Contar Linhas", sql: `SELECT COUNT(*) as total FROM "${dbSelectedTable}";` },
                                  { label: "Schema", sql: `PRAGMA table_info("${dbSelectedTable}");` }
                                ].map((t, idx) => (
                                  <button key={idx} onClick={() => setRawQueryText(t.sql)} style={{ background: "#3F3F46", border: "1px solid #52525B", color: "#a1a1aa", fontSize: 9, padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>{t.label}</button>
                                ))}
                              </div>
                              {rawQueryError && (
                                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: 10, color: "#f87171", fontSize: 11, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                                  <b>Erro:</b> {rawQueryError}
                                </div>
                              )}
                              {rawQueryResult && (
                                rawQueryResult.length === 0 ? (
                                  <div style={{ color: "#888", fontSize: 12 }}>Query executada. 0 linhas retornadas.</div>
                                ) : (
                                  <div style={{ overflowX: "auto", border: "1px solid #3F3F46", borderRadius: 6 }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "monospace" }}>
                                      <thead>
                                        <tr style={{ background: "#3F3F46" }}>
                                          {Object.keys(rawQueryResult[0]).map(k => (
                                            <th key={k} style={{ padding: "6px 10px", textAlign: "left", color: "#10B981", fontWeight: 600, fontSize: 10 }}>{k}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {rawQueryResult.map((row, ri) => (
                                          <tr key={ri} style={{ borderBottom: "1px solid #3F3F46", background: ri%2===0?"#27272A":"transparent" }}>
                                            {Object.keys(rawQueryResult[0]).map(k => (
                                              <td key={k} style={{ padding: "5px 10px", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: row[k]===null?"#555":"#E2E8F0" }} title={row[k]===null?'NULL':String(row[k])}>
                                                {row[k]===null?<span style={{fontStyle:"italic"}}>NULL</span>:String(row[k])}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>

                      ) : (
                        // CONSOLE SQL GLOBAL (sem tabela selecionada)
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #3F3F46", paddingBottom: 10 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Console SQL</span>
                            <span style={{ fontSize: 11, color: "#52525B" }}>Execute qualquer query diretamente no SQLite WASM</span>
                          </div>
                          <div style={{ position: "relative" }}>
                            <textarea
                              value={rawQueryText}
                              onChange={e => setRawQueryText(e.target.value)}
                              onKeyDown={e => {
                                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                  e.preventDefault();
                                  setRawQueryError(null); setRawQueryResult(null);
                                  DatabaseService.runRawQuery(rawQueryText)
                                    .then(r => { setRawQueryResult(r); loadDbTables(); })
                                    .catch(err => setRawQueryError(err.message));
                                }
                              }}
                              placeholder="Digite sua query SQL aqui...&#10;&#10;Exemplos:&#10;SELECT * FROM songs;&#10;CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT);&#10;PRAGMA table_info('songs');"
                              style={{
                                width: "100%", height: 140, background: "#18181B", color: "#a2f6ff",
                                border: "1px solid #52525B", borderRadius: 6, padding: "10px 14px",
                                fontFamily: "monospace", fontSize: 13, resize: "vertical",
                                boxSizing: "border-box", lineHeight: 1.6,
                                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)"
                              }} />
                            <div style={{ position: "absolute", bottom: 10, right: 10, display: "flex", gap: 6, alignItems: "center" }}>
                              <span style={{ fontSize: 9, color: "#52525B" }}>Ctrl+Enter</span>
                              <button onClick={async () => {
                                try {
                                  setRawQueryError(null); setRawQueryResult(null);
                                  const result = await DatabaseService.runRawQuery(rawQueryText);
                                  setRawQueryResult(result);
                                  await loadDbTables();
                                } catch(err: any) { setRawQueryError(err.message); }
                              }} style={{ background: "#10B981", color: "#000", fontWeight: 700, fontSize: 11, padding: "6px 14px", border: "none", borderRadius: 4, cursor: "pointer", boxShadow: "0 2px 8px rgba(16,185,129,0.3)" }}>
                                Executar
                              </button>
                            </div>
                          </div>
                          {/* Atalhos rápidos */}
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                            <span style={{ fontSize: 9, color: "#52525B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Atalhos:</span>
                            {[
                              { label: "Listar Tabelas", sql: "SELECT name, sql FROM sqlite_master WHERE type='table';" },
                              { label: "Listar Índices", sql: "SELECT name, tbl_name FROM sqlite_master WHERE type='index';" },
                              { label: "Ver Songs", sql: "SELECT * FROM songs LIMIT 20;" },
                              { label: "Contar por Tipo", sql: "SELECT type, COUNT(*) as total FROM songs GROUP BY type;" },
                              { label: "Limpar Songs", sql: "DELETE FROM songs;" },
                            ].map((t, idx) => (
                              <button key={idx} onClick={() => setRawQueryText(t.sql)} style={{ background: "#3F3F46", border: "1px solid #52525B", color: "#a1a1aa", fontSize: 10, padding: "4px 9px", borderRadius: 4, cursor: "pointer", transition: "background 0.15s" }}>
                                {t.label}
                              </button>
                            ))}
                          </div>
                          {/* Resultado */}
                          {rawQueryError && (
                            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "10px 14px", color: "#f87171", fontSize: 12, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                              <b>Erro SQLite:</b> {rawQueryError}
                            </div>
                          )}
                          {rawQueryResult && (
                            rawQueryResult.length === 0 ? (
                              <div style={{ color: "#888", fontSize: 12, padding: 8, background: "#18181B", borderRadius: 6, border: "1px solid #3F3F46" }}>✓ Query executada com sucesso. 0 linhas retornadas.</div>
                            ) : (
                              <div style={{ overflowX: "auto", border: "1px solid #3F3F46", borderRadius: 6, flex: 1 }}>
                                <div style={{ padding: "4px 10px", background: "#18181B", borderBottom: "1px solid #3F3F46", fontSize: 10, color: "#52525B" }}>
                                  {rawQueryResult.length} linha{rawQueryResult.length !== 1 ? 's' : ''} retornada{rawQueryResult.length !== 1 ? 's' : ''}
                                </div>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "monospace" }}>
                                  <thead>
                                    <tr style={{ background: "#3F3F46" }}>
                                      {Object.keys(rawQueryResult[0]).map(k => (
                                        <th key={k} style={{ padding: "7px 10px", textAlign: "left", color: "#10B981", fontWeight: 600, fontSize: 10, whiteSpace: "nowrap" }}>{k}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {rawQueryResult.map((row, ri) => (
                                      <tr key={ri} style={{ borderBottom: "1px solid #3F3F46", background: ri%2===0?"#27272A":"transparent" }}>
                                        {Object.keys(rawQueryResult[0]).map(k => (
                                          <td key={k} style={{ padding: "6px 10px", maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: row[k]===null?"#555":"#E2E8F0" }} title={row[k]===null?'NULL':String(row[k])}>
                                            {row[k]===null?<span style={{fontStyle:"italic",color:"#555"}}>NULL</span>:String(row[k])}
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
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#3F3F46", minHeight: 120 }}>
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
                              <span style={{ fontSize: 12 }}>Digite uma query acima e clique Executar</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // DUMMY SETTINGS CARDS FOR OTHER TABS
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 20, borderBottom: "1px solid #3F3F46" }}>
                      <div>
                        <div style={{ color: "#eee", fontSize: 14, marginBottom: 4 }}>Tema Escuro Profundo</div>
                        <div style={{ color: "#888", fontSize: 12 }}>Utiliza tons de preto absoluto (#000) para economizar bateria em telas OLED.</div>
                      </div>
                      <div style={{ width: 44, height: 24, background: "#10B981", borderRadius: 12, position: "relative", cursor: "pointer" }}>
                        <div style={{ width: 20, height: 20, background: "#000", borderRadius: "50%", position: "absolute", top: 2, right: 2 }}></div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 20, borderBottom: "1px solid #3F3F46" }}>
                      <div>
                        <div style={{ color: "#eee", fontSize: 14, marginBottom: 4 }}>Aceleração de Hardware</div>
                        <div style={{ color: "#888", fontSize: 12 }}>Usa a GPU para renderizar transições suaves sem sobrecarregar a CPU.</div>
                      </div>
                      <div style={{ width: 44, height: 24, background: "#10B981", borderRadius: 12, position: "relative", cursor: "pointer" }}>
                        <div style={{ width: 20, height: 20, background: "#000", borderRadius: "50%", position: "absolute", top: 2, right: 2 }}></div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "14px 24px", borderTop: "1px solid #3F3F46", background: "#18181B", display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                onClick={() => setIsSettingsOpen(false)}
                style={{ padding: "8px 16px", background: "transparent", border: "1px solid #52525B", color: "#e4e4e7", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
              >
                Fechar sem Salvar
              </button>
              <button
                onClick={() => setIsSettingsOpen(false)}
                style={{ padding: "8px 16px", background: "#10B981", border: "none", color: "#000", fontWeight: 600, borderRadius: 6, fontSize: 13, cursor: "pointer" }}
              >
                Salvar Alteracoes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
