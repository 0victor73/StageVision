import React, { useState, useEffect } from "react";
import { Panel, Group, Separator } from "react-resizable-panels";
import "./App.css";
import { DatabaseService } from "./services/DatabaseService";
import type { MediaItem } from "./services/DatabaseService";
import { WindowManagementService } from "./services/WindowManagementService";
import { BottomControlPanel } from "./components/BottomControlPanel";
import { MediaLibraryPanel } from "./components/MediaLibraryPanel";
import { MonitorsPanel } from "./components/MonitorsPanel";
import { ProjectionView } from "./components/ProjectionView";
import { SettingsModal } from "./components/SettingsModal";
import { TitleBar } from "./components/TitleBar";


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
    return <ProjectionView testText={testText} media={projMedia} playback={playback} />;
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

      <TitleBar clock={clock} onOpenProjection={openProjectionWindow} onOpenSettings={() => setIsSettingsOpen(true)} />

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

            <MediaLibraryPanel
              activeCategory={activeCategory}
              filteredMedia={filtered}
              menuOpenId={menuOpenId}
              newMediaContent={newMediaContent}
              newMediaName={newMediaName}
              newMediaType={newMediaType}
              searchQuery={searchQuery}
              showAddDropdown={showAddDropdown}
              showAddForm={showAddForm}
              onAddMedia={addMedia}
              onDeleteMedia={handleDeleteMedia}
              onSelectMedia={selectMedia}
              onSetActiveCategory={setActiveCategory}
              onSetMenuOpenId={setMenuOpenId}
              onSetNewMediaContent={setNewMediaContent}
              onSetNewMediaName={setNewMediaName}
              onSetNewMediaType={setNewMediaType}
              onSetSearchQuery={setSearchQuery}
              onSetShowAddDropdown={setShowAddDropdown}
              onSetShowAddForm={setShowAddForm}
              onTriggerFileImport={triggerFileImport}
            />

            <Separator id="lib-sep" style={{ width: 6 }} />

            <MonitorsPanel
              isTransitioning={isTransitioning}
              playback={playback}
              previewMedia={previewMedia}
              programMedia={programMedia}
              transitionProgress={transitionProgress}
              onClearProgram={() => setProgramMedia(null)}
              onCut={executeCut}
              onFade={executeFade}
            />
          </Group>
        </Panel>

        {/* Separador horizontal (top ↕ bottom) — largura total */}
        <Separator id="bottom-sep" style={{ height: 6 }} />

        <BottomControlPanel />

      </Group>{/* fim root-v */}

      {isSettingsOpen && (
        <SettingsModal
          activeSettingsTab={activeSettingsTab}
          setActiveSettingsTab={setActiveSettingsTab}
          setIsSettingsOpen={setIsSettingsOpen}
          dbTables={dbTables}
          dbSelectedTable={dbSelectedTable}
          dbSchema={dbSchema}
          dbData={dbData}
          dbAdminTab={dbAdminTab}
          rawQueryText={rawQueryText}
          rawQueryResult={rawQueryResult}
          rawQueryError={rawQueryError}
          dbShowCreateTable={dbShowCreateTable}
          dbNewTableName={dbNewTableName}
          dbNewTableCols={dbNewTableCols}
          dbShowAddCol={dbShowAddCol}
          dbNewColName={dbNewColName}
          dbNewColType={dbNewColType}
          dbNewColNotnull={dbNewColNotnull}
          dbNewColDefault={dbNewColDefault}
          dbEditingRowid={dbEditingRowid}
          dbEditValues={dbEditValues}
          dbShowAddRow={dbShowAddRow}
          dbNewRowValues={dbNewRowValues}
          setDbTables={setDbTables}
          setDbSelectedTable={setDbSelectedTable}
          setDbSchema={setDbSchema}
          setDbData={setDbData}
          setDbAdminTab={setDbAdminTab}
          setRawQueryText={setRawQueryText}
          setRawQueryResult={setRawQueryResult}
          setRawQueryError={setRawQueryError}
          setDbShowCreateTable={setDbShowCreateTable}
          setDbNewTableName={setDbNewTableName}
          setDbNewTableCols={setDbNewTableCols}
          setDbShowAddCol={setDbShowAddCol}
          setDbNewColName={setDbNewColName}
          setDbNewColType={setDbNewColType}
          setDbNewColNotnull={setDbNewColNotnull}
          setDbNewColDefault={setDbNewColDefault}
          setDbEditingRowid={setDbEditingRowid}
          setDbEditValues={setDbEditValues}
          setDbShowAddRow={setDbShowAddRow}
          setDbNewRowValues={setDbNewRowValues}
          loadDbTables={loadDbTables}
          refreshTableData={refreshTableData}
          selectTable={selectTable}
        />
      )}
    </div>
  );
}
