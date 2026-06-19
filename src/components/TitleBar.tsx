type TitleBarProps = {
  clock: string;
  onOpenProjection: () => void;
  onOpenSettings: () => void;
};

export function TitleBar({ clock, onOpenProjection, onOpenSettings }: TitleBarProps) {
  return (
    <div style={{ height: 42, flexShrink: 0, padding: "0 16px", background: "#18181B", borderBottom: "1px solid #3F3F46", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <img src="/StageVision.png" alt="Logo" style={{ width: 22, height: 22, objectFit: "contain", borderRadius: 4 }} />
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: 1, color: "#fff" }}>
          Stage<span style={{ color: "#10B981" }}>Vision</span>
        </h2>
        <span style={{ fontSize: 9, background: "#3F3F46", color: "#E2E8F0", padding: "1px 5px", borderRadius: 3 }}>v1.2</span>

        <button
          onClick={onOpenSettings}
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
        <button onClick={onOpenProjection}
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
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="12" rx="2" />
            <path d="M8 20h8M12 16v4" />
          </svg>
          PROJETAR
        </button>
        <div style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: "#10B981", background: "#064e3b", padding: "3px 9px", borderRadius: 4, border: "1px solid #047857" }}>
          {clock}
        </div>
      </div>
    </div>
  );
}
