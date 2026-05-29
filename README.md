# 🎬 StageVision

O **StageVision** é um software web profissional de projeção e apresentação multimídia em tempo real. Inspirado em ferramentas líderes de mercado como **ProPresenter**, **Holyrics** e **FreeShow**, ele foi projetado com foco em alta performance, usabilidade limpa e responsividade absoluta, sendo ideal para controle de projeções em templos religiosos, conferências, eventos e apresentações ao vivo.

Toda a interface é construída sob uma estética escura cibernética moderna, utilizando o cinza claro **`#E2E8F0`** para os textos, o cinza zinco **`#27272A`** como fundo e o verde esmeralda **`#10B981`** como cor de identidade principal e destaque (accent color).

---

## ✨ Recursos Principais

### 🖥️ Monitores Inteligentes (Preview & Program)
* **Proporção 16:9 Inviolável**: Utiliza **CSS Container Queries** (`container-type: size`) avançadas. As telas de PREVIEW e PROGRAM mudam de tamanho automaticamente de acordo com qualquer redimensionamento de janela ou painel lateral, mas **nunca** perdem o formato exato de 16:9, evitando distorções visuais.
* **Fundo Limpo**: Quando nenhuma mídia está ativa, as telas exibem um preto puro absoluto e profissional (`#000`), pronto para receber sinal.
* **Controles Integrados (FTB & LIMPAR)**: O monitor do PROGRAM possui botões integrados e sempre visíveis de **FTB** (Fade to Black) e **LIMPAR** para controle rápido de corte de sinal direto no ar.

### 🎚️ Controle de Transições Centralizado
* **Botões de Transição Diretos**: Botões **Play (Fade)** e **CUT** planos e estáticos integrados em um painel central fixo para controle de transições com precisão cirúrgica de corte seco ou mistura suave.
* **Visualização Simétrica**: Os controles dividem as duas telas de forma equilibrada para uma experiência clássica e organizada de seleção e projeção de mídias.

### 📁 Biblioteca de Mídias Completa
* **Categorias Organizadas**: Suporte nativo a 8 abas de filtragem rápida:
  `TODOS` ➔ `IMAGEM` ➔ `VÍDEO` ➔ `SLIDE` ➔ `ÁUDIO` ➔ `MÚSICA` ➔ `SEQUÊNCIA` ➔ `COLEÇÃO`
* **Layout Clean**: Lista de mídias totalmente limpa, sem bordas coloridas ou animações invasivas de translação. Possui feedback sutil no mouse (hover) que clareia o fundo suavemente.
* **Importador Rápido**: Clique no botão `Adicionar +` no topo para cadastrar dinamicamente novos itens especificando Nome, Tipo e Conteúdo (com suporte para digitação de slides de texto ou links de imagem).

---

## 📂 Estrutura do Projeto

Abaixo está o mapa visual de organização do StageVision:

```
StageVision/
├── public/                 # Assets estáticos servidos diretamente
│   └── StageVision.png     # Logo oficial da marca e favicon
├── src/                    # Código-fonte da aplicação
│   ├── App.tsx             # Componente central, estados e interfaces
│   ├── index.css           # Design System (variáveis, scrollbars, divisores)
│   ├── main.tsx            # Inicializador e montador do React
│   └── vite-env.d.ts       # Declarações globais de tipos do Vite
├── dist/                   # Build de produção otimizado (gerado pelo npm run build)
├── node_modules/           # Bibliotecas externas de dependência instaladas
├── index.html              # Estrutura HTML principal e link do favicon
├── package.json            # Configurações de scripts e dependências do Node
└── vite.config.ts          # Arquivo de configuração de build do Vite
```

### Explicação Rápida das Pastas:
* **`/src`**: Onde nós trabalhamos! Contém toda a lógica em TypeScript, componentes React e estilos CSS personalizados.
* **`/public`**: Contém arquivos que o navegador precisa carregar de forma bruta sem compilar (como a logo `StageVision.png` e favicons).
* **`/node_modules`**: As milhares de bibliotecas baixadas da internet que nosso aplicativo precisa (como o próprio React e o sistema de redimensionamento drag-and-drop das janelas).
* **`/dist`**: A versão final do projeto. Quando rodamos o build, o Vite compila o TypeScript da pasta `src`, otimiza e junta tudo em arquivos compactados nessa pasta, prontos para a internet.

---

## 🛠️ Como Executar o Projeto

Certifique-se de ter o [Node.js](https://nodejs.org) instalado na sua máquina.

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Iniciar o Servidor de Desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse a interface localmente em `http://localhost:5173`.

3. **Gerar Versão de Produção (`/dist`)**:
   ```bash
   npm run build
   ```

---

## 📦 Como Criar um Executável (.exe)

Como o StageVision é um aplicativo web leve e otimizado, você pode envelopá-lo para rodar como um programa Windows instalável nativo:

### Recomendado: Tauri (Super leve, executável de ~5MB)
O Tauri usa o motor nativo do Windows (Webview2) e constrói o backend em Rust.
1. Instale o Rust no seu computador.
2. Inicialize o Tauri no projeto:
   ```bash
   npm run tauri init
   ```
3. Aponte a pasta de build para o diretório `../dist` e a porta de dev para `http://localhost:5173`.
4. Compile o programa instalado final:
   ```bash
   npm run tauri build
   ```

### Alternativa Rápida: Electron (Padrão de mercado, executável de ~100MB)
O Electron embute um navegador Chromium inteiro no seu instalador.
1. Adicione a biblioteca electron-builder.
2. Configure o entrypoint no package.json para ler os arquivos gerados no `/dist`.
3. Rode o build do Electron para gerar o instalador do Windows.
