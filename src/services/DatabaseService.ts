import SqliteWorker from '../workers/sqlite.worker?worker';

export interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video" | "audio" | "slide" | "music" | "sequence" | "collection" | "tempo" | "arquivo";
  content?: string;
  duration?: string;
  artist?: string;
  lyrics?: string;
}

export class DatabaseService {
  private static worker: Worker | null = null;
  private static resolvers: Map<string, { resolve: (val: any) => void; reject: (err: any) => void }> = new Map();
  private static readyPromise: Promise<void> | null = null;

  private static initWorker(): Promise<void> {
    if (this.readyPromise) return this.readyPromise;

    this.readyPromise = new Promise((resolve, reject) => {
      // @ts-ignore
      this.worker = new SqliteWorker();
      this.worker!.onmessage = (e) => {
        const { type, id, error, result } = e.data;
        if (type === 'ready') {
          resolve();
        } else if (type === 'error') {
          reject(new Error(error));
        } else if (id && this.resolvers.has(id)) {
          const { resolve: res, reject: rej } = this.resolvers.get(id)!;
          this.resolvers.delete(id);
          if (error) rej(new Error(error));
          else res(result);
        }
      };
      
      this.worker!.onerror = (err) => {
        reject(err);
      };
    });

    return this.readyPromise;
  }

  private static async execute<T>(action: string, payload?: any): Promise<T> {
    await this.initWorker();
    return new Promise((resolve, reject) => {
      const id = String(Date.now()) + Math.random();
      this.resolvers.set(id, { resolve, reject });
      this.worker!.postMessage({ id, action, payload });
    });
  }

  /**
   * Obtém a lista de todas as mídias (agora do SQLite persistente)
   */
  public static async getMediaList(): Promise<MediaItem[]> {
    return this.execute<MediaItem[]>('getAllSongs');
  }

  /**
   * Busca músicas usando Full-Text Search (FTS5)
   */
  public static async searchSongs(query: string): Promise<MediaItem[]> {
    if (!query.trim()) {
      return this.getMediaList();
    }
    return this.execute<MediaItem[]>('searchSongs', { query });
  }

  /**
   * Salva uma nova mídia (ou música) no banco de dados SQLite.
   */
  public static async addMedia(item: Omit<MediaItem, "id">): Promise<MediaItem> {
    const newItem: MediaItem = {
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    };
    await this.execute('addSong', newItem);
    return newItem;
  }

  /**
   * Remove uma música.
   */
  public static async deleteMedia(id: string): Promise<boolean> {
    return this.execute<boolean>('deleteSong', { id });
  }

  /**
   * Obtém absolutamente todas as colunas de todas as músicas para fins de debug/inspeção.
   */
  public static async debugGetAll(): Promise<any[]> {
    return this.execute<any[]>('debugGetAll');
  }

  /**
   * Executa uma query SQL direta no banco de dados SQLite (ferramenta avançada de debug).
   */
  public static async runRawQuery(sql: string, bind?: any[]): Promise<any[]> {
    return this.execute<any[]>('runRawQuery', { sql, bind });
  }
}
