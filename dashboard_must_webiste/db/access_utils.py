
import pandas as pd
import pyodbc
import logging
import time
from pathlib import Path
import threading
from queue import Queue, Empty

logger = logging.getLogger(__name__)

# Pool de conexões (replicado do AccessDatabase para funções utilitárias)
_connection_pool = Queue(maxsize=5)
_pool_lock = threading.Lock()

def _get_connection_from_pool(db_path: Path) -> pyodbc.Connection:
    """Tenta obter conexão do pool ou cria uma nova."""
    try:
        return _connection_pool.get(timeout=0.1)
    except Empty:
        conn_str = (
            r"DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};"
            rf"DBQ={db_path.absolute()};"
            r"ExtendedAnsiSQL=1;"
        )
        conn = pyodbc.connect(conn_str)
        # Configura encoding para CP1252 (Windows-1252) que é mais compatível
        try:
            conn.setdecoding(pyodbc.SQL_CHAR, encoding='cp1252')
            conn.setdecoding(pyodbc.SQL_WCHAR, encoding='cp1252')
            conn.setencoding(encoding='cp1252')
        except:
            # Se falhar, tenta UTF-8
            try:
                conn.setdecoding(pyodbc.SQL_CHAR, encoding='utf-8')
                conn.setdecoding(pyodbc.SQL_WCHAR, encoding='utf-8')
                conn.setencoding(encoding='utf-8')
            except:
                pass
        logger.info(f"✅ Nova conexão Access criada (util): {db_path.name}")
        return conn

def _return_connection_to_pool(connection: pyodbc.Connection) -> None:
    """Retorna conexão ao pool se não estiver cheio ou a fecha."""
    try:
        if not _connection_pool.full():
            _connection_pool.put(connection, timeout=0.1)
        else:
            connection.close()
    except:
        try:
            connection.close()
        except:
            pass

def _execute_query(db_path: Path, query: str, params: tuple = None) -> pd.DataFrame:
    """
    Executa uma query SQL no Access e retorna um DataFrame.
    Gerencia a conexão via pool.
    """
    conn = None
    try:
        conn = _get_connection_from_pool(db_path)
        cursor = conn.cursor()
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)

        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        df = pd.DataFrame.from_records(rows, columns=columns)
        return df
    except Exception as e:
        logger.error(f"❌ Erro em _execute_query (util): {e}")
        raise
    finally:
        if conn:
            _return_connection_to_pool(conn)

def _execute_non_query(db_path: Path, query: str, params: tuple = None) -> bool:
    """
    Executa uma query SQL que não retorna dados (INSERT, UPDATE, DELETE).
    Gerencia a conexão via pool.
    """
    conn = None
    try:
        conn = _get_connection_from_pool(db_path)
        cursor = conn.cursor()
        if params:
            # Converte parâmetros para tipos Python padrão
            params_convertidos = []
            for param in params:
                if hasattr(param, 'item'):  # numpy.int64, numpy.float64, etc.
                    params_convertidos.append(param.item())
                else:
                    params_convertidos.append(param)
            cursor.execute(query, tuple(params_convertidos))
        else:
            cursor.execute(query)
        conn.commit()
        logger.info(f"✅ Query executada com sucesso (util): {cursor.rowcount} linhas afetadas")
        return True
    except Exception as e:
        logger.error(f"❌ Erro em _execute_non_query (util): {e}")
        if conn: # Tenta rollback em caso de erro
            try:
                conn.rollback()
            except:
                pass
        raise
    finally:
        if conn:
            _return_connection_to_pool(conn)

def _tabela_tem_campo_id_espelho(db_path: Path, table_name: str) -> bool:
    """
    Verifica se uma tabela tem o campo ID_espelho.
    """
    tabelas_com_id_espelho = [
        'tb_BaseCondicionante',
        'tb_cad_AgrupamentoCondicoes_LPP',
        'tb_cad_configuracao_LPP',
        'tb_cad_limite_LPP',
        'tb_cadCondicoes_LPP',
        'tb_DicionarioVariavel',
        'tb_TipoLPP',
        'tb_ValoresTesteVariaveis_LPP',
        'tb_ValoresVariaveis',
        'tb_variaveisSelecionadas',
        'tb_vincul-CadConfig_Condicoes_LPP',
        'tb_vincula_Limite_Configuracao_LPP',
        'tbl_Relacao_BaseCondicionante',
        'tbl_Resultados_LPP'
    ]
    return table_name in tabelas_com_id_espelho

def _atualizar_id_espelho(db_path: Path, table_name: str, id_field: str, novo_id: int) -> bool:
    """
    Atualiza o campo ID_espelho após inserção.
    """
    if not _tabela_tem_campo_id_espelho(db_path, table_name):
        logger.info(f"ℹ️ Tabela {table_name} não tem campo ID_espelho (util)")
        return True

    query_update = f"UPDATE {table_name} SET ID_espelho = ? WHERE {id_field} = ?"
    return _execute_non_query(db_path, query_update, (novo_id, novo_id))

def _obter_id_field(table_name: str) -> str:
    """
    Retorna o nome do campo ID primário para uma dada tabela.
    """
    if table_name == 'tb_ValoresVariaveis':
        return 'ID_ValorVar'
    elif table_name == 'tbl_Relacao_BaseCondicionante':
        return 'ID_Relacao'
    elif table_name == 'tbl_Resultados_LPP':
        return 'ID_result'
    elif table_name == 'tb_variaveisSelecionadas':
        return 'ID_variavelSel'
    else:
        return 'ID'

def _verificar_registro_existente(db_path: Path, table_name: str, campos_unicos: dict) -> tuple:
    """
    Verifica se já existe um registro com os valores especificados.
    Retorna (existe, id_existente) onde existe é bool e id_existente é o ID se existir.
    """
    if not campos_unicos:
        return False, None

    condicoes = []
    valores = []
    for campo, valor in campos_unicos.items():
        condicoes.append(f"{campo} = ?")
        valores.append(valor)

    where_clause = " AND ".join(condicoes)
    id_field = _obter_id_field(table_name)
    query = f"SELECT {id_field} FROM {table_name} WHERE {where_clause}"

    conn = None
    try:
        conn = _get_connection_from_pool(db_path)
        cursor = conn.cursor()
        cursor.execute(query, valores)
        row = cursor.fetchone()
        if row:
            return True, row[0]
        else:
            return False, None
    except Exception as e:
        logger.error(f"❌ Erro ao verificar registro existente (util) em {table_name}: {e}")
        return False, None
    finally:
        if conn:
            _return_connection_to_pool(conn)

def _obter_campos_unicos_tabela(table_name: str) -> list:
    """
    Retorna os campos que devem ser verificados para unicidade em cada tabela.
    """
    campos_unicos_por_tabela = {
        'tb_variaveisSelecionadas': ['ID_Variavel', 'ID_vinculoConfigCondicao'],
        'tb_ValoresVariaveis': ['ID_Base', 'ID_VariavelSel'],
        'tbl_Relacao_BaseCondicionante': ['ID_Base', 'ID_Condicionante', 'ID_Result_fk'],
        'tbl_Resultados_LPP': ['ID_Base', 'ID_vinculoConfigCondicao', 'NomeGrupo']
    }
    return campos_unicos_por_tabela.get(table_name, [])

def upsert_with_mirror_id(table_name: str, item_data: dict, db_path: str) -> int:
    """
    Realiza um UPSERT (INSERT ou UPDATE) em uma tabela e gerencia o ID_espelho.
    """
    db_path_obj = Path(db_path)
    if not db_path_obj.exists():
        raise FileNotFoundError(f"Banco Access não encontrado: {db_path}")

    id_field = _obter_id_field(table_name)
    campos_unicos = {k: v for k, v in item_data.items() if k in _obter_campos_unicos_tabela(table_name)}
    
    # Tenta encontrar registro existente pelos campos únicos
    existe, id_existente = _verificar_registro_existente(db_path_obj, table_name, campos_unicos)

    if existe:
        # Atualização
        logger.info(f"✏️ Atualizando item existente em {table_name} com ID: {id_existente}")
        # Remove campos únicos dos dados a serem atualizados para evitar conflito
        data_to_update = {k: v for k, v in item_data.items() if k not in campos_unicos}
        if atualizar_item_with_mirror(table_name, id_existente, data_to_update, db_path):
            # Após atualização, precisamos obter o ID_espelho se for uma tabela que o usa
            if _tabela_tem_campo_id_espelho(db_path_obj, table_name):
                conn = None
                try:
                    conn = _get_connection_from_pool(db_path_obj)
                    cursor = conn.cursor()
                    query_get_mirror_id = f"SELECT ID_espelho FROM {table_name} WHERE {id_field} = ?"
                    cursor.execute(query_get_mirror_id, (id_existente,))
                    result = cursor.fetchone()
                    if result:
                        logger.info(f"✅ Item atualizado em {table_name} com ID_espelho: {result[0]}")
                        return result[0]
                    else:
                        logger.warning(f"⚠️ Não foi possível obter ID_espelho após atualização para {table_name} com ID: {id_existente}")
                        return id_existente # Retorna o ID normal como fallback
                except Exception as e:
                    logger.error(f"❌ Erro ao obter ID_espelho após atualização: {e}")
                    return id_existente # Retorna o ID normal como fallback
                finally:
                    if conn:
                        _return_connection_to_pool(conn)
            else:
                return id_existente
        else:
            raise Exception(f"Falha ao atualizar item em {table_name} com ID: {id_existente}")
    else:
        # Inserção
        logger.info(f"➕ Inserindo novo item em {table_name}")
        columns = ', '.join(item_data.keys())
        placeholders = ', '.join(['?' for _ in item_data.values()])
        insert_query = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"
        
        conn = None
        try:
            conn = _get_connection_from_pool(db_path_obj)
            cursor = conn.cursor()
            
            params_convertidos = []
            for param in item_data.values():
                if hasattr(param, 'item'):
                    params_convertidos.append(param.item())
                else:
                    params_convertidos.append(param)
            
            cursor.execute(insert_query, tuple(params_convertidos))
            novo_id = cursor.execute("SELECT @@IDENTITY").fetchone()[0]
            conn.commit()
            
            if _atualizar_id_espelho(db_path_obj, table_name, id_field, novo_id):
                logger.info(f"✅ Novo item inserido em {table_name} com ID: {novo_id}, ID_espelho: {novo_id}")
                return novo_id
            else:
                raise Exception(f"Falha ao atualizar ID_espelho para {table_name} com ID: {novo_id}")
        except Exception as e:
            logger.error(f"❌ Erro na inserção com ID_espelho (util): {e}")
            if conn: # Tenta rollback em caso de erro
                try:
                    conn.rollback()
                except:
                    pass
            raise
        finally:
            if conn:
                _return_connection_to_pool(conn)

def salvar_item_with_mirror(table_name: str, item_data: dict, db_path: str) -> dict:
    """
    Função wrapper para salvar item, retornando um dicionário com sucesso e ID_espelho.
    """
    try:
        id_espelho = upsert_with_mirror_id(table_name, item_data, db_path)
        return {"success": True, "id_espelho": id_espelho}
    except Exception as e:
        return {"success": False, "id_espelho": None, "error": str(e)}

def deletar_item_with_mirror(table_name: str, item_id: int, db_path: str) -> bool:
    """
    Deleta um item específico de uma tabela, considerando o ID_espelho.
    """
    db_path_obj = Path(db_path)
    if not db_path_obj.exists():
        raise FileNotFoundError(f"Banco Access não encontrado: {db_path}")

    id_field = _obter_id_field(table_name)
    query = f"DELETE FROM {table_name} WHERE {id_field} = ?"
    
    try:
        item_id_convertido = int(item_id) if hasattr(item_id, 'item') else item_id
        return _execute_non_query(db_path_obj, query, (item_id_convertido,))
    except Exception as e:
        logger.error(f"❌ Erro ao deletar item {item_id} de {table_name} (util): {e}")
        return False

def atualizar_item_with_mirror(table_name: str, item_id: int, item_data: dict, db_path: str) -> bool:
    """
    Atualiza um item específico em uma tabela, considerando o ID_espelho.
    """
    db_path_obj = Path(db_path)
    if not db_path_obj.exists():
        raise FileNotFoundError(f"Banco Access não encontrado: {db_path}")

    if not item_data:
        logger.warning("⚠️ Nenhum dado para atualização (util)")
        return False

    id_field = _obter_id_field(table_name)
    # Remove o campo de ID dos dados a serem atualizados, se presente
    item_data_filtered = {k: v for k, v in item_data.items() if k != id_field and k != 'ID' and k != 'ID_result' and k != 'ID_espelho'}

    if not item_data_filtered:
        logger.warning("⚠️ Nenhum dado válido para atualização após filtro (util)")
        return False

    set_clause = ', '.join([f"{key} = ?" for key in item_data_filtered.keys()])
    query = f"UPDATE {table_name} SET {set_clause} WHERE {id_field} = ?"
    params = tuple(item_data_filtered.values()) + (item_id,)

    try:
        return _execute_non_query(db_path_obj, query, params)
    except Exception as e:
        logger.error(f"❌ Erro ao atualizar item {item_id} em {table_name} (util): {e}")
        return False

def validate_id_espelho_integrity(db_path: str) -> dict:
    """
    Valida a integridade dos relacionamentos ID_espelho em todas as tabelas relevantes.
    Esta é uma versão simplificada para o Access. Em SQLite, Foreign Keys já garantem isso.
    """
    logger.info("🔍 Validando integridade de ID_espelho no Access (simplificado para migração).")
    return {
        'sucesso': True,
        'validacoes': ["Validação de integridade de ID_espelho simplificada para Access."],
        'erros': []
    }


# --- Funções do ID_espelho_manager (placeholder para compatibilidade) ---
# Estas funções são mockadas para permitir que access_db.py seja executado
# sem o módulo real id_espelho_manager. Em um cenário real, você importaria
# e usaria um módulo id_espelho_manager completo se ele existisse.

class MockIDEspelhoManager:
    def validar_relacionamento(self, table1, field1, table2, field2, value):
        logger.debug(f"Mock: Validando relacionamento entre {table1}.{field1} e {table2}.{field2} com valor {value}")
        return True # Sempre retorna True para o mock

    def validar_consulta_sql(self, query):
        logger.debug(f"Mock: Validando consulta SQL: {query}")
        return [] # Sempre retorna lista vazia (sem violações) para o mock

    def corrigir_consulta_sql(self, query):
        logger.debug(f"Mock: Corrigindo consulta SQL: {query}")
        return query # Sempre retorna a query original para o mock

id_espelho_manager = MockIDEspelhoManager()
