import SqliteWorker from '../workers/sqlite.worker?worker';

export interface MediaItem {
  id: string;
  name: string;
  title?: string;
  type: "image" | "video" | "audio" | "slide" | "music" | "sequence" | "collection" | "tempo" | "arquivo";
  content?: string;
  duration?: string;
  artist?: string;
  lyrics?: string;
  created_at?: string;
}

export interface DbTable {
  name: string;
  rowCount: number;
}

export interface DbColumn {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
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
      this.worker!.onerror = (err) => reject(err);
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

  // ── Legacy: mídias para a UI principal ──────────────────────────────────────
  public static async getMediaList(): Promise<MediaItem[]> {
    return this.execute<MediaItem[]>('getAllSongs');
  }

  public static async searchSongs(query: string): Promise<MediaItem[]> {
    if (!query.trim()) return this.getMediaList();
    return this.execute<MediaItem[]>('searchSongs', { query });
  }

  public static async addMedia(item: Omit<MediaItem, 'id'>): Promise<MediaItem> {
    const newItem: MediaItem = {
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    };
    await this.execute('addSong', newItem);
    return newItem;
  }

  public static async updateMedia(item: MediaItem): Promise<boolean> {
    return this.execute<boolean>('updateSong', item);
  }

  public static async deleteMedia(id: string): Promise<boolean> {
    return this.execute<boolean>('deleteSong', { id });
  }

  public static async debugGetAll(): Promise<any[]> {
    return this.execute<any[]>('debugGetAll');
  }

  public static async runRawQuery(sql: string, bind?: any[]): Promise<any[]> {
    return this.execute<any[]>('runRawQuery', {
      sql,
      bind: bind && bind.length > 0 ? bind : undefined
    });
  }

  // ── Admin: gerenciamento de tabelas ─────────────────────────────────────────
  public static async getTables(): Promise<DbTable[]> {
    return this.execute<DbTable[]>('getTables');
  }

  public static async getTableSchema(table: string): Promise<DbColumn[]> {
    return this.execute<DbColumn[]>('getTableSchema', { table });
  }

  public static async getTableData(table: string, limit = 200, offset = 0): Promise<any[]> {
    return this.execute<any[]>('getTableData', { table, limit, offset });
  }

  public static async createTable(name: string, columns: {
    name: string; type: string; pk: boolean; notnull: boolean; defaultValue?: string;
  }[]): Promise<boolean> {
    return this.execute<boolean>('createTable', { name, columns });
  }

  public static async dropTable(table: string): Promise<boolean> {
    return this.execute<boolean>('dropTable', { table });
  }

  public static async addColumn(table: string, column: {
    name: string; type: string; notnull?: boolean; defaultValue?: string;
  }): Promise<boolean> {
    return this.execute<boolean>('addColumn', { table, column });
  }

  public static async insertRow(table: string, values: Record<string, string>): Promise<boolean> {
    return this.execute<boolean>('insertRow', { table, values });
  }

  public static async updateRow(table: string, rowid: number, values: Record<string, string>): Promise<boolean> {
    return this.execute<boolean>('updateRow', { table, rowid, values });
  }

  public static async deleteRow(table: string, rowid: number): Promise<boolean> {
    return this.execute<boolean>('deleteRow', { table, rowid });
  }

  public static async resetDatabase(): Promise<boolean> {
    return this.execute<boolean>('resetDatabase');
  }
}
