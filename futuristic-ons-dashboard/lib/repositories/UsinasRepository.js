import { BaseRepository } from "./BaseRepository"

class UsinasSolaresRepository extends BaseRepository {
  constructor() {
    super("UsinasSolares")

    this._usinas = [
      { id: 1, nome: "Sao Goncalo", estado: "PI", capacidade: 608, geracao: 485, irradiancia: 5.8, status: "operando", fatorCapacidade: 79.8 },
      { id: 2, nome: "Pirapora", estado: "MG", capacidade: 399, geracao: 312, irradiancia: 5.5, status: "operando", fatorCapacidade: 78.2 },
      { id: 3, nome: "Nova Olinda", estado: "PI", capacidade: 292, geracao: 238, irradiancia: 5.9, status: "operando", fatorCapacidade: 81.5 },
      { id: 4, nome: "Boa Sorte", estado: "BA", capacidade: 350, geracao: 280, irradiancia: 5.7, status: "operando", fatorCapacidade: 80.0 },
      { id: 5, nome: "Janauba Solar", estado: "MG", capacidade: 156, geracao: 120, irradiancia: 5.4, status: "manutencao", fatorCapacidade: 76.9 },
      { id: 6, nome: "Coremas", estado: "PB", capacidade: 210, geracao: 175, irradiancia: 5.6, status: "operando", fatorCapacidade: 83.3 },
    ]

    this._geracaoDiaria = [
      { hora: "05:00", geracao: 0, irradiancia: 0 },
      { hora: "06:00", geracao: 120, irradiancia: 150 },
      { hora: "07:00", geracao: 580, irradiancia: 380 },
      { hora: "08:00", geracao: 1200, irradiancia: 620 },
      { hora: "09:00", geracao: 2100, irradiancia: 780 },
      { hora: "10:00", geracao: 3200, irradiancia: 890 },
      { hora: "11:00", geracao: 3800, irradiancia: 950 },
      { hora: "12:00", geracao: 4100, irradiancia: 980 },
      { hora: "13:00", geracao: 3900, irradiancia: 960 },
      { hora: "14:00", geracao: 3400, irradiancia: 880 },
      { hora: "15:00", geracao: 2600, irradiancia: 720 },
      { hora: "16:00", geracao: 1600, irradiancia: 520 },
      { hora: "17:00", geracao: 680, irradiancia: 280 },
      { hora: "18:00", geracao: 120, irradiancia: 80 },
      { hora: "19:00", geracao: 0, irradiancia: 0 },
    ]
  }

  findAll(filters = {}) {
    return this.applyFilters(this._usinas, filters)
  }

  findById(id) {
    return this._usinas.find(u => u.id === id) || null
  }

  getGeracaoDiaria() {
    return this._geracaoDiaria
  }

  getSummary() {
    const totalCapacidade = this._usinas.reduce((s, u) => s + u.capacidade, 0)
    const totalGeracao = this._usinas.reduce((s, u) => s + u.geracao, 0)
    const operando = this._usinas.filter(u => u.status === "operando").length
    return { totalCapacidade, totalGeracao, totalUsinas: this._usinas.length, operando }
  }
}

class UsinasEolicasRepository extends BaseRepository {
  constructor() {
    super("UsinasEolicas")

    this._parques = [
      { id: 1, nome: "Complexo Alto Sertao", estado: "BA", capacidade: 842, geracao: 650, turbinas: 184, velocidadeVento: 8.2, status: "operando", fatorCapacidade: 77.2 },
      { id: 2, nome: "Complexo Lagoa dos Ventos", estado: "PI", capacidade: 716, geracao: 580, turbinas: 162, velocidadeVento: 9.1, status: "operando", fatorCapacidade: 81.0 },
      { id: 3, nome: "Parque Tucano", estado: "BA", capacidade: 524, geracao: 410, turbinas: 120, velocidadeVento: 7.8, status: "operando", fatorCapacidade: 78.2 },
      { id: 4, nome: "Complexo Chafariz", estado: "PB", capacidade: 472, geracao: 385, turbinas: 108, velocidadeVento: 8.5, status: "operando", fatorCapacidade: 81.6 },
      { id: 5, nome: "Parque Ventos do Araripe", estado: "PE", capacidade: 358, geracao: 265, turbinas: 82, velocidadeVento: 7.2, status: "manutencao", fatorCapacidade: 74.0 },
      { id: 6, nome: "Complexo Caetite", estado: "BA", capacidade: 292, geracao: 230, turbinas: 68, velocidadeVento: 7.6, status: "operando", fatorCapacidade: 78.8 },
    ]

    this._geracaoPorVento = [
      { hora: "00:00", geracao: 8500, velocidade: 7.2 },
      { hora: "02:00", geracao: 9200, velocidade: 7.8 },
      { hora: "04:00", geracao: 9800, velocidade: 8.1 },
      { hora: "06:00", geracao: 9500, velocidade: 7.9 },
      { hora: "08:00", geracao: 8200, velocidade: 7.0 },
      { hora: "10:00", geracao: 7500, velocidade: 6.5 },
      { hora: "12:00", geracao: 7000, velocidade: 6.2 },
      { hora: "14:00", geracao: 7800, velocidade: 6.8 },
      { hora: "16:00", geracao: 8500, velocidade: 7.3 },
      { hora: "18:00", geracao: 9500, velocidade: 8.0 },
      { hora: "20:00", geracao: 10200, velocidade: 8.5 },
      { hora: "22:00", geracao: 9800, velocidade: 8.2 },
    ]
  }

  findAll(filters = {}) {
    return this.applyFilters(this._parques, filters)
  }

  findById(id) {
    return this._parques.find(p => p.id === id) || null
  }

  getGeracaoPorVento() {
    return this._geracaoPorVento
  }

  getSummary() {
    const totalCapacidade = this._parques.reduce((s, p) => s + p.capacidade, 0)
    const totalGeracao = this._parques.reduce((s, p) => s + p.geracao, 0)
    const totalTurbinas = this._parques.reduce((s, p) => s + p.turbinas, 0)
    const operando = this._parques.filter(p => p.status === "operando").length
    return { totalCapacidade, totalGeracao, totalTurbinas, totalParques: this._parques.length, operando }
  }
}

export const usinasSolaresRepository = new UsinasSolaresRepository()
export const usinasEolicasRepository = new UsinasEolicasRepository()
