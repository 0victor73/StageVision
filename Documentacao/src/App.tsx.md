# Documentacao Tecnica: App.tsx

- Caminho original: `src/App.tsx`
- Tipo: Arquivo React/TypeScript
- Extensao: `.tsx`

## 1. Visao Geral

O arquivo **`src/App.tsx`** e o orquestrador principal do StageVision. Depois da refatoracao, ele concentra estados globais da aplicacao, efeitos de sincronizacao, integracao com **`DatabaseService`** e **`WindowManagementService`**, e delega a renderizacao visual para componentes menores em **`src/components`**. Sua responsabilidade principal e coordenar painel do operador, modo de projecao, biblioteca de midias, transicoes, importacao de arquivos e estado do modal de configuracoes.

## 2. Assinatura do Metodo

```tsx
export default function App(): JSX.Element;
```

Componentes renderizados por composicao:

```tsx
<ProjectionView />
<TitleBar />
<MediaLibraryPanel />
<MonitorsPanel />
<BottomControlPanel />
<SettingsModal />
```

## 3. Parametros

- **`App`**: nao recebe props externas.
- O estado e inicializado internamente com **`useState`**.
- Efeitos de ciclo de vida e sincronizacao usam **`useEffect`**.
- A comunicacao com servicos externos acontece por chamadas a **`DatabaseService`** e **`WindowManagementService`**.

## 4. Fluxo de Processamento de Dados

```mermaid
graph TD
    A[Inicializa App] --> B{URL contem projection=true?}
    B -->|Sim| C[Ativa modo de projecao]
    C --> D[Escuta BroadcastChannel]
    D --> E{Mensagem recebida}
    E -->|update_media| F[Atualiza projMedia]
    E -->|update_text| G[Atualiza testText]
    F --> H[Renderiza ProjectionView]
    G --> H

    B -->|Nao| I[Ativa painel do operador]
    I --> J[Carrega midias via DatabaseService.searchSongs]
    J --> K[Atualiza mediaList]
    K --> L[Aplica filtro por categoria]
    L --> M[Renderiza MediaLibraryPanel]
    I --> N[Renderiza MonitorsPanel]
    N --> O{Usuario executa CUT ou Fade}
    O -->|CUT| P[Troca previewMedia e programMedia]
    O -->|Fade| Q[Anima transitionProgress]
    Q --> P
    P --> R[Envia programMedia para WindowManagementService]
    I --> S{Configurações abertas?}
    S -->|Sim| T[Renderiza SettingsModal]
```

## 5. Detalhamento das Etapas e Regras de Negocio

1. **Modo de execucao**
   - **`isProjectionMode`** e calculado a partir da query string `projection=true`.
   - Em modo de projecao, o retorno e delegado a **`ProjectionView`**.
   - Em modo operador, o arquivo monta o layout com paineis redimensionaveis e componentes de interface.

2. **Estados de midia**
   - **`mediaList`** guarda a biblioteca carregada do banco.
   - **`previewMedia`** representa a midia selecionada para preparacao.
   - **`programMedia`** representa a midia em exibicao.
   - **`projMedia`** representa a midia recebida pela janela de projecao.

3. **Busca, filtro e selecao**
   - A busca chama **`DatabaseService.searchSongs(searchQuery)`** sempre que **`searchQuery`** muda.
   - **`filtered`** aplica o filtro local por **`activeCategory`**.
   - **`selectMedia`** atualiza **`previewMedia`** somente quando nao ha transicao em andamento.

4. **Importacao e cadastro**
   - **`addMedia`** cadastra uma midia manual no banco via **`DatabaseService.addMedia`**.
   - **`handleFileImport`** detecta o tipo por MIME type ou extensao.
   - Arquivos de texto sao lidos como texto; imagens, audios e PDFs pequenos podem ser salvos em Base64; arquivos maiores usam **`URL.createObjectURL`**.

5. **Transicoes**
   - **`executeCut`** troca **`previewMedia`** e **`programMedia`** imediatamente.
   - **`executeFade`** usa **`requestAnimationFrame`** para atualizar **`transitionProgress`** durante **`transitionDuration`**.
   - A sincronizacao com a janela secundaria acontece quando **`programMedia`** muda.

6. **Atalhos**
   - **`Space`** executa fade.
   - **`Enter`** executa cut.
   - **`Escape`** limpa **`programMedia`**.
   - Inputs, textareas e selects sao ignorados para nao interferir na digitacao.

7. **Administracao de banco**
   - O estado do admin SQLite permanece em **`App`** e e repassado ao **`SettingsModal`**.
   - **`loadDbTables`**, **`selectTable`** e **`refreshTableData`** encapsulam a carga de tabelas, schemas e dados.

## 6. Estrutura do Retorno

```tsx
if (isProjectionMode) {
  return <ProjectionView testText={testText} media={projMedia} playback={playback} />;
}

return (
  <div>
    <input type="file" multiple onChange={handleFileImport} />
    <TitleBar />
    <Group orientation="vertical">
      <Panel id="top-panel">
        <Group orientation="horizontal">
          <MediaLibraryPanel />
          <Separator />
          <MonitorsPanel />
        </Group>
      </Panel>
      <Separator />
      <BottomControlPanel />
    </Group>
    {isSettingsOpen && <SettingsModal />}
  </div>
);
```

## 7. Pontos de Atencao

- **`App.tsx`** ainda e o dono de muitos estados, especialmente os do admin de banco. A renderizacao ja foi separada, mas uma proxima etapa pode extrair hooks como **`useMediaLibrary`**, **`useProjectionSync`** e **`useDatabaseAdmin`**.
- O lint ainda aponta uso de **`any`** em estruturas ligadas ao banco e servicos; a refatoracao atual preservou esse comportamento para evitar mudancas funcionais.
- A janela de projecao depende de **BroadcastChannel** e da query string `projection=true`.
