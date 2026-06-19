import type React from "react";
import { Panel } from "react-resizable-panels";
import type { MediaItem } from "../services/DatabaseService";
import { Screen } from "./MediaPreview";

type MonitorsPanelProps = {
  isTransitioning: boolean;
  playback: number;
  previewMedia: MediaItem | null;
  programMedia: MediaItem | null;
  transitionProgress: number;
  onClearProgram: () => void;
  onCut: () => void;
  onFade: () => void;
};

function MonitorFrame({ children, label, actions }: { children: React.ReactNode; label: string; actions?: React.ReactNode }) {
  return (
    <div style={{ flex: 1, alignSelf: "stretch", display: "flex", flexDirection: "column", minWidth: 0, justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#888" }}>
          {label}
        </span>
        {actions}
      </div>
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
          {children}
        </div>
      </div>
    </div>
  );
}

export function MonitorsPanel({
  isTransitioning,
  playback,
  previewMedia,
  programMedia,
  transitionProgress,
  onClearProgram,
  onCut,
  onFade,
}: MonitorsPanelProps) {
  return (
    <Panel id="monitors-panel" defaultSize={50} minSize={30}
      style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: "#27272A" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "row", alignItems: "center", padding: "14px 16px", gap: 14, overflow: "hidden" }}>
        <MonitorFrame label="PREVIEW">
          <Screen item={previewMedia} playback={playback} />
        </MonitorFrame>

        <div style={{ width: 72, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          <button onClick={onFade} disabled={isTransitioning}
            style={{
              width: "100%", padding: "11px 0",
              background: isTransitioning ? "#065f46" : "#10B981",
              border: "none", borderRadius: 6, color: isTransitioning ? "#888" : "black", fontWeight: 800, fontSize: 11, letterSpacing: 1,
              cursor: isTransitioning ? "not-allowed" : "pointer"
            }}>
            Play
          </button>
          <button onClick={onCut} disabled={isTransitioning}
            style={{
              width: "100%", padding: "11px 0", background: "#3F3F46",
              border: "1px solid #52525B", borderRadius: 6, color: "white", fontWeight: 800, fontSize: 11, letterSpacing: 1,
              cursor: isTransitioning ? "not-allowed" : "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.5)"
            }}>
            CUT
          </button>
        </div>

        <MonitorFrame
          label="PROGRAM"
          actions={(
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={onClearProgram}
                style={{ background: "#585858", borderRadius: 6, border: "none", color: "#ffffff", fontSize: 9, cursor: "pointer", padding: "4px 8px", fontWeight: "bold" }}>
                FTB
              </button>
              <button onClick={onClearProgram}
                style={{ background: "#585858", borderRadius: 6, border: "none", color: "#ffffff", fontSize: 9, cursor: "pointer", padding: "4px 8px", fontWeight: "bold" }}>
                LIMPAR
              </button>
            </div>
          )}
        >
          <Screen item={programMedia} playback={playback} />
          {(isTransitioning || transitionProgress > 0) && previewMedia && (
            <div style={{ position: "absolute", inset: 0, opacity: transitionProgress / 100, zIndex: 5, overflow: "hidden" }}>
              <Screen item={previewMedia} playback={playback} />
            </div>
          )}
        </MonitorFrame>
      </div>
    </Panel>
  );
}
