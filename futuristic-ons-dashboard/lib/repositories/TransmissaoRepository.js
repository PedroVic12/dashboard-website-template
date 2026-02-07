import { BaseRepository } from "./BaseRepository"

class TransmissaoRepository extends BaseRepository {
  constructor() {
    super("Transmissao")

    this._linhas = [
      { id: 1, nome: "Tucurui - Macapa", tensao: "500 kV", extensao: 1800, capacidade: 3200, status: "operando", regiao: "Norte", perdas: 2.1 },
      { id: 2, nome: "Itaipu - SE Foz", tensao: "765 kV", extensao: 890, capacidade: 6300, status: "operando", regiao: "Sul", perdas: 1.2 },
      { id: 3, nome: "Belo Monte - Estreito", tensao: "800 kV CC", extensao: 2092, capacidade: 4000, status: "operando", regiao: "Norte", perdas: 3.5 },
      { id: 4, nome: "Xingu - Terminal Rio", tensao: "800 kV CC", extensao: 2543, capacidade: 4000, status: "operando", regiao: "Sudeste", perdas: 3.8 },
      { id: 5, nome: "SE Miracema - SE Sapeacu", tensao: "500 kV", extensao: 1452, capacidade: 2800, status: "manutencao", regiao: "Norte", perdas: 2.5 },
      { id: 6, nome: "Furnas - Adrianopolis", tensao: "345 kV", extensao: 420, capacidade: 1200, status: "operando", regiao: "Sudeste", perdas: 0.8 },
      { id: 7, nome: "Paulo Afonso - Recife", tensao: "500 kV", extensao: 680, capacidade: 2500, status: "operando", regiao: "Nordeste", perdas: 1.5 },
      { id: 8, nome: "SE Presidente Medici - Pelotas", tensao: "525 kV", extensao: 350, capacidade: 1500, status: "alerta", regiao: "Sul", perdas: 0.9 },
    ]

    this._intercambios = [
      { hora: "00:00", N_NE: 1200, NE_SE: 3500, SE_S: -800, N_SE: 4200 },
      { hora: "02:00", N_NE: 1100, NE_SE: 3200, SE_S: -600, N_SE: 4000 },
      { hora: "04:00", N_NE: 1000, NE_SE: 2800, SE_S: -500, N_SE: 3800 },
      { hora: "06:00", N_NE: 1300, NE_SE: 3000, SE_S: -400, N_SE: 3900 },
      { hora: "08:00", N_NE: 1500, NE_SE: 3800, SE_S: -1200, N_SE: 4500 },
      { hora: "10:00", N_NE: 1800, NE_SE: 4200, SE_S: -1500, N_SE: 5000 },
      { hora: "12:00", N_NE: 2000, NE_SE: 4500, SE_S: -1800, N_SE: 5200 },
      { hora: "14:00", N_NE: 1900, NE_SE: 4300, SE_S: -1600, N_SE: 5100 },
      { hora: "16:00", N_NE: 1700, NE_SE: 4000, SE_S: -1300, N_SE: 4800 },
      { hora: "18:00", N_NE: 2200, NE_SE: 4800, SE_S: -2000, N_SE: 5500 },
      { hora: "20:00", N_NE: 2100, NE_SE: 4600, SE_S: -1800, N_SE: 5300 },
      { hora: "22:00", N_NE: 1600, NE_SE: 3800, SE_S: -1000, N_SE: 4400 },
    ]
  }

  findAll(filters = {}) {
    return this.applyFilters(this._linhas, filters)
  }

  findById(id) {
    return this._linhas.find(l => l.id === id) || null
  }

  getIntercambios() {
    return this._intercambios
  }

  getSummary() {
    const total = this._linhas.length
    const operando = this._linhas.filter(l => l.status === "operando").length
    const manutencao = this._linhas.filter(l => l.status === "manutencao").length
    const alerta = this._linhas.filter(l => l.status === "alerta").length
    const extensaoTotal = this._linhas.reduce((sum, l) => sum + l.extensao, 0)
    const capacidadeTotal = this._linhas.reduce((sum, l) => sum + l.capacidade, 0)
    return { total, operando, manutencao, alerta, extensaoTotal, capacidadeTotal }
  }
}

export const transmissaoRepository = new TransmissaoRepository()
