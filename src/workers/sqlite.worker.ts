import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

let db: any;

// Helper to execute simple inserts with FTS
const initSchema = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      lyrics TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      type TEXT,
      content TEXT,
      duration TEXT
    );
  `);

  // Recreate FTS tables to fix schema mismatch
  db.exec(`DROP TRIGGER IF EXISTS songs_ai;`);
  db.exec(`DROP TRIGGER IF EXISTS songs_ad;`);
  db.exec(`DROP TRIGGER IF EXISTS songs_au;`);
  db.exec(`DROP TABLE IF EXISTS songs_fts;`);

  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS songs_fts USING fts5(
      title, 
      artist, 
      lyrics, 
      content='songs'
    );
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS songs_ai AFTER INSERT ON songs BEGIN
      INSERT INTO songs_fts(rowid, title, artist, lyrics) 
      VALUES (new.rowid, new.title, new.artist, new.lyrics);
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS songs_ad AFTER DELETE ON songs BEGIN
      INSERT INTO songs_fts(songs_fts, rowid, title, artist, lyrics) 
      VALUES ('delete', old.rowid, old.title, old.artist, old.lyrics);
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS songs_au AFTER UPDATE ON songs BEGIN
      INSERT INTO songs_fts(songs_fts, rowid, title, artist, lyrics) 
      VALUES ('delete', old.rowid, old.title, old.artist, old.lyrics);
      INSERT INTO songs_fts(rowid, title, artist, lyrics) 
      VALUES (new.rowid, new.title, new.artist, new.lyrics);
    END;
  `);
};

const insertMockDataIfNeeded = () => {
  // Inicialização 100% limpa a pedido do usuário
  try {
    db.exec("DELETE FROM songs WHERE id IN ('1', '2', '3', '4', '5')");
  } catch (e) {
    console.error("Erro ao limpar mocks antigos:", e);
  }
};

const initDb = async () => {
  try {
    const sqlite3 = await sqlite3InitModule();
    
    if ('opfs' in sqlite3) {
      db = new sqlite3.oo1.OpfsDb('/stagevision.sqlite3');
      console.log('OPFS DB opened');
    } else {
      db = new sqlite3.oo1.DB('/stagevision.sqlite3', 'ct');
      console.log('Transient DB opened');
    }

    initSchema();
    insertMockDataIfNeeded();
    
    self.postMessage({ type: 'ready' });
  } catch (err: any) {
    console.error('Error initializing SQLite:', err.message);
    self.postMessage({ type: 'error', error: err.message });
  }
};

initDb();

self.onmessage = (e) => {
  const { id, action, payload } = e.data;
  
  if (!db) {
    self.postMessage({ id, error: 'Database not ready' });
    return;
  }

  try {
    if (action === 'getAllSongs') {
      const rows = db.exec({
        sql: "SELECT id, title as name, type, content, duration FROM songs ORDER BY created_at ASC",
        rowMode: 'object'
      });
      self.postMessage({ id, result: rows });
    } 
    else if (action === 'debugGetAll') {
      const rows = db.exec({
        sql: "SELECT * FROM songs ORDER BY created_at ASC",
        rowMode: 'object'
      });
      self.postMessage({ id, result: rows });
    }
    else if (action === 'runRawQuery') {
      const rows = db.exec({
        sql: payload.sql,
        bind: payload.bind || [],
        rowMode: 'object'
      });
      self.postMessage({ id, result: rows });
    }
    else if (action === 'addSong') {
      db.exec({
        sql: "INSERT INTO songs (id, title, artist, type, content, duration, lyrics) VALUES (?, ?, ?, ?, ?, ?, ?)",
        bind: [payload.id, payload.name, payload.artist || '', payload.type, payload.content || null, payload.duration || null, payload.lyrics || '']
      });
      self.postMessage({ id, result: payload });
    }
    else if (action === 'searchSongs') {
      const q = payload.query;
      // MATCH clause in FTS5
      // To match prefixes we can append * to the query terms, but for simplicity let's just use it directly or wrapped in double quotes
      // e.g. MATCH '"' || ? || '" *'
      // Wait, let's keep it robust:
      let sql = `
        SELECT s.id, s.title as name, s.type, s.content, s.duration 
        FROM songs_fts f
        JOIN songs s ON f.rowid = s.rowid
        WHERE songs_fts MATCH ? 
        ORDER BY rank LIMIT 50
      `;
      // We will map simple words to a prefix query: 'word1* word2*'
      const terms = q.trim().split(/\s+/).map((w: string) => `"${w}"*`).join(' ');
      
      const rows = db.exec({
        sql,
        bind: [terms],
        rowMode: 'object'
      });
      self.postMessage({ id, result: rows });
    }
    else if (action === 'deleteSong') {
      db.exec({
        sql: "DELETE FROM songs WHERE id = ?",
        bind: [payload.id]
      });
      self.postMessage({ id, result: true });
    }
  } catch (err: any) {
    self.postMessage({ id, error: err.message });
  }
};
