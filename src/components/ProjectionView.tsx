import type { MediaItem } from "../services/DatabaseService";
import { Screen } from "./MediaPreview";

type ProjectionViewProps = {
  testText: string;
  media: MediaItem | null;
  playback: number;
};

export function ProjectionView({ testText, media, playback }: ProjectionViewProps) {
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
        <Screen item={media} playback={playback} />
      )}
    </div>
  );
}
