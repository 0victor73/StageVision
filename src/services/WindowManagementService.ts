import type { MediaItem } from "./DatabaseService";

export interface IPCMessage {
  action: "update_media" | "update_text";
  payload: any;
}

export class WindowManagementService {
  private static CHANNEL_NAME = "stagevision-ipc";
  private static channel: BroadcastChannel | null = null;

  /**
   * Obtém ou inicializa o canal de comunicação IPC.
   */
  public static getChannel(): BroadcastChannel {
    if (!this.channel) {
      this.channel = new BroadcastChannel(this.CHANNEL_NAME);
    }
    return this.channel;
  }

  /**
   * Fecha o canal de comunicação IPC.
   */
  public static closeChannel(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }

  /**
   * Abre a janela de projeção secundária.
   */
  public static openProjectionWindow(): Window | null {
    const w = window.open(
      window.location.origin + "?projection=true",
      "StageVisionProjection",
      "width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no"
    );

    // Envia um payload de teste após abrir para confirmar a conexão
    setTimeout(() => {
      this.sendText("Olá, Telão");
    }, 1000);

    return w;
  }

  /**
   * Envia uma mídia ativa para a projeção.
   */
  public static sendMedia(media: MediaItem | null): void {
    const channel = this.getChannel();
    channel.postMessage({ action: "update_media", payload: media });
  }

  /**
   * Envia um texto de teste para a projeção.
   */
  public static sendText(text: string): void {
    const channel = this.getChannel();
    channel.postMessage({ action: "update_text", payload: text });
  }
}
