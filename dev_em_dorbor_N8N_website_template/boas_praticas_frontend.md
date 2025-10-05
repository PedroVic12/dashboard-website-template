Guia de Aprendizado: Frontend Profissional com SOLID e Gerenciamento de Estado
Este guia é um ponto de partida para organizar seu código JavaScript de forma mais limpa, escalável e profissional, mesmo sem usar frameworks complexos como React ou Angular.

1. Princípios SOLID no Frontend com JavaScript
SOLID é um acrônimo para cinco princípios de design que ajudam a criar software mais compreensível, flexível e manutenível.

S - Single Responsibility Principle (Princípio da Responsabilidade Única)
Conceito: Cada função, classe ou componente deve ter uma única responsabilidade.

No Frontend: Em vez de ter uma função gigante initializeApp() que busca dados, cria HTML, e adiciona todos os event listeners, separe as responsabilidades.

Exemplo Prático:

// RUIM ❌
function setupPrompts() {
    // 1. Busca os dados
    const prompts = [{...}, {...}]; 
    // 2. Cria o HTML
    let html = '';
    prompts.forEach(p => { html += `<div...>${p.title}</div>`; });
    // 3. Insere no DOM
    document.getElementById('prompt-grid').innerHTML = html;
    // 4. Adiciona eventos
    document.querySelectorAll('.prompt-card').forEach(c => c.addEventListener('click', ...));
}

// BOM ✅
// Responsabilidade 1: Buscar os dados
function getPromptsData() {
    return [{...}, {...}];
}

// Responsabilidade 2: Criar o HTML de um único card
function createPromptCardHTML(prompt) {
    return `<div...>${prompt.title}</div>`;
}

// Responsabilidade 3: Renderizar os cards no DOM
function renderPrompts(prompts) {
    const grid = document.getElementById('prompt-grid');
    grid.innerHTML = prompts.map(createPromptCardHTML).join('');
}

// Responsabilidade 4: Adicionar os eventos
function addPromptEventListeners() {
    document.querySelectorAll('.prompt-card').forEach(c => c.addEventListener('click', ...));
}

// Função principal apenas coordena as outras
function setupPrompts() {
    const prompts = getPromptsData();
    renderPrompts(prompts);
    addPromptEventListeners();
}

O - Open/Closed Principle (Princípio Aberto/Fechado)
Conceito: O código deve ser aberto para extensão, mas fechado para modificação.

No Frontend: Crie componentes ou funções que possam ter seu comportamento estendido sem que você precise alterar o código original deles. Use parâmetros, callbacks e configuração.

Exemplo Prático:

// RUIM ❌ - Para adicionar um novo tipo de card, precisa modificar a função
function createCard(type, data) {
    if (type === 'prompt') {
        return `<div class="prompt-card">${data.title}</div>`;
    } else if (type === 'plan') {
        return `<div class="plan-card">${data.name}</div>`;
    }
}

// BOM ✅ - A função aceita uma função de renderização como parâmetro
function createCard(data, renderFunction) {
    // A lógica do container do card é a mesma
    return `<div class="card-container">${renderFunction(data)}</div>`;
}

function renderPromptContent(data) {
    return `<h3>${data.title}</h3>`;
}

function renderPlanContent(data) {
    return `<h2>${data.name}</h2><p>${data.price}</p>`;
}

// Agora é fácil estender para novos tipos de card sem tocar em `createCard`
const promptCard = createCard({title: '...'}, renderPromptContent);
const planCard = createCard({name: '...', price: '$10'}, renderPlanContent);

L, I, D - (Liskov, Interface Segregation, Dependency Inversion)
Estes são mais avançados, mas a ideia principal no frontend é:

Liskov (LSP): Se você cria componentes "base" e os estende, a versão estendida deve funcionar em qualquer lugar que a base funcionaria.

Segregação de Interface (ISP): Funções e componentes não devem ser forçados a depender de coisas que não usam. Mantenha os parâmetros e dependências enxutos.

Inversão de Dependência (DIP): Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações. No nosso site, a lógica da API do Gemini (callGeminiAPI) é um módulo de baixo nível. As funções do modal (alto nível) dependem dela. Isso está bom, mas a ideia é que, se um dia você trocar a Gemini pela OpenAI, você só precisaria mudar a função callGeminiAPI, e o resto do código do modal continuaria funcionando, pois ele depende da "abstração" de que existe uma função que retorna texto de uma IA.

2. Gerenciamento de Estado em JavaScript Puro
Gerenciamento de estado é a forma como você armazena e atualiza os dados que sua UI exibe.

O Problema
Quando o usuário clica em um filtro, o que acontece?

Um dado (o filtro ativo) muda.

A UI (a lista de prompts) precisa ser atualizada para refletir essa mudança.

Manter isso sincronizado manualmente pode virar um pesadelo.

A Solução: Um "Store" Central e o Padrão Observer
A ideia é ter um único objeto que representa o "estado" da sua aplicação. Qualquer parte do seu código que precisar exibir esses dados irá "observar" esse objeto. Quando o estado muda, todas as partes que o observam são notificadas e se atualizam.

Exemplo Prático Simplificado:

// 1. Objeto de Estado Central (Nosso "Store")
const AppState = {
    activeCategory: 'all',
    activeTypes: [],
    // ...outros dados importantes
};

// 2. Funções que modificam o estado (Mutations / Actions)
// Elas são as ÚNICAS que devem alterar o AppState.
function setCategory(category) {
    console.log(`STATE CHANGE: Category changed to ${category}`);
    AppState.activeCategory = category;
    renderUI(); // Notifica a UI para re-renderizar
}

function toggleType(type) {
    if (AppState.activeTypes.includes(type)) {
        AppState.activeTypes = AppState.activeTypes.filter(t => t !== type);
    } else {
        AppState.activeTypes.push(type);
    }
    console.log(`STATE CHANGE: Active types are now [${AppState.activeTypes.join(', ')}]`);
    renderUI(); // Notifica a UI para re-renderizar
}

// 3. Uma função de renderização principal
// Esta função lê o AppState e desenha a tela inteira com base nele.
function renderUI() {
    console.log("RENDERING UI based on current state...");

    // Filtra os prompts com base no estado atual
    const filteredPrompts = prompts.filter(p => {
        const categoryMatch = AppState.activeCategory === 'all' || p.category === AppState.activeCategory;
        const typeMatch = AppState.activeTypes.length === 0 || AppState.activeTypes.includes(p.type);
        return categoryMatch && typeMatch;
    });

    // Chama a função que desenha os prompts na tela
    renderPrompts(filteredPrompts); // (renderPrompts é a função que você já tem)

    // Atualiza outras partes da UI, como o link de categoria ativo
    document.querySelectorAll('.category-link').forEach(link => {
        link.classList.toggle('active', link.dataset.category === AppState.activeCategory);
    });
}

// 4. Conectar os Event Listeners para chamar as funções que mudam o estado
// Em vez de manipular o DOM diretamente no evento, chamamos a função de "mutação".
document.querySelector('#category-list').addEventListener('click', (e) => {
    const link = e.target.closest('.category-link');
    if (link) {
        e.preventDefault();
        setCategory(link.dataset.category);
    }
});

// Chame renderUI() uma vez no início para a renderização inicial
renderUI();

Com essa estrutura:

Fonte Única da Verdade: Você sempre sabe qual é o estado atual da sua aplicação olhando para AppState.

Fluxo de Dados Previsível: A UI só muda quando uma função como setCategory é chamada, que por sua vez chama renderUI. Fica fácil de rastrear por que a tela mudou.

Manutenibilidade: Para adicionar um novo filtro, você só precisa adicionar uma nova propriedade ao AppState, uma função para modificá-la e atualizar a lógica em renderUI.