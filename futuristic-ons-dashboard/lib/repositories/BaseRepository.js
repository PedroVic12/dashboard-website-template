/**
 * BaseRepository - Classe base para acesso a dados.
 * 
 * Atualmente usa dados mock em memoria.
 * Para conectar a um banco SQLite, basta:
 * 1. Instalar `better-sqlite3` ou usar via API externa
 * 2. Substituir os metodos de cada Repository filho
 *    para fazer queries reais no banco.
 * 
 * Exemplo futuro com SQLite:
 *   import Database from 'better-sqlite3'
 *   const db = Database('./data/ons.db')
 *   
 *   findAll() {
 *     return db.prepare('SELECT * FROM energia').all()
 *   }
 */
export class BaseRepository {
  constructor(entityName) {
    this.entityName = entityName
  }

  /**
   * Busca todos os registros. Override nos filhos.
   * @param {Object} filters - Filtros opcionais
   * @returns {Array} Lista de entidades
   */
  findAll(filters = {}) {
    throw new Error(`findAll() nao implementado para ${this.entityName}`)
  }

  /**
   * Busca um registro por ID. Override nos filhos.
   * @param {string|number} id
   * @returns {Object|null}
   */
  findById(id) {
    throw new Error(`findById() nao implementado para ${this.entityName}`)
  }

  /**
   * Busca registros agregados/resumo. Override nos filhos.
   * @returns {Object}
   */
  getSummary() {
    throw new Error(`getSummary() nao implementado para ${this.entityName}`)
  }

  /**
   * Aplica filtros genericos a uma lista de dados.
   * Util para filtragem client-side ou mock.
   * @param {Array} data 
   * @param {Object} filters 
   * @returns {Array}
   */
  applyFilters(data, filters) {
    let result = [...data]
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== "" && value !== "all") {
        result = result.filter(item => {
          if (typeof item[key] === "string") {
            return item[key].toLowerCase().includes(String(value).toLowerCase())
          }
          return item[key] === value
        })
      }
    }
    return result
  }
}
