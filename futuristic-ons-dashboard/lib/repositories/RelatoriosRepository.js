import { BaseRepository } from "./BaseRepository"

class RelatoriosRepository extends BaseRepository {
  constructor() {
    super("Relatorios")

    this._relatorios = [
      { id: 1, title: "Relatorio Mensal do SIN - Janeiro 2026", type: "mensal", date: "05/02/2026", size: "4.2 MB", category: "Operacao" },
      { id: 2, title: "Boletim Diario de Operacao", type: "diario", date: "06/02/2026", size: "1.8 MB", category: "Operacao" },
      { id: 3, title: "Analise de Contingencia - Regiao Sudeste", type: "especial", date: "04/02/2026", size: "2.5 MB", category: "Seguranca" },
      { id: 4, title: "Balanco Energetico Semanal", type: "semanal", date: "03/02/2026", size: "3.1 MB", category: "Energia" },
      { id: 5, title: "Previsao de Carga - Fevereiro 2026", type: "mensal", date: "01/02/2026", size: "2.8 MB", category: "Planejamento" },
      { id: 6, title: "Relatorio de Geracao Renovavel", type: "mensal", date: "02/02/2026", size: "5.4 MB", category: "Renovavel" },
      { id: 7, title: "Situacao dos Reservatorios", type: "semanal", date: "06/02/2026", size: "1.2 MB", category: "Hidro" },
      { id: 8, title: "Indicadores de Desempenho do SIN", type: "mensal", date: "01/02/2026", size: "3.8 MB", category: "Operacao" },
    ]

    this._anotacoes = []

    this._kpis = [
      { label: "Geracao Total 2025", value: "716 TWh", trend: "up", change: "+4.2%" },
      { label: "Pico de Demanda", value: "102.2 GW", trend: "up", change: "+2.8%" },
      { label: "Participacao Renovavel", value: "88.4%", trend: "up", change: "+3.1%" },
      { label: "Nivel dos Reservatorios", value: "62.5%", trend: "down", change: "-5.4%" },
    ]
  }

  findAll(filters = {}) {
    return this.applyFilters(this._relatorios, filters)
  }

  findById(id) {
    return this._relatorios.find(r => r.id === id) || null
  }

  getKpis() {
    return this._kpis
  }

  getAnotacoes() {
    return this._anotacoes
  }

  addAnotacao(anotacao) {
    const newAnotacao = {
      id: this._anotacoes.length + 1,
      ...anotacao,
      createdAt: new Date().toISOString(),
    }
    this._anotacoes.push(newAnotacao)
    return newAnotacao
  }

  getSummary() {
    return {
      totalRelatorios: this._relatorios.length,
      porTipo: {
        diario: this._relatorios.filter(r => r.type === "diario").length,
        semanal: this._relatorios.filter(r => r.type === "semanal").length,
        mensal: this._relatorios.filter(r => r.type === "mensal").length,
        especial: this._relatorios.filter(r => r.type === "especial").length,
      },
      totalAnotacoes: this._anotacoes.length,
    }
  }
}

export const relatoriosRepository = new RelatoriosRepository()
