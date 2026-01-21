---
# DASHBOARD em HTML com Tailwind e Excel
---

## Projeto Web com foco em ajudar no planejamento das atividades RJ/SP e região SECO da equipe PLC do ONS em 2026


## Funcionalidades:
- Import/Export de planilhas de controle em arquivos Excel

- Kanban de tarefas

- Matriz de Eisenhower

- Lista de prós e contras (Nivel de complexibilidade Big O com algoritmo)

- Planejamento de timeline


- Filtros dinâmicos por aba, responsável, status

- Gráficos atualizados em tempo real

- Tabela com colunas redimensionáveis

- Calendário interativo

- Persistência de dados no localStorage do ultimo upload de arquivo em memória


## Arquitetura:

- O projeto segue a arquitetura MVC e com Dockerfile com backend em Python (Flask) e frontend com HTML,CSS, JS e tailwind

- main.py (servidor)

- app/routes para as rotas

- app/database (salva os arquivos historicos em excel e tambem gera um arquivo database.db)

- app/static/JS e - app/static/css

- app/templates 

### Layout Principal:
Sidebar Esquerda: Controles e filtros com ícones

Área Principal: Dashboard com cards e gráficos

Design Responsivo: Adapta para mobile

---

## Componentes Incluídos:
📊 Cards de Estatísticas (Total de Atividades, Responsáveis)

📈 Gráficos Interativos (Status, Ressalvas, Responsáveis)

📅 Agenda de Prioridades (Atrasadas, Hoje, 7 dias, 30 dias)

📋 Tabela de Detalhes com redimensionamento de colunas

🗓️ Modal de Calendário para visualização de timelines

⏰ Relógio em Tempo Real no header

📤 Botão de Exportação para Excel

## Características Visuais:
Cores Profissionais: Azul, verde, laranja

Ícones Bootstrap em todos os elementos

Cards com sombras e efeitos hover

Loader vermelho semitransparente

Design moderno com bordas arredondadas

