import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

let db: any;

const initSchema = () => {
  // Garante que a tabela songs existe para compatibilidade com a lista de mídias da UI
  db.exec(`
    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      artist TEXT NOT NULL DEFAULT '',
      lyrics TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      type TEXT,
      content TEXT,
      duration TEXT
    );
  `);

  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS songs_fts USING fts5(
      title, artist, lyrics, content='songs'
    );
  `);

  db.exec(`CREATE TRIGGER IF NOT EXISTS songs_ai AFTER INSERT ON songs BEGIN
    INSERT INTO songs_fts(rowid, title, artist, lyrics)
    VALUES (new.rowid, new.title, new.artist, new.lyrics);
  END;`);

  db.exec(`CREATE TRIGGER IF NOT EXISTS songs_ad AFTER DELETE ON songs BEGIN
    INSERT INTO songs_fts(songs_fts, rowid, title, artist, lyrics)
    VALUES ('delete', old.rowid, old.title, old.artist, old.lyrics);
  END;`);

  db.exec(`CREATE TRIGGER IF NOT EXISTS songs_au AFTER UPDATE ON songs BEGIN
    INSERT INTO songs_fts(songs_fts, rowid, title, artist, lyrics)
    VALUES ('delete', old.rowid, old.title, old.artist, old.lyrics);
    INSERT INTO songs_fts(rowid, title, artist, lyrics)
    VALUES (new.rowid, new.title, new.artist, new.lyrics);
  END;`);
};

const initDb = async () => {
  try {
    const sqlite3 = await sqlite3InitModule();

    if ('opfs' in sqlite3) {
      db = new sqlite3.oo1.OpfsDb('/stagevision.sqlite3');
      console.log('OPFS DB opened (persistente)');
    } else {
      db = new sqlite3.oo1.DB('/stagevision.sqlite3', 'ct');
      console.log('Transient DB opened (sem OPFS)');
    }

    initSchema();
    self.postMessage({ type: 'ready' });
  } catch (err: any) {
    console.error('Error initializing SQLite:', err.message);
    self.postMessage({ type: 'error', error: err.message });
  }
};

initDb();

// ─── Helper: lista de tabelas de usuário (sem sistema e sem FTS) ──────────────
const getUserTables = (): string[] => {
  const rows = db.exec({
    sql: `SELECT name FROM sqlite_master
          WHERE type='table'
            AND name NOT LIKE 'sqlite_%'
            AND name NOT LIKE '%_fts%'
          ORDER BY name`,
    rowMode: 'object'
  });
  return rows.map((r: any) => r.name);
};

self.onmessage = (e) => {
  const { id, action, payload } = e.data;

  if (!db) {
    self.postMessage({ id, error: 'Database not ready' });
    return;
  }

  try {

    // ══ LEGACY: lista para a UI principal ════════════════════════════════════
    if (action === 'getAllSongs') {
      const rows = db.exec({
        sql: "SELECT id, title as name, type, content, duration FROM songs ORDER BY created_at ASC",
        rowMode: 'object'
      });
      self.postMessage({ id, result: rows });
    }

    // ══ LEGACY: busca FTS ════════════════════════════════════════════════════
    else if (action === 'searchSongs') {
      const q = payload.query;
      const sql = `
        SELECT s.id, s.title as name, s.type, s.content, s.duration
        FROM songs_fts f
        JOIN songs s ON f.rowid = s.rowid
        WHERE songs_fts MATCH ? ORDER BY rank LIMIT 50`;
      const terms = q.trim().split(/\s+/).map((w: string) => `"${w}"*`).join(' ');
      const rows = db.exec({ sql, bind: [terms], rowMode: 'object' });
      self.postMessage({ id, result: rows });
    }

    // ══ LEGACY: add song ═════════════════════════════════════════════════════
    else if (action === 'addSong') {
      db.exec({
        sql: "INSERT INTO songs (id, title, artist, type, content, duration, lyrics) VALUES (?, ?, ?, ?, ?, ?, ?)",
        bind: [
          payload.id,
          payload.name || payload.title,
          payload.artist || '',
          payload.type,
          payload.content || null,
          payload.duration || null,
          payload.lyrics || ''
        ]
      });
      self.postMessage({ id, result: payload });
    }

    // ══ LEGACY: update song ══════════════════════════════════════════════════
    else if (action === 'updateSong') {
      db.exec({
        sql: `UPDATE songs SET title=?, artist=?, type=?, content=?, duration=?, lyrics=? WHERE id=?`,
        bind: [
          payload.name || payload.title,
          payload.artist || '',
          payload.type,
          payload.content || null,
          payload.duration || null,
          payload.lyrics || '',
          payload.id
        ]
      });
      self.postMessage({ id, result: true });
    }

    // ══ LEGACY: delete song ══════════════════════════════════════════════════
    else if (action === 'deleteSong') {
      db.exec({ sql: "DELETE FROM songs WHERE id = ?", bind: [payload.id] });
      self.postMessage({ id, result: true });
    }

    // ══ LEGACY: debug get all ════════════════════════════════════════════════
    else if (action === 'debugGetAll') {
      const rows = db.exec({ sql: "SELECT * FROM songs ORDER BY created_at ASC", rowMode: 'object' });
      self.postMessage({ id, result: rows });
    }

    // ══ ADMIN: lista de tabelas com contagem ══════════════════════════════════
    else if (action === 'getTables') {
      const names = getUserTables();
      const result = names.map((name: string) => {
        try {
          const count = db.exec({ sql: `SELECT COUNT(*) as c FROM "${name}"`, rowMode: 'object' });
          return { name, rowCount: count[0]?.c ?? 0 };
        } catch {
          return { name, rowCount: 0 };
        }
      });
      self.postMessage({ id, result });
    }

    // ══ ADMIN: schema de uma tabela (PRAGMA table_info) ════════════════════════
    else if (action === 'getTableSchema') {
      const rows = db.exec({ sql: `PRAGMA table_info("${payload.table}")`, rowMode: 'object' });
      self.postMessage({ id, result: rows });
    }

    // ══ ADMIN: dados de uma tabela ════════════════════════════════════════════
    else if (action === 'getTableData') {
      const limit = payload.limit || 200;
      const offset = payload.offset || 0;
      const rows = db.exec({
        sql: `SELECT rowid as __rowid__, * FROM "${payload.table}" LIMIT ${limit} OFFSET ${offset}`,
        rowMode: 'object'
      });
      self.postMessage({ id, result: rows });
    }

    // ══ ADMIN: criar tabela ════════════════════════════════════════════════════
    else if (action === 'createTable') {
      const cols: any[] = payload.columns;
      const pkCols = cols.filter((c: any) => c.pk);
      const colDefs = cols.map((c: any) => {
        let def = `"${c.name}" ${c.type}`;
        if (c.notnull && !c.pk) def += ' NOT NULL';
        if (c.defaultValue !== undefined && c.defaultValue !== '') def += ` DEFAULT '${c.defaultValue}'`;
        if (pkCols.length === 1 && c.pk) def += ' PRIMARY KEY';
        return def;
      });
      if (pkCols.length > 1) {
        colDefs.push(`PRIMARY KEY (${pkCols.map((c: any) => `"${c.name}"`).join(', ')})`);
      }
      const sql = `CREATE TABLE "${payload.name}" (${colDefs.join(', ')})`;
      db.exec(sql);
      self.postMessage({ id, result: true });
    }

    // ══ ADMIN: deletar tabela ═════════════════════════════════════════════════
    else if (action === 'dropTable') {
      db.exec(`DROP TABLE IF EXISTS "${payload.table}"`);
      self.postMessage({ id, result: true });
    }

    // ══ ADMIN: adicionar coluna ════════════════════════════════════════════════
    else if (action === 'addColumn') {
      const c = payload.column;
      let sql = `ALTER TABLE "${payload.table}" ADD COLUMN "${c.name}" ${c.type}`;
      if (c.defaultValue !== undefined && c.defaultValue !== '') {
        sql += ` DEFAULT '${c.defaultValue}'`;
      }
      db.exec(sql);
      self.postMessage({ id, result: true });
    }

    // ══ ADMIN: inserir linha ══════════════════════════════════════════════════
    else if (action === 'insertRow') {
      const cols = Object.keys(payload.values);
      const vals = cols.map((c: string) => payload.values[c] === '' ? null : payload.values[c]);
      if (cols.length === 0) {
        self.postMessage({ id, error: 'Nenhum valor para inserir' });
        return;
      }
      db.exec({
        sql: `INSERT INTO "${payload.table}" (${cols.map((c: string) => `"${c}"`).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
        bind: vals
      });
      self.postMessage({ id, result: true });
    }

    // ══ ADMIN: atualizar linha por rowid ══════════════════════════════════════
    else if (action === 'updateRow') {
      const cols = Object.keys(payload.values);
      const vals = cols.map((c: string) => payload.values[c] === '' ? null : payload.values[c]);
      db.exec({
        sql: `UPDATE "${payload.table}" SET ${cols.map((c: string) => `"${c}" = ?`).join(', ')} WHERE rowid = ?`,
        bind: [...vals, payload.rowid]
      });
      self.postMessage({ id, result: true });
    }

    // ══ ADMIN: deletar linha por rowid ════════════════════════════════════════
    else if (action === 'deleteRow') {
      db.exec({ sql: `DELETE FROM "${payload.table}" WHERE rowid = ?`, bind: [payload.rowid] });
      self.postMessage({ id, result: true });
    }

    // ══ ADMIN: resetar banco (apaga todas as tabelas do usuário) ═════════════
    else if (action === 'resetDatabase') {
      const names = getUserTables();
      // Apaga FTS e triggers ligados antes das tabelas principais
      db.exec(`DROP TRIGGER IF EXISTS songs_ai`);
      db.exec(`DROP TRIGGER IF EXISTS songs_ad`);
      db.exec(`DROP TRIGGER IF EXISTS songs_au`);
      db.exec(`DROP TABLE IF EXISTS songs_fts`);
      for (const name of names) {
        db.exec(`DROP TABLE IF EXISTS "${name}"`);
      }
      self.postMessage({ id, result: true });
    }

    // ══ ADMIN / DEBUG: query SQL livre ═══════════════════════════════════════
    else if (action === 'runRawQuery') {
      const execOpts: any = { sql: payload.sql, rowMode: 'object' };
      if (payload.bind && payload.bind.length > 0) execOpts.bind = payload.bind;
      const rows = db.exec(execOpts);
      self.postMessage({ id, result: rows ?? [] });
    }

    else {
      self.postMessage({ id, error: `Ação desconhecida: ${action}` });
    }

  } catch (err: any) {
    self.postMessage({ id, error: err.message });
  }
};
