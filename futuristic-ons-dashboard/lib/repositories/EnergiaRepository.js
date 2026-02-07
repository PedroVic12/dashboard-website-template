import { BaseRepository } from "./BaseRepository"

/**
 * EnergiaRepository - Dados de geracao e consumo de energia eletrica.
 * 
 * Para migrar para SQLite:
 *   findAll() { return db.prepare('SELECT * FROM energia_geracao WHERE ...').all() }
 */
class EnergiaRepository extends BaseRepository {
  constructor() {
    super("Energia")
    
    // Mock data - substituir por queries SQLite
    this._geracaoHoraria = [
      { hora: "00:00", hidro: 42000, eolica: 12000, solar: 0, termica: 8500, biomassa: 3200 },
      { hora: "02:00", hidro: 40000, eolica: 13500, solar: 0, termica: 8200, biomassa: 3100 },
      { hora: "04:00", hidro: 38000, eolica: 14000, solar: 0, termica: 8800, biomassa: 3300 },
      { hora: "06:00", hidro: 39000, eolica: 13000, solar: 2000, termica: 9200, biomassa: 3400 },
      { hora: "08:00", hidro: 41000, eolica: 11000, solar: 12000, termica: 7500, biomassa: 3500 },
      { hora: "10:00", hidro: 43000, eolica: 9500, solar: 22000, termica: 5500, biomassa: 3600 },
      { hora: "12:00", hidro: 44000, eolica: 8500, solar: 28000, termica: 4800, biomassa: 3700 },
      { hora: "14:00", hidro: 45000, eolica: 9000, solar: 26000, termica: 5200, biomassa: 3600 },
      { hora: "16:00", hidro: 46000, eolica: 10500, solar: 18000, termica: 6800, biomassa: 3500 },
      { hora: "18:00", hidro: 48000, eolica: 12000, solar: 5000, termica: 9500, biomassa: 3400 },
      { hora: "20:00", hidro: 47000, eolica: 13000, solar: 0, termica: 10200, biomassa: 3300 },
      { hora: "22:00", hidro: 44000, eolica: 12500, solar: 0, termica: 9000, biomassa: 3200 },
    ]

    this._matrizEnergetica = [
      { fonte: "Hidraulica", capacidade: 109000, geracao: 45200, cor: "#3b82f6", percentual: 57.6 },
      { fonte: "Eolica", capacidade: 30000, geracao: 12800, cor: "#00b4d8", percentual: 16.3 },
      { fonte: "Solar", capacidade: 42000, geracao: 22500, cor: "#facc15", percentual: 28.7 },
      { fonte: "Termica", capacidade: 25000, geracao: 8500, cor: "#f97316", percentual: 10.8 },
      { fonte: "Biomassa", capacidade: 16000, geracao: 3600, cor: "#4ade80", percentual: 4.6 },
      { fonte: "Nuclear", capacidade: 2000, geracao: 1900, cor: "#a855f7", percentual: 2.4 },
    ]

    this._demandaSemanal = [
      { dia: "Seg", demanda: 74500, geracao: 78200 },
      { dia: "Ter", demanda: 76200, geracao: 79500 },
      { dia: "Qua", demanda: 75800, geracao: 78800 },
      { dia: "Qui", demanda: 77100, geracao: 80200 },
      { dia: "Sex", demanda: 74900, geracao: 77600 },
      { dia: "Sab", demanda: 62000, geracao: 68500 },
      { dia: "Dom", demanda: 58500, geracao: 65200 },
    ]

    this._consumoRegional = [
      { regiao: "Sudeste", consumo: 48500, percentual: 54.2, cor: "#00b4d8" },
      { regiao: "Sul", consumo: 14200, percentual: 15.9, cor: "#4ade80" },
      { regiao: "Nordeste", consumo: 12800, percentual: 14.3, cor: "#facc15" },
      { regiao: "Norte", consumo: 6500, percentual: 7.3, cor: "#f97316" },
      { regiao: "Centro-Oeste", consumo: 5800, percentual: 6.5, cor: "#3b82f6" },
    ]
  }

  findAll(filters = {}) {
    // Retorna dados de geracao horaria filtrados
    return this.applyFilters(this._geracaoHoraria, filters)
  }

  getMatrizEnergetica() {
    return this._matrizEnergetica
  }

  getDemandaSemanal() {
    return this._demandaSemanal
  }

  getConsumoRegional() {
    return this._consumoRegional
  }

  getSummary() {
    const totalGeracao = this._matrizEnergetica.reduce((sum, f) => sum + f.geracao, 0)
    const totalCapacidade = this._matrizEnergetica.reduce((sum, f) => sum + f.capacidade, 0)
    return {
      totalGeracao,
      totalCapacidade,
      fatorCarga: ((totalGeracao / totalCapacidade) * 100).toFixed(1),
      fontes: this._matrizEnergetica.length,
    }
  }
}

export const energiaRepository = new EnergiaRepository()
