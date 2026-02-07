/**
 * Repositorios de dados do ONS Dashboard.
 * 
 * Arquitetura preparada para consumir de API/SQLite.
 * Cada repositorio herda de BaseRepository e implementa
 * findAll(), findById(), getSummary().
 * 
 * Para migrar para SQLite:
 * 1. npm install better-sqlite3
 * 2. Criar arquivo de conexao em lib/db.js
 * 3. Substituir os metodos mock por queries reais
 * 
 * Exemplo de conexao futura:
 *   import Database from 'better-sqlite3'
 *   export const db = new Database(process.env.DATABASE_PATH || './data/ons.db')
 */

export { energiaRepository } from "./EnergiaRepository"
export { transmissaoRepository } from "./TransmissaoRepository"
export { usinasSolaresRepository, usinasEolicasRepository } from "./UsinasRepository"
export { relatoriosRepository } from "./RelatoriosRepository"
