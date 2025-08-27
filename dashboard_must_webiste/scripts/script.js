// Adiciona um "ouvinte" que espera que todo o conteúdo do HTML seja carregado antes de executar o código.
document.addEventListener('DOMContentLoaded', () => {
    // --- CARREGAMENTO DOS DADOS ---
    // O JavaScript agora vai buscar os dados do seu arquivo JSON.
    // O './' indica que o arquivo está na mesma pasta que o HTML.
    fetch('C:\Users\pedrovictor.veras\OneDrive - Operador Nacional do Sistema Eletrico\Documentos\ESTAGIO_ONS_PVRV_2025\AUTOMACÕES ONS\arquivos\database\must_tables_PDF_notes_merged.json')
        .then(response => {
            // Verifica se a requisição foi bem-sucedida
            if (!response.ok) {
                throw new Error('Erro na rede: ' + response.statusText);
            }
            // Converte a resposta para o formato JSON
            return response.json();
        })
        .then(dados => {
            // Quando os dados são carregados com sucesso, a variável 'dados' contém todo o seu JSON.
            // A aplicação é então iniciada com esses dados.
            initializeApp(dados);
        })
        .catch(error => {
            console.error('Erro ao carregar os dados:', error);
            // Mostra uma mensagem de erro no dashboard se o JSON não for encontrado
            document.body.innerHTML = `<div class="text-center p-8 text-red-400">
                <h1 class="text-2xl font-bold">Erro ao Carregar Dados</h1>
                <p>Não foi possível carregar o arquivo 'dashboard_data.json'. Verifique se o arquivo existe na mesma pasta que o HTML e se o servidor local está a ser executado.</p>
            </div>`;
        });
});

function initializeApp(dados) {
    // Chama todas as funções necessárias para construir o dashboard
    renderKPIs(dados);
    renderCompanyAnalysis(dados);
    populateCompanyFilter(dados);
    renderTable(dados);

    // Adiciona os "ouvintes" para os filtros, para que a tabela se atualize quando o utilizador interagir
    document.getElementById('company-filter').addEventListener('change', () => filterData(dados));
    document.getElementById('search-input').addEventListener('input', () => filterData(dados));
}

// Renderiza os cartões de KPI no topo
function renderKPIs(dados) {
    const uniqueCompanies = new Set(dados.map(item => item.EMPRESA)).size;
    const totalPoints = dados.length;
    const pointsWithRemarks = dados.filter(item => item.Anotacao && String(item.Anotacao).trim() !== 'nan').length;
    const percentageWithRemarks = totalPoints > 0 ? ((pointsWithRemarks / totalPoints) * 100).toFixed(1) : 0;

    const kpiContainer = document.getElementById('kpi-section');
    kpiContainer.innerHTML = `
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 class="text-gray-400 text-sm font-medium">Total de Empresas</h3>
            <p class="text-3xl font-bold text-white">${uniqueCompanies}</p>
        </div>
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 class="text-gray-400 text-sm font-medium">Total de Pontos de Conexão</h3>
            <p class="text-3xl font-bold text-white">${totalPoints}</p>
        </div>
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 class="text-gray-400 text-sm font-medium">Pontos com Ressalvas</h3>
            <p class="text-3xl font-bold text-white">${pointsWithRemarks}</p>
        </div>
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 class="text-gray-400 text-sm font-medium">% de Pontos com Ressalvas</h3>
            <p class="text-3xl font-bold text-white">${percentageWithRemarks}%</p>
        </div>
    `;
}

// Renderiza os cartões de análise por empresa
function renderCompanyAnalysis(dados) {
    const companyData = {};
    dados.forEach(item => {
        if (!companyData[item.EMPRESA]) {
            companyData[item.EMPRESA] = { total: 0, withRemarks: 0 };
        }
        companyData[item.EMPRESA].total++;
        if (item.Anotacao && String(item.Anotacao).trim() !== 'nan') {
            companyData[item.EMPRESA].withRemarks++;
        }
    });

    const companyContainer = document.getElementById('company-analysis-section');
    companyContainer.innerHTML = Object.entries(companyData).map(([company, stats]) => {
        const percentage = stats.total > 0 ? (stats.withRemarks / stats.total) * 100 : 0;
        return `
            <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 class="text-xl font-bold text-white">${company}</h3>
                <div class="mt-4">
                    <div class="flex justify-between text-gray-400 text-sm">
                        <span>Pontos com Ressalvas</span>
                        <span>${stats.withRemarks} / ${stats.total}</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                        <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${percentage}%"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Popula o dropdown de filtro de empresas
function populateCompanyFilter(dados) {
    const companies = [...new Set(dados.map(item => item.EMPRESA))].sort();
    const filterSelect = document.getElementById('company-filter');
    companies.forEach(company => {
        const option = document.createElement('option');
        option.value = company;
        option.textContent = company;
        filterSelect.appendChild(option);
    });
}

// Renderiza as linhas da tabela de dados
function renderTable(dados) {
    const tableBody = document.getElementById('data-table-body');
    if (dados.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-400">Nenhum resultado encontrado.</td></tr>`;
        return;
    }
    tableBody.innerHTML = dados.map(item => {
        const hasRemark = item.Anotacao && String(item.Anotacao).trim() !== 'nan';
        return `
        <tr class="bg-gray-800 border-b border-gray-700 hover:bg-gray-600 ${hasRemark ? 'cursor-pointer' : ''}" 
            onclick="${hasRemark ? `showModal(this)` : ''}"
            data-anotacao="${hasRemark ? escape(item.Anotacao) : ''}">
            <td class="px-6 py-4 font-medium text-white">${item.EMPRESA}</td>
            <td class="px-6 py-4">${item['Cód ONS']}</td>
            <td class="px-6 py-4">${item.Instalação}</td>
            <td class="px-6 py-4">${item['Tensão (kV)']}</td>
            <td class="px-6 py-4 text-center">
                ${hasRemark 
                    ? '<span class="text-yellow-400 font-bold">Sim</span>' 
                    : '<span class="text-gray-500">Não</span>'}
            </td>
        </tr>
    `}).join('');
}

// Filtra os dados com base nos inputs e renderiza a tabela novamente
function filterData(dados) {
    const companyFilter = document.getElementById('company-filter').value;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();

    const filteredData = dados.filter(item => {
        const companyMatch = companyFilter === 'all' || item.EMPRESA === companyFilter;
        const searchMatch = !searchTerm || 
                            String(item['Cód ONS']).toLowerCase().includes(searchTerm) ||
                            String(item.Instalação).toLowerCase().includes(searchTerm) ||
                            (item.Anotacao && String(item.Anotacao).toLowerCase().includes(searchTerm));
        return companyMatch && searchMatch;
    });

    renderTable(filteredData);
}

// Funções do Modal
function showModal(element) {
    const annotation = unescape(element.getAttribute('data-anotacao'));
    if (!annotation || annotation === 'null') return;
    
    document.getElementById('modal-content').textContent = annotation;
    const modal = document.getElementById('annotation-modal');
    modal.classList.remove('hidden');
    setTimeout(() => modal.style.opacity = 1, 10);
}

function closeModal() {
    const modal = document.getElementById('annotation-modal');
    modal.style.opacity = 0;
    setTimeout(() => modal.classList.add('hidden'), 300);
}
