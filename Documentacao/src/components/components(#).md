# Pasta: components

- Caminho original: `src/components`
- Tipo: Pasta

## Finalidade

A pasta **`src/components`** agrupa os componentes React extraidos de **`App.tsx`** para separar responsabilidades visuais e reduzir o tamanho do componente principal. Esses arquivos renderizam regioes especificas da interface do StageVision, enquanto **`App.tsx`** permanece como orquestrador de estado, efeitos e integracoes.

## Arquivos Documentados

- **`BottomControlPanel.tsx`**: painel inferior reservado para funcionalidades futuras.
- **`MediaLibraryPanel.tsx`**: biblioteca de midias, filtros, busca, formulario de cadastro e menu de exclusao.
- **`MediaPreview.tsx`**: icones por tipo de midia e renderizacao visual de preview.
- **`MonitorsPanel.tsx`**: monitores PREVIEW/PROGRAM e controles de transicao.
- **`ProjectionView.tsx`**: tela cheia da janela de projecao.
- **`SettingsModal.tsx`**: modal de configuracoes e administracao SQLite.
- **`TitleBar.tsx`**: barra superior com marca, relogio e comandos principais.
