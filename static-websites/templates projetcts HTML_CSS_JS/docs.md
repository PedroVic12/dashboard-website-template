# Documentação dos Websites

Este diretório contém uma coleção de templates e projetos de front-end, cada um em seu próprio arquivo HTML.

## 1. `index.html` - Aplicação Multi-Página com React

- **Descrição**: Uma aplicação de página única (SPA) que simula uma navegação multi-página usando React. O usuário pode alternar entre as seções "Home", "Dashboard" e "Habits" sem recarregar a página.
- **Tecnologias**: HTML, Tailwind CSS, React (via CDN), Babel (para transpilação de JSX no navegador).
- **Como usar**: Abra o arquivo `index.html` em um navegador. Os componentes React e a lógica da aplicação estão todos contidos no próprio arquivo para simplicidade.

## 2. `TODO_APP_dashboard_template.html` - Dashboard de Tarefas (To-Do)

- **Descrição**: Um dashboard completo para gerenciamento de listas de tarefas (To-Do). Permite criar múltiplos "projetos" (templates de frameworks), cada um com sua própria lista de tarefas e categorias. Os dados são salvos no `localStorage` do navegador, e há uma funcionalidade para exportar as tarefas para um arquivo Excel (`.xlsx`).
- **Tecnologias**: HTML, Tailwind CSS, React (via CDN), SheetJS (para exportar para Excel).
- **Destaques**:
  - Arquitetura orientada a objetos com classes para `Task` e `Category`.
  - Componentes reutilizáveis (Modal, Tabela, etc.).
  - Persistência de dados local.
  - Exportação para Excel.

## 3. `dashboard_controle_estoque.html` - Dashboard de Controle de Estoque

- **Descrição**: Um dashboard analítico e visual para controle de estoque e notas fiscais. Apresenta uma grande variedade de gráficos e tabelas, simulando um ambiente de Business Intelligence (BI).
- **Tecnologias**: HTML, Tailwind CSS, React (via CDN), Chart.js (para os gráficos).
- **Destaques**:
  - Visualização de dados rica com múltiplos tipos de gráficos (pizza, barra, linha, etc.).
  - Componentes reutilizáveis para cartões de estatísticas, gráficos e tabelas.
  - Simula um grande volume de dados (mock data) para uma demonstração realista.
  - Tema escuro e design profissional.

## 4. `DEV_prompts_site.html` - DevPrompts (Biblioteca de Prompts para IA)

- **Descrição**: Uma aplicação web completa que funciona como uma biblioteca de prompts de IA para desenvolvedores. Permite filtrar prompts por categoria, personalizá-los em um modal e (teoricamente) gerar respostas usando a API do Gemini. Inclui também um "Gerador de Fundo Mágico" que cria código CSS a partir de uma descrição.
- **Tecnologias**: HTML, Tailwind CSS, JavaScript puro, Lucide Icons.
- **Destaques**:
  - Tema claro e escuro (light/dark mode) com persistência no `localStorage`.
  - Sistema de filtros e busca.
  - Interação com API externa (Gemini).
  - Design moderno e interativo com modais e animações.
  - **Observação**: A chave de API do Gemini está exposta no código-fonte, o que não é uma prática segura para produção.

## 5. `bootstrap_grid_template.html` - Template de Grid CSS

- **Descrição**: Um arquivo HTML minimalista que demonstra um layout de grid responsivo usando a propriedade `grid-template-areas` do CSS. O layout se adapta de uma única coluna em telas pequenas para um layout com sidebar em telas maiores.
- **Tecnologias**: HTML, CSS puro.
- **Como usar**: Serve como um template básico para entender e construir layouts complexos com CSS Grid de forma semântica.
