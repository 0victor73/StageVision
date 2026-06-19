import { Panel } from "react-resizable-panels";

export function BottomControlPanel() {
  return (
    <Panel id="bottom-panel" defaultSize={40} minSize={15}
      style={{ background: "#27272A", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ height: 34, flexShrink: 0, padding: "0 14px", borderBottom: "1px solid #3F3F46", display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
        </svg>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#555" }}>Painel de Controle</span>
        <span style={{ fontSize: 9, color: "#2e2e36", fontStyle: "italic", marginLeft: 4 }}>— área reservada para funcionalidades futuras</span>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 32, padding: 20 }}>
        {(["Cronômetro", "Agenda", "Efeitos", "Scriptura"] as const).map((label, index) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.18 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, border: "1px dashed #555", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5">
                {index === 0 && <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>}
                {index === 1 && <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>}
                {index === 2 && <><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></>}
                {index === 3 && <><path d="M4 19V5a2 2 0 012-2h13" /><path d="M8 21h12a1 1 0 001-1V7" /></>}
              </svg>
            </div>
            <span style={{ fontSize: 9, color: "#666", letterSpacing: 0.5 }}>{label}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
