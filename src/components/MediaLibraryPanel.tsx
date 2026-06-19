import type React from "react";
import { Panel } from "react-resizable-panels";
import type { MediaItem } from "../services/DatabaseService";
import { Icon } from "./MediaPreview";

type MediaCategory = "all" | MediaItem["type"];

type MediaLibraryPanelProps = {
  activeCategory: MediaCategory;
  filteredMedia: MediaItem[];
  menuOpenId: string | null;
  newMediaContent: string;
  newMediaName: string;
  newMediaType: MediaItem["type"];
  searchQuery: string;
  showAddDropdown: boolean;
  showAddForm: boolean;
  onAddMedia: (event: React.FormEvent) => void;
  onDeleteMedia: (id: string, event: React.MouseEvent) => void;
  onSelectMedia: (item: MediaItem) => void;
  onSetActiveCategory: (category: MediaCategory) => void;
  onSetMenuOpenId: (id: string | null) => void;
  onSetNewMediaContent: (value: string) => void;
  onSetNewMediaName: (value: string) => void;
  onSetNewMediaType: (type: MediaItem["type"]) => void;
  onSetSearchQuery: (value: string) => void;
  onSetShowAddDropdown: (value: boolean) => void;
  onSetShowAddForm: (value: boolean) => void;
  onTriggerFileImport: () => void;
};

const categories: readonly MediaCategory[] = ["all", "image", "video", "slide", "audio", "music", "sequence", "collection", "tempo", "arquivo"];

const categoryLabels: Record<MediaCategory, string> = {
  all: "TODOS",
  image: "IMAGEM",
  video: "VÍDEO",
  slide: "SLIDE",
  audio: "ÁUDIO",
  music: "LETRAS",
  sequence: "SEQUÊNCIA",
  collection: "COLEÇÃO",
  tempo: "TEMPO",
  arquivo: "ARQUIVO",
};

export function MediaLibraryPanel({
  activeCategory,
  filteredMedia,
  menuOpenId,
  newMediaContent,
  newMediaName,
  newMediaType,
  searchQuery,
  showAddDropdown,
  showAddForm,
  onAddMedia,
  onDeleteMedia,
  onSelectMedia,
  onSetActiveCategory,
  onSetMenuOpenId,
  onSetNewMediaContent,
  onSetNewMediaName,
  onSetNewMediaType,
  onSetSearchQuery,
  onSetShowAddDropdown,
  onSetShowAddForm,
  onTriggerFileImport,
}: MediaLibraryPanelProps) {
  return (
    <Panel id="library-panel" defaultSize={25} minSize={10}
      style={{ background: "#27272A", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "10px 13px", borderBottom: "1px solid #3F3F46", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#aaa", fontWeight: 700 }}>Biblioteca</span>
        </div>

        <div style={{ position: "relative", display: "flex", alignItems: "center", zIndex: 50 }}>
          {showAddForm ? (
            <button
              onClick={() => onSetShowAddForm(false)}
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
                onClick={onTriggerFileImport}
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
                onClick={(event) => {
                  event.stopPropagation();
                  onSetShowAddDropdown(!showAddDropdown);
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

          {showAddDropdown && !showAddForm && (
            <>
              <div
                onClick={() => onSetShowAddDropdown(false)}
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
                        onTriggerFileImport();
                      } else {
                        onSetNewMediaType(opt.type as MediaItem["type"]);
                        onSetShowAddForm(true);
                      }
                      onSetShowAddDropdown(false);
                    }}
                    style={{
                      background: "transparent", border: "none", color: "#e4e4e7",
                      textAlign: "left", padding: "8px 12px", fontSize: 11,
                      cursor: "pointer", transition: "background 0.15s"
                    }}
                    onMouseEnter={(event) => event.currentTarget.style.background = "#52525B"}
                    onMouseLeave={(event) => event.currentTarget.style.background = "transparent"}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={onAddMedia} style={{ padding: 9, background: "#3F3F46", borderBottom: "1px solid #52525B", flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          <input value={newMediaName} onChange={event => onSetNewMediaName(event.target.value)} placeholder="Nome" required
            style={{ padding: "4px 7px", fontSize: 10, background: "#27272A", border: "1px solid #52525B", borderRadius: 4, color: "white", outline: "none", width: "100%" }} />
          <select value={newMediaType} onChange={event => onSetNewMediaType(event.target.value as MediaItem["type"])}
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
            <textarea value={newMediaContent} onChange={event => onSetNewMediaContent(event.target.value)}
              placeholder={newMediaType === "slide" ? "Texto..." : "URL da imagem"}
              style={{ padding: "4px 7px", fontSize: 10, background: "#27272A", border: "1px solid #52525B", borderRadius: 4, color: "white", outline: "none", resize: "none", height: 40, width: "100%" }} />
          )}
          <button type="submit" style={{ padding: "5px 0", background: "#10B981", border: "none", color: "black", borderRadius: 4, cursor: "pointer", fontSize: 10, fontWeight: 800 }}>
            ADICIONAR
          </button>
        </form>
      )}

      <div style={{ padding: "6px 8px", background: "#27272A", borderBottom: "1px solid #3F3F46", flexShrink: 0 }}>
        <input
          type="text"
          value={searchQuery}
          onChange={event => onSetSearchQuery(event.target.value)}
          placeholder="Buscar na biblioteca (FTS5)..."
          style={{ width: "100%", padding: "5px 8px", fontSize: 10, background: "#3F3F46", border: "1px solid #52525B", borderRadius: 4, color: "white", outline: "none" }}
        />
      </div>

      <div style={{ display: "flex", gap: 3, padding: "6px 8px", overflowX: "auto", flexShrink: 0, borderBottom: "1px solid #3F3F46", background: "#18181B" }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => onSetActiveCategory(cat)}
            style={{
              padding: "3px 7px", fontSize: 8, fontWeight: 700, textTransform: "uppercase", borderRadius: 10, border: "none", cursor: "pointer", flexShrink: 0,
              background: activeCategory === cat ? "#10B981" : "#3F3F46",
              color: activeCategory === cat ? "black" : "#aaa", transition: "all 0.15s"
            }}>
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      <div style={{ overflowY: "auto", flex: 1, padding: 7, display: "flex", flexDirection: "column", gap: 4 }}>
        {filteredMedia.length > 0 ? filteredMedia.map(item => (
          <div key={item.id} onClick={() => onSelectMedia(item)} className="media-item"
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

              <div style={{ position: "relative" }} onClick={(event) => event.stopPropagation()}>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onSetMenuOpenId(menuOpenId === item.id ? null : item.id);
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
                    <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={(event) => { event.stopPropagation(); onSetMenuOpenId(null); }} />
                    <div style={{
                      position: "absolute", top: "100%", right: 0, marginTop: 4,
                      background: "#3F3F46", border: "1px solid #52525B", borderRadius: 6,
                      padding: "4px", boxShadow: "0 4px 12px rgba(0,0,0,0.5)", zIndex: 999,
                      minWidth: 100
                    }}>
                      <button
                        onClick={(event) => onDeleteMedia(item.id, event)}
                        style={{
                          width: "100%", background: "transparent", border: "none", color: "#ef4444",
                          textAlign: "left", padding: "6px 12px", fontSize: 11,
                          cursor: "pointer", borderRadius: 4, display: "flex", alignItems: "center", gap: 6
                        }}
                        onMouseEnter={(event) => event.currentTarget.style.background = "#52525B"}
                        onMouseLeave={(event) => event.currentTarget.style.background = "transparent"}
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
        )) : (
          <div style={{ padding: 20, color: "#333", textAlign: "center", fontSize: 10 }}>Vazio</div>
        )}
      </div>
    </Panel>
  );
}
