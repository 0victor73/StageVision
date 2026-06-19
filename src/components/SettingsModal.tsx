import React from "react";
import { DatabaseService } from "../services/DatabaseService";

type StateSetter<T> = React.Dispatch<React.SetStateAction<T>>;

type DbNewTableCol = {
  name: string;
  type: string;
  pk: boolean;
  notnull: boolean;
};

type SettingsModalProps = {
  activeSettingsTab: string;
  setActiveSettingsTab: StateSetter<string>;
  setIsSettingsOpen: StateSetter<boolean>;
  dbTables: any[];
  dbSelectedTable: string | null;
  dbSchema: any[];
  dbData: any[];
  dbAdminTab: any;
  rawQueryText: string;
  rawQueryResult: any[] | null;
  rawQueryError: string | null;
  dbShowCreateTable: boolean;
  dbNewTableName: string;
  dbNewTableCols: DbNewTableCol[];
  dbShowAddCol: boolean;
  dbNewColName: string;
  dbNewColType: string;
  dbNewColNotnull: boolean;
  dbNewColDefault: string;
  dbEditingRowid: number | null;
  dbEditValues: Record<string, string>;
  dbShowAddRow: boolean;
  dbNewRowValues: Record<string, string>;
  setDbTables: any;
  setDbSelectedTable: StateSetter<string | null>;
  setDbSchema: StateSetter<any[]>;
  setDbData: StateSetter<any[]>;
  setDbAdminTab: StateSetter<"schema" | "data" | "sql">;
  setRawQueryText: StateSetter<string>;
  setRawQueryResult: StateSetter<any[] | null>;
  setRawQueryError: StateSetter<string | null>;
  setDbShowCreateTable: StateSetter<boolean>;
  setDbNewTableName: StateSetter<string>;
  setDbNewTableCols: StateSetter<DbNewTableCol[]>;
  setDbShowAddCol: StateSetter<boolean>;
  setDbNewColName: StateSetter<string>;
  setDbNewColType: StateSetter<string>;
  setDbNewColNotnull: StateSetter<boolean>;
  setDbNewColDefault: StateSetter<string>;
  setDbEditingRowid: StateSetter<number | null>;
  setDbEditValues: StateSetter<Record<string, string>>;
  setDbShowAddRow: StateSetter<boolean>;
  setDbNewRowValues: StateSetter<Record<string, string>>;
  loadDbTables: () => Promise<void>;
  refreshTableData: (tableName?: string) => Promise<void>;
  selectTable: (name: string) => Promise<void>;
};

export function SettingsModal({
  activeSettingsTab,
  setActiveSettingsTab,
  setIsSettingsOpen,
  dbTables,
  dbSelectedTable,
  dbSchema,
  dbData,
  dbAdminTab,
  rawQueryText,
  rawQueryResult,
  rawQueryError,
  dbShowCreateTable,
  dbNewTableName,
  dbNewTableCols,
  dbShowAddCol,
  dbNewColName,
  dbNewColType,
  dbNewColNotnull,
  dbNewColDefault,
  dbEditingRowid,
  dbEditValues,
  dbShowAddRow,
  dbNewRowValues,
  setDbTables,
  setDbSelectedTable,
  setDbSchema,
  setDbData,
  setDbAdminTab,
  setRawQueryText,
  setRawQueryResult,
  setRawQueryError,
  setDbShowCreateTable,
  setDbNewTableName,
  setDbNewTableCols,
  setDbShowAddCol,
  setDbNewColName,
  setDbNewColType,
  setDbNewColNotnull,
  setDbNewColDefault,
  setDbEditingRowid,
  setDbEditValues,
  setDbShowAddRow,
  setDbNewRowValues,
  loadDbTables,
  refreshTableData,
  selectTable,
}: SettingsModalProps) {
  void setDbTables;

  return (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0, 0, 0, 0.65)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            width: "85vw", maxWidth: 900, height: "88vh",
            background: "#27272A", borderRadius: 12, border: "1px solid #3F3F46",
            display: "flex", flexDirection: "column", overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
          }}>
            {/* Modal Header */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #3F3F46", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#18181B" }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#eee" }}>Configurações - {activeSettingsTab}</h3>
              <button onClick={() => setIsSettingsOpen(false)} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
              {/* Sidebar */}
              <div style={{ width: 220, background: "#18181B", borderRight: "1px solid #3F3F46", padding: "16px 0", overflowY: "auto" }}>
                {(["Geral", "Conta", "Permissões", "Aparência", "Notificações", "Atalhos", "Banco de Dados", "Avançado"]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveSettingsTab(tab)}
                    style={{
                      width: "100%", textAlign: "left", padding: "8px 24px",
                      background: activeSettingsTab === tab ? "#3F3F46" : "transparent",
                      border: "none", color: activeSettingsTab === tab ? "#10B981" : "#E2E8F0",
                      fontSize: 13, cursor: "pointer", transition: "background 0.2s"
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div style={{ flex: 1, background: "#27272A", padding: activeSettingsTab === "Banco de Dados" ? "16px" : "24px 32px", overflowY: "auto", display: "flex", flexDirection: "column", minHeight: 0 }}>
                {activeSettingsTab !== "Banco de Dados" && (
                  <h4 style={{ margin: "0 0 16px 0", color: "#fff", fontSize: 16, fontWeight: 500 }}>
                    Opções de {activeSettingsTab}
                  </h4>
                )}

                {activeSettingsTab === "Banco de Dados" ? (
                  // ══ DB ADMIN PANEL ════════════════════════════════════════
                  <div style={{ display: "flex", gap: 0, flex: 1, minHeight: 0, height: '100%' }}>

                    {/* ── Coluna Esquerda: lista de tabelas ── */}
                    <div style={{ width: 180, display: "flex", flexDirection: "column", gap: 8, borderRight: "1px solid #3F3F46", paddingRight: 12, marginRight: 16 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "#52525B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>TABELAS ({dbTables.length})</div>
                      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                        {dbTables.length === 0 ? (
                          <div style={{ color: "#52525B", fontSize: 11, textAlign: "center", padding: "20px 0" }}>Nenhuma tabela</div>
                        ) : dbTables.map(t => (
                          <button key={t.name} onClick={() => selectTable(t.name)} style={{
                            background: dbSelectedTable === t.name ? "#3F3F46" : "transparent",
                            border: dbSelectedTable === t.name ? "1px solid #10B981" : "1px solid transparent",
                            borderRadius: 6, padding: "7px 8px", cursor: "pointer",
                            display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", textAlign: "left"
                          }}>
                            <span style={{ fontSize: 12, color: dbSelectedTable === t.name ? "#10B981" : "#E2E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110 }}>{t.name}</span>
                            <span style={{ fontSize: 9, background: "#52525B", color: "#a1a1aa", padding: "1px 5px", borderRadius: 8, flexShrink: 0 }}>{t.rowCount}</span>
                          </button>
                        ))}
                      </div>
                      <button onClick={() => { setDbShowCreateTable(true); setDbSelectedTable(null); setDbNewTableName(''); setDbNewTableCols([{name:'id',type:'TEXT',pk:true,notnull:true}]); }} style={{
                        background: "#10B981", color: "#000", border: "none", borderRadius: 6, padding: "8px",
                        fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4
                      }}>+ Nova Tabela</button>
                      <button onClick={() => { setDbSelectedTable(null); setDbShowCreateTable(false); setDbAdminTab('sql'); setRawQueryResult(null); setRawQueryError(null); }} style={{
                        background: dbAdminTab === 'sql' && !dbSelectedTable && !dbShowCreateTable ? "#3F3F46" : "transparent",
                        color: dbAdminTab === 'sql' && !dbSelectedTable && !dbShowCreateTable ? "#10B981" : "#a1a1aa",
                        border: dbAdminTab === 'sql' && !dbSelectedTable && !dbShowCreateTable ? "1px solid #10B98140" : "1px solid transparent",
                        borderRadius: 6, padding: "8px", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
                        Console SQL
                      </button>
                      <button onClick={async () => {
                        if (confirm("Apagar TODAS as tabelas e dados? Esta ação não pode ser desfeita.")) {
                          await DatabaseService.resetDatabase();
                          setDbSelectedTable(null); setDbSchema([]); setDbData([]);
                          setDbShowCreateTable(false);
                          loadDbTables();
                        }
                      }} style={{ background: "transparent", color: "#ef4444", border: "1px solid #ef444430", borderRadius: 6, padding: "6px", fontSize: 11, cursor: "pointer" }}>
                        ⚠ Resetar DB
                      </button>
                    </div>

                    {/* ── Área Principal ── */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>

                      {/* FORMULÁRIO: Criar nova tabela */}
                      {dbShowCreateTable ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Criar Nova Tabela</span>
                            <button onClick={() => setDbShowCreateTable(false)} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: 18 }}>×</button>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 11, color: "#a1a1aa", width: 80, flexShrink: 0 }}>Nome:</span>
                            <input value={dbNewTableName} onChange={e => setDbNewTableName(e.target.value)}
                              placeholder="nome_da_tabela"
                              style={{ flex: 1, background: "#18181B", border: "1px solid #52525B", borderRadius: 4, padding: "6px 10px", color: "#fff", fontSize: 12, fontFamily: "monospace" }} />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: "#a1a1aa" }}>COLUNAS</span>
                              <button onClick={() => setDbNewTableCols(prev => [...prev, { name: '', type: 'TEXT', pk: false, notnull: false }])} style={{ background: "#3F3F46", border: "1px solid #52525B", color: "#eee", borderRadius: 4, padding: "3px 8px", fontSize: 10, cursor: "pointer" }}>+ Coluna</button>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 50px 60px 28px", gap: "4px 6px", alignItems: "center" }}>
                              <span style={{ fontSize: 9, color: "#555", fontWeight: 700 }}>NOME</span>
                              <span style={{ fontSize: 9, color: "#555", fontWeight: 700 }}>TIPO</span>
                              <span style={{ fontSize: 9, color: "#555", fontWeight: 700, textAlign: "center" }}>PK</span>
                              <span style={{ fontSize: 9, color: "#555", fontWeight: 700, textAlign: "center" }}>NOT NULL</span>
                              <span></span>
                              {dbNewTableCols.map((col, ci) => (
                                <React.Fragment key={ci}>
                                  <input value={col.name} onChange={e => setDbNewTableCols(p => p.map((c, i) => i === ci ? { ...c, name: e.target.value } : c))}
                                    placeholder="nome_coluna"
                                    style={{ background: "#18181B", border: "1px solid #3F3F46", borderRadius: 3, padding: "5px 8px", color: "#fff", fontSize: 11, fontFamily: "monospace" }} />
                                  <select value={col.type} onChange={e => setDbNewTableCols(p => p.map((c, i) => i === ci ? { ...c, type: e.target.value } : c))}
                                    style={{ background: "#18181B", border: "1px solid #3F3F46", borderRadius: 3, padding: "5px 4px", color: "#E2E8F0", fontSize: 11 }}>
                                    {['TEXT','INTEGER','REAL','BLOB','DATETIME','BOOLEAN'].map(t => <option key={t}>{t}</option>)}
                                  </select>
                                  <div style={{ display: "flex", justifyContent: "center" }}>
                                    <input type="checkbox" checked={col.pk} onChange={e => setDbNewTableCols(p => p.map((c, i) => i === ci ? { ...c, pk: e.target.checked } : c))} />
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "center" }}>
                                    <input type="checkbox" checked={col.notnull} onChange={e => setDbNewTableCols(p => p.map((c, i) => i === ci ? { ...c, notnull: e.target.checked } : c))} />
                                  </div>
                                  <button onClick={() => setDbNewTableCols(p => p.filter((_, i) => i !== ci))} disabled={dbNewTableCols.length === 1}
                                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14, padding: 0, opacity: dbNewTableCols.length === 1 ? 0.3 : 1 }}>×</button>
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                          {/* SQL Preview */}
                          {dbNewTableName && dbNewTableCols.some(c => c.name) && (
                            <div style={{ background: "#18181B", border: "1px solid #3F3F46", borderRadius: 4, padding: "8px 12px", fontFamily: "monospace", fontSize: 10, color: "#10B981", whiteSpace: "pre-wrap" }}>
                              {`CREATE TABLE "${dbNewTableName}" (\n${dbNewTableCols.filter(c=>c.name).map(c => `  "${c.name}" ${c.type}${c.pk?' PRIMARY KEY':''}${c.notnull&&!c.pk?' NOT NULL':''}`).join(',\n')}\n);`}
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={async () => {
                              if (!dbNewTableName.trim()) { alert('Informe o nome da tabela'); return; }
                              const validCols = dbNewTableCols.filter(c => c.name.trim());
                              if (validCols.length === 0) { alert('Adicione pelo menos uma coluna'); return; }
                              try {
                                await DatabaseService.createTable(dbNewTableName.trim(), validCols);
                                setDbShowCreateTable(false);
                                await loadDbTables();
                                selectTable(dbNewTableName.trim());
                              } catch(err: any) { alert('Erro: ' + err.message); }
                            }} style={{ background: "#10B981", color: "#000", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                              Criar Tabela
                            </button>
                            <button onClick={() => setDbShowCreateTable(false)} style={{ background: "transparent", border: "1px solid #3F3F46", color: "#888", borderRadius: 6, padding: "8px 16px", fontSize: 12, cursor: "pointer" }}>Cancelar</button>
                          </div>
                        </div>

                      ) : dbSelectedTable ? (
                        // TABELA SELECIONADA
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                          {/* Header da tabela */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                              <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "monospace" }}>{dbSelectedTable}</span>
                              <span style={{ fontSize: 11, color: "#888" }}>{dbTables.find(t => t.name === dbSelectedTable)?.rowCount ?? 0} linhas</span>
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => refreshTableData()} style={{ background: "#3F3F46", border: "1px solid #52525B", color: "#eee", borderRadius: 4, padding: "4px 10px", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38" /></svg>Atualizar
                              </button>
                              <button onClick={async () => {
                                if (confirm(`Deletar tabela "${dbSelectedTable}"? Esta ação não pode ser desfeita.`)) {
                                  await DatabaseService.dropTable(dbSelectedTable);
                                  setDbSelectedTable(null); setDbSchema([]); setDbData([]);
                                  loadDbTables();
                                }
                              }} style={{ background: "transparent", border: "1px solid #ef444440", color: "#ef4444", borderRadius: 4, padding: "4px 10px", fontSize: 10, cursor: "pointer" }}>
                                🗑 Deletar Tabela
                              </button>
                            </div>
                          </div>

                          {/* Sub-abas */}
                          <div style={{ display: "flex", borderBottom: "1px solid #3F3F46", gap: 0 }}>
                            {([['schema','Estrutura'],['data','Dados'],['sql','Console SQL']] as const).map(([key, label]) => (
                              <button key={key} onClick={() => setDbAdminTab(key)} style={{
                                background: "transparent", border: "none",
                                borderBottom: dbAdminTab === key ? "2px solid #10B981" : "2px solid transparent",
                                color: dbAdminTab === key ? "#10B981" : "#888",
                                padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 500
                              }}>{label}</button>
                            ))}
                          </div>

                          {/* ─ ABA: ESTRUTURA ─ */}
                          {dbAdminTab === 'schema' && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "monospace" }}>
                                <thead>
                                  <tr style={{ background: "#3F3F46" }}>
                                    {['#','Nome','Tipo','Null','Default','PK'].map(h => (
                                      <th key={h} style={{ padding: "7px 10px", textAlign: "left", color: "#10B981", fontWeight: 600, fontSize: 10 }}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {dbSchema.map((col, ci) => (
                                    <tr key={ci} style={{ borderBottom: "1px solid #3F3F46", background: ci%2===0?"#27272A":"#2d2d30" }}>
                                      <td style={{ padding: "6px 10px", color: "#555" }}>{col.cid}</td>
                                      <td style={{ padding: "6px 10px", color: "#E2E8F0", fontWeight: 600 }}>{col.name}</td>
                                      <td style={{ padding: "6px 10px", color: "#c084fc" }}>{col.type}</td>
                                      <td style={{ padding: "6px 10px", color: col.notnull?"#ef4444":"#52525B" }}>{col.notnull?'NOT NULL':'NULL'}</td>
                                      <td style={{ padding: "6px 10px", color: "#888", fontStyle: col.dflt_value===null?"italic":"normal" }}>{col.dflt_value===null?'—':String(col.dflt_value)}</td>
                                      <td style={{ padding: "6px 10px", color: col.pk?"#10B981":"#555" }}>{col.pk?'✓ PK':''}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {/* Adicionar coluna */}
                              {dbShowAddCol ? (
                                <div style={{ background: "#18181B", border: "1px solid #3F3F46", borderRadius: 6, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                                  <span style={{ fontSize: 11, fontWeight: 600, color: "#a1a1aa" }}>Adicionar Coluna</span>
                                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <input value={dbNewColName} onChange={e => setDbNewColName(e.target.value)} placeholder="nome_coluna"
                                      style={{ flex: 1, background: "#27272A", border: "1px solid #52525B", borderRadius: 4, padding: "6px 8px", color: "#fff", fontSize: 11, fontFamily: "monospace" }} />
                                    <select value={dbNewColType} onChange={e => setDbNewColType(e.target.value)}
                                      style={{ background: "#27272A", border: "1px solid #52525B", borderRadius: 4, padding: "6px 4px", color: "#E2E8F0", fontSize: 11 }}>
                                      {['TEXT','INTEGER','REAL','BLOB','DATETIME','BOOLEAN'].map(t => <option key={t}>{t}</option>)}
                                    </select>
                                    <input value={dbNewColDefault} onChange={e => setDbNewColDefault(e.target.value)} placeholder="default (opcional)"
                                      style={{ width: 120, background: "#27272A", border: "1px solid #52525B", borderRadius: 4, padding: "6px 8px", color: "#fff", fontSize: 11 }} />
                                    <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#888", whiteSpace: "nowrap" }}>
                                      <input type="checkbox" checked={dbNewColNotnull} onChange={e => setDbNewColNotnull(e.target.checked)} /> NOT NULL
                                    </label>
                                  </div>
                                  <div style={{ display: "flex", gap: 6 }}>
                                    <button onClick={async () => {
                                      if (!dbNewColName.trim()) { alert('Informe o nome da coluna'); return; }
                                      try {
                                        await DatabaseService.addColumn(dbSelectedTable, { name: dbNewColName.trim(), type: dbNewColType, notnull: dbNewColNotnull, defaultValue: dbNewColDefault });
                                        setDbShowAddCol(false); setDbNewColName(''); setDbNewColDefault(''); setDbNewColNotnull(false);
                                        const schema = await DatabaseService.getTableSchema(dbSelectedTable);
                                        setDbSchema(schema);
                                      } catch(err: any) { alert('Erro: ' + err.message); }
                                    }} style={{ background: "#10B981", color: "#000", border: "none", borderRadius: 4, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Adicionar</button>
                                    <button onClick={() => { setDbShowAddCol(false); setDbNewColName(''); }} style={{ background: "transparent", border: "1px solid #3F3F46", color: "#888", borderRadius: 4, padding: "6px 12px", fontSize: 11, cursor: "pointer" }}>Cancelar</button>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => setDbShowAddCol(true)} style={{ background: "#3F3F46", border: "1px dashed #52525B", color: "#a1a1aa", borderRadius: 6, padding: "8px", fontSize: 11, cursor: "pointer", alignSelf: "flex-start" }}>+ Adicionar Coluna</button>
                              )}
                            </div>
                          )}

                          {/* ─ ABA: DADOS ─ */}
                          {dbAdminTab === 'data' && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {/* Botão adicionar linha */}
                              {!dbShowAddRow && !dbEditingRowid && (
                                <button onClick={() => {
                                  setDbShowAddRow(true);
                                  const init: Record<string,string> = {};
                                  dbSchema.forEach(col => { init[col.name] = ''; });
                                  setDbNewRowValues(init);
                                }} style={{ background: "#10B981", color: "#000", border: "none", borderRadius: 6, padding: "7px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer", alignSelf: "flex-start" }}>+ Nova Linha</button>
                              )}

                              {/* Form: nova linha */}
                              {dbShowAddRow && (
                                <div style={{ background: "#18181B", border: "1px solid #10B98140", borderRadius: 6, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                                  <span style={{ fontSize: 11, fontWeight: 600, color: "#10B981" }}>Inserir Nova Linha</span>
                                  <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "6px 10px", alignItems: "center" }}>
                                    {dbSchema.map(col => (
                                      <React.Fragment key={col.name}>
                                        <label style={{ fontSize: 10, color: "#888", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{col.name} <span style={{color:"#c084fc"}}>{col.type}</span></label>
                                        <input value={dbNewRowValues[col.name]||''} onChange={e => setDbNewRowValues(p => ({...p, [col.name]: e.target.value}))}
                                          placeholder={col.dflt_value !== null ? `default: ${col.dflt_value}` : 'NULL'}
                                          style={{ background: "#27272A", border: "1px solid #3F3F46", borderRadius: 3, padding: "5px 8px", color: "#fff", fontSize: 11, fontFamily: "monospace" }} />
                                      </React.Fragment>
                                    ))}
                                  </div>
                                  <div style={{ display: "flex", gap: 6 }}>
                                    <button onClick={async () => {
                                      try {
                                        const vals: Record<string,string> = {};
                                        Object.entries(dbNewRowValues).forEach(([k,v]) => { if (v !== '') vals[k] = v; });
                                        await DatabaseService.insertRow(dbSelectedTable, vals);
                                        setDbShowAddRow(false);
                                        await refreshTableData();
                                      } catch(err: any) { alert('Erro: ' + err.message); }
                                    }} style={{ background: "#10B981", color: "#000", border: "none", borderRadius: 4, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Inserir</button>
                                    <button onClick={() => setDbShowAddRow(false)} style={{ background: "transparent", border: "1px solid #3F3F46", color: "#888", borderRadius: 4, padding: "6px 12px", fontSize: 11, cursor: "pointer" }}>Cancelar</button>
                                  </div>
                                </div>
                              )}

                              {/* Tabela de dados */}
                              {dbData.length === 0 ? (
                                <div style={{ color: "#52525B", fontSize: 12, textAlign: "center", padding: "24px 0" }}>Tabela vazia — insira a primeira linha acima.</div>
                              ) : (
                                <div style={{ overflowX: "auto" }}>
                                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "monospace" }}>
                                    <thead>
                                      <tr style={{ background: "#3F3F46" }}>
                                        {Object.keys(dbData[0]).filter(k => k !== '__rowid__').map(k => (
                                          <th key={k} style={{ padding: "6px 10px", textAlign: "left", color: "#10B981", fontWeight: 600, fontSize: 10, whiteSpace: "nowrap" }}>{k}</th>
                                        ))}
                                        <th style={{ padding: "6px 10px", color: "#555", fontSize: 10 }}>Ações</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {dbData.map((row, ri) => (
                                        <tr key={ri} style={{ borderBottom: "1px solid #3F3F46", background: dbEditingRowid === row.__rowid__ ? "#18181B" : ri%2===0?"#27272A":"#2d2d30" }}>
                                          {dbEditingRowid === row.__rowid__ ? (
                                            // Linha em edição
                                            <>
                                              {Object.keys(row).filter(k => k !== '__rowid__').map(k => (
                                                <td key={k} style={{ padding: "4px 6px" }}>
                                                  <input value={dbEditValues[k]??''} onChange={e => setDbEditValues(p => ({...p, [k]: e.target.value}))}
                                                    style={{ width: "100%", minWidth: 60, background: "#27272A", border: "1px solid #10B981", borderRadius: 3, padding: "4px 6px", color: "#fff", fontSize: 11, fontFamily: "monospace" }} />
                                                </td>
                                              ))}
                                              <td style={{ padding: "4px 6px", whiteSpace: "nowrap", display: "flex", gap: 4 }}>
                                                <button onClick={async () => {
                                                  try {
                                                    await DatabaseService.updateRow(dbSelectedTable, dbEditingRowid!, dbEditValues);
                                                    setDbEditingRowid(null);
                                                    await refreshTableData();
                                                  } catch(err: any) { alert('Erro: ' + err.message); }
                                                }} style={{ background: "#10B981", color: "#000", border: "none", borderRadius: 3, padding: "3px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>✓</button>
                                                <button onClick={() => setDbEditingRowid(null)} style={{ background: "#3F3F46", border: "none", color: "#888", borderRadius: 3, padding: "3px 8px", fontSize: 10, cursor: "pointer" }}>✕</button>
                                              </td>
                                            </>
                                          ) : (
                                            // Linha normal
                                            <>
                                              {Object.keys(row).filter(k => k !== '__rowid__').map(k => (
                                                <td key={k} style={{ padding: "6px 10px", color: row[k]===null?"#555":"#E2E8F0", fontStyle: row[k]===null?"italic":"normal", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={row[k]===null?'NULL':String(row[k])}>
                                                  {row[k]===null?<span style={{color:"#555"}}>NULL</span>:String(row[k])}
                                                </td>
                                              ))}
                                              <td style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>
                                                <div style={{ display: "flex", gap: 4 }}>
                                                  <button onClick={() => {
                                                    const vals: Record<string,string> = {};
                                                    Object.keys(row).filter(k => k !== '__rowid__').forEach(k => { vals[k] = row[k] === null ? '' : String(row[k]); });
                                                    setDbEditValues(vals);
                                                    setDbEditingRowid(row.__rowid__);
                                                    setDbShowAddRow(false);
                                                  }} style={{ background: "#3F3F46", border: "none", color: "#E2E8F0", borderRadius: 3, padding: "3px 7px", fontSize: 10, cursor: "pointer" }}>✏</button>
                                                  <button onClick={async () => {
                                                    if (confirm('Deletar esta linha?')) {
                                                      await DatabaseService.deleteRow(dbSelectedTable, row.__rowid__);
                                                      await refreshTableData();
                                                    }
                                                  }} style={{ background: "transparent", border: "1px solid #ef444430", color: "#ef4444", borderRadius: 3, padding: "3px 7px", fontSize: 10, cursor: "pointer" }}>🗑</button>
                                                </div>
                                              </td>
                                            </>
                                          )}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ─ ABA: CONSOLE SQL ─ */}
                          {dbAdminTab === 'sql' && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <span style={{ fontSize: 11, color: "#666" }}>Execute qualquer SQL diretamente no banco de dados SQLite WASM.</span>
                                <div style={{ position: "relative" }}>
                                  <textarea value={rawQueryText} onChange={e => setRawQueryText(e.target.value)}
                                    style={{ width: "100%", height: 90, background: "#18181B", color: "#a2f6ff", border: "1px solid #52525B", borderRadius: 6, padding: "8px 12px", fontFamily: "monospace", fontSize: 12, resize: "vertical", boxSizing: "border-box" }} />
                                  <button onClick={async () => {
                                    try {
                                      setRawQueryError(null); setRawQueryResult(null);
                                      const result = await DatabaseService.runRawQuery(rawQueryText);
                                      setRawQueryResult(result);
                                      await loadDbTables();
                                    } catch(err: any) { setRawQueryError(err.message); }
                                  }} style={{ position: "absolute", bottom: 10, right: 10, background: "#10B981", color: "#000", fontWeight: 700, fontSize: 10, padding: "5px 12px", border: "none", borderRadius: 4, cursor: "pointer" }}>Executar</button>
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {[
                                  { label: "Ver Tabelas", sql: "SELECT name, sql FROM sqlite_master WHERE type='table';" },
                                  { label: `Todos de ${dbSelectedTable}`, sql: `SELECT * FROM "${dbSelectedTable}" LIMIT 50;` },
                                  { label: "Contar Linhas", sql: `SELECT COUNT(*) as total FROM "${dbSelectedTable}";` },
                                  { label: "Schema", sql: `PRAGMA table_info("${dbSelectedTable}");` }
                                ].map((t, idx) => (
                                  <button key={idx} onClick={() => setRawQueryText(t.sql)} style={{ background: "#3F3F46", border: "1px solid #52525B", color: "#a1a1aa", fontSize: 9, padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>{t.label}</button>
                                ))}
                              </div>
                              {rawQueryError && (
                                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: 10, color: "#f87171", fontSize: 11, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                                  <b>Erro:</b> {rawQueryError}
                                </div>
                              )}
                              {rawQueryResult && (
                                rawQueryResult.length === 0 ? (
                                  <div style={{ color: "#888", fontSize: 12 }}>Query executada. 0 linhas retornadas.</div>
                                ) : (
                                  <div style={{ overflowX: "auto", border: "1px solid #3F3F46", borderRadius: 6 }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "monospace" }}>
                                      <thead>
                                        <tr style={{ background: "#3F3F46" }}>
                                          {Object.keys(rawQueryResult[0]).map(k => (
                                            <th key={k} style={{ padding: "6px 10px", textAlign: "left", color: "#10B981", fontWeight: 600, fontSize: 10 }}>{k}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {rawQueryResult.map((row, ri) => (
                                          <tr key={ri} style={{ borderBottom: "1px solid #3F3F46", background: ri%2===0?"#27272A":"transparent" }}>
                                            {Object.keys(rawQueryResult[0]).map(k => (
                                              <td key={k} style={{ padding: "5px 10px", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: row[k]===null?"#555":"#E2E8F0" }} title={row[k]===null?'NULL':String(row[k])}>
                                                {row[k]===null?<span style={{fontStyle:"italic"}}>NULL</span>:String(row[k])}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>

                      ) : (
                        // CONSOLE SQL GLOBAL (sem tabela selecionada)
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #3F3F46", paddingBottom: 10 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Console SQL</span>
                            <span style={{ fontSize: 11, color: "#52525B" }}>Execute qualquer query diretamente no SQLite WASM</span>
                          </div>
                          <div style={{ position: "relative" }}>
                            <textarea
                              value={rawQueryText}
                              onChange={e => setRawQueryText(e.target.value)}
                              onKeyDown={e => {
                                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                  e.preventDefault();
                                  setRawQueryError(null); setRawQueryResult(null);
                                  DatabaseService.runRawQuery(rawQueryText)
                                    .then(r => { setRawQueryResult(r); loadDbTables(); })
                                    .catch(err => setRawQueryError(err.message));
                                }
                              }}
                              placeholder="Digite sua query SQL aqui...&#10;&#10;Exemplos:&#10;SELECT * FROM songs;&#10;CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT);&#10;PRAGMA table_info('songs');"
                              style={{
                                width: "100%", height: 140, background: "#18181B", color: "#a2f6ff",
                                border: "1px solid #52525B", borderRadius: 6, padding: "10px 14px",
                                fontFamily: "monospace", fontSize: 13, resize: "vertical",
                                boxSizing: "border-box", lineHeight: 1.6,
                                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)"
                              }} />
                            <div style={{ position: "absolute", bottom: 10, right: 10, display: "flex", gap: 6, alignItems: "center" }}>
                              <span style={{ fontSize: 9, color: "#52525B" }}>Ctrl+Enter</span>
                              <button onClick={async () => {
                                try {
                                  setRawQueryError(null); setRawQueryResult(null);
                                  const result = await DatabaseService.runRawQuery(rawQueryText);
                                  setRawQueryResult(result);
                                  await loadDbTables();
                                } catch(err: any) { setRawQueryError(err.message); }
                              }} style={{ background: "#10B981", color: "#000", fontWeight: 700, fontSize: 11, padding: "6px 14px", border: "none", borderRadius: 4, cursor: "pointer", boxShadow: "0 2px 8px rgba(16,185,129,0.3)" }}>
                                Executar
                              </button>
                            </div>
                          </div>
                          {/* Atalhos rápidos */}
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                            <span style={{ fontSize: 9, color: "#52525B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Atalhos:</span>
                            {[
                              { label: "Listar Tabelas", sql: "SELECT name, sql FROM sqlite_master WHERE type='table';" },
                              { label: "Listar Índices", sql: "SELECT name, tbl_name FROM sqlite_master WHERE type='index';" },
                              { label: "Ver Songs", sql: "SELECT * FROM songs LIMIT 20;" },
                              { label: "Contar por Tipo", sql: "SELECT type, COUNT(*) as total FROM songs GROUP BY type;" },
                              { label: "Limpar Songs", sql: "DELETE FROM songs;" },
                            ].map((t, idx) => (
                              <button key={idx} onClick={() => setRawQueryText(t.sql)} style={{ background: "#3F3F46", border: "1px solid #52525B", color: "#a1a1aa", fontSize: 10, padding: "4px 9px", borderRadius: 4, cursor: "pointer", transition: "background 0.15s" }}>
                                {t.label}
                              </button>
                            ))}
                          </div>
                          {/* Resultado */}
                          {rawQueryError && (
                            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "10px 14px", color: "#f87171", fontSize: 12, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                              <b>Erro SQLite:</b> {rawQueryError}
                            </div>
                          )}
                          {rawQueryResult && (
                            rawQueryResult.length === 0 ? (
                              <div style={{ color: "#888", fontSize: 12, padding: 8, background: "#18181B", borderRadius: 6, border: "1px solid #3F3F46" }}>✓ Query executada com sucesso. 0 linhas retornadas.</div>
                            ) : (
                              <div style={{ overflowX: "auto", border: "1px solid #3F3F46", borderRadius: 6, flex: 1 }}>
                                <div style={{ padding: "4px 10px", background: "#18181B", borderBottom: "1px solid #3F3F46", fontSize: 10, color: "#52525B" }}>
                                  {rawQueryResult.length} linha{rawQueryResult.length !== 1 ? 's' : ''} retornada{rawQueryResult.length !== 1 ? 's' : ''}
                                </div>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "monospace" }}>
                                  <thead>
                                    <tr style={{ background: "#3F3F46" }}>
                                      {Object.keys(rawQueryResult[0]).map(k => (
                                        <th key={k} style={{ padding: "7px 10px", textAlign: "left", color: "#10B981", fontWeight: 600, fontSize: 10, whiteSpace: "nowrap" }}>{k}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {rawQueryResult.map((row, ri) => (
                                      <tr key={ri} style={{ borderBottom: "1px solid #3F3F46", background: ri%2===0?"#27272A":"transparent" }}>
                                        {Object.keys(rawQueryResult[0]).map(k => (
                                          <td key={k} style={{ padding: "6px 10px", maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: row[k]===null?"#555":"#E2E8F0" }} title={row[k]===null?'NULL':String(row[k])}>
                                            {row[k]===null?<span style={{fontStyle:"italic",color:"#555"}}>NULL</span>:String(row[k])}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )
                          )}
                          {!rawQueryError && !rawQueryResult && (
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#3F3F46", minHeight: 120 }}>
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
                              <span style={{ fontSize: 12 }}>Digite uma query acima e clique Executar</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // DUMMY SETTINGS CARDS FOR OTHER TABS
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 20, borderBottom: "1px solid #3F3F46" }}>
                      <div>
                        <div style={{ color: "#eee", fontSize: 14, marginBottom: 4 }}>Tema Escuro Profundo</div>
                        <div style={{ color: "#888", fontSize: 12 }}>Utiliza tons de preto absoluto (#000) para economizar bateria em telas OLED.</div>
                      </div>
                      <div style={{ width: 44, height: 24, background: "#10B981", borderRadius: 12, position: "relative", cursor: "pointer" }}>
                        <div style={{ width: 20, height: 20, background: "#000", borderRadius: "50%", position: "absolute", top: 2, right: 2 }}></div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 20, borderBottom: "1px solid #3F3F46" }}>
                      <div>
                        <div style={{ color: "#eee", fontSize: 14, marginBottom: 4 }}>Aceleração de Hardware</div>
                        <div style={{ color: "#888", fontSize: 12 }}>Usa a GPU para renderizar transições suaves sem sobrecarregar a CPU.</div>
                      </div>
                      <div style={{ width: 44, height: 24, background: "#10B981", borderRadius: 12, position: "relative", cursor: "pointer" }}>
                        <div style={{ width: 20, height: 20, background: "#000", borderRadius: "50%", position: "absolute", top: 2, right: 2 }}></div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "14px 24px", borderTop: "1px solid #3F3F46", background: "#18181B", display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                onClick={() => setIsSettingsOpen(false)}
                style={{ padding: "8px 16px", background: "transparent", border: "1px solid #52525B", color: "#e4e4e7", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
              >
                Fechar sem Salvar
              </button>
              <button
                onClick={() => setIsSettingsOpen(false)}
                style={{ padding: "8px 16px", background: "#10B981", border: "none", color: "#000", fontWeight: 600, borderRadius: 6, fontSize: 13, cursor: "pointer" }}
              >
                Salvar Alteracoes
              </button>
            </div>
          </div>
        </div>
  );
}

