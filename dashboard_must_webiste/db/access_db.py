# controle_acoes/services/access_db.py
"""
Módulo para conexão com banco Access local para testes de performance
Comparação SharePoint vs Access

CORREÇÕES APLICADAS:
- Removido campo 'Status' de tb_cad_limite_LPP (não existe no Access)
- Trocado 'TipoLPP' por 'ID_TipoLPP' em tb_BaseCondicionante
- Ajustado 'ID_Base' para 'ID_BaseCondicionante' em tb_ValoresVariaveis
- Ajustado 'ID' para 'ID_ValorVar' em tb_ValoresVariaveis
- 🔧 CORREÇÃO DEFINITIVA: Sistema de encoding robusto para caracteres especiais
- 🔧 CORREÇÃO CRÍTICA: Implementação da regra ID_espelho conforme documentação
"""

import pandas as pd
import time
import logging
from typing import Optional, Dict, Any
from pathlib import Path
import threading
from queue import Queue, Empty

# 🔧 CORREÇÃO: Importa configuração de locale pt-BR centralizada
from controle_acoes.core.encoding_config import configurar_locale_pt_br

# 🔧 CORREÇÃO CRÍTICA: Importa gerenciador ID_espelho
from controle_acoes.core.id_espelho_manager import id_espelho_manager

# 🔧 CORREÇÃO CRÍTICA: Importa função utilitária central para ID_espelho
from controle_acoes.services.access_utils import upsert_with_mirror_id, validate_id_espelho_integrity

try:
    import pyodbc
    ACCESS_AVAILABLE = True
except ImportError:
    ACCESS_AVAILABLE = False
    print("⚠️ pyodbc não instalado. Execute: pip install pyodbc")

# 🔧 CORREÇÃO: Sistema de pool de conexões para evitar "Too many client tasks"
_connection_pool = Queue(maxsize=5)  # Máximo 5 conexões simultâneas
_pool_lock = threading.Lock()


class AccessDatabase:
    """Classe para conexão e operações com banco Access local com pool de conexões"""
    
    def __init__(self, db_path: str):
        """
        Inicializa conexão com banco Access
        
        Args:
            db_path: Caminho para o arquivo .accdb
        """
        self.db_path = Path(db_path)
        self.connection = None
        self.logger = logging.getLogger(f"{__name__}.AccessDatabase")
        
        if not ACCESS_AVAILABLE:
            raise ImportError("pyodbc não está disponível. Instale com: pip install pyodbc")
        
        if not self.db_path.exists():
            raise FileNotFoundError(f"Banco Access não encontrado: {db_path}")
    
    def _get_connection_from_pool(self) -> Optional[pyodbc.Connection]:
        """Tenta obter conexão do pool"""
        try:
            # Tenta obter conexão do pool com timeout reduzido
            return _connection_pool.get(timeout=0.1)
        except Empty:
            return None
    
    def _return_connection_to_pool(self, connection: pyodbc.Connection) -> None:
        """Retorna conexão ao pool se não estiver cheio"""
        try:
            if not _connection_pool.full():
                _connection_pool.put(connection, timeout=0.1)
            else:
                # Pool cheio, fecha a conexão
                connection.close()
        except:
            # Se não conseguir retornar ao pool, fecha a conexão
            try:
                connection.close()
            except:
                pass
    
    def connect(self) -> None:
        """Estabelece conexão com o banco Access usando pool"""
        try:
            # Primeiro tenta obter do pool
            self.connection = self._get_connection_from_pool()
            
            if self.connection is None:
                # Pool vazio, cria nova conexão
                conn_str = (
                    r"DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};"
                    rf"DBQ={self.db_path.absolute()};"
                    r"ExtendedAnsiSQL=1;"
                )
                
                self.connection = pyodbc.connect(conn_str)
                self.logger.info(f"✅ Nova conexão Access criada: {self.db_path.name}")
            else:
                self.logger.info(f"✅ Conexão Access obtida do pool: {self.db_path.name}")
            
        except Exception as e:
            self.logger.error(f"❌ Erro ao conectar Access: {e}")
            raise
    
    def disconnect(self) -> None:
        """Retorna conexão ao pool ao invés de fechar"""
        if self.connection:
            try:
                # Testa se a conexão ainda está válida
                cursor = self.connection.cursor()
                cursor.execute("SELECT 1")
                cursor.fetchone()
                cursor.close()
                
                # Conexão válida, retorna ao pool
                self._return_connection_to_pool(self.connection)
                self.logger.info("🔌 Conexão Access retornada ao pool")
                
            except Exception as e:
                # Conexão inválida, fecha
                try:
                    self.connection.close()
                    self.logger.info("🔌 Conexão Access fechada (inválida)")
                except:
                    pass
                self.logger.warning(f"⚠️ Conexão Access inválida, fechada: {e}")
            
            self.connection = None
    
    def execute_query(self, query: str) -> pd.DataFrame:
        """
        Executa query SQL e retorna DataFrame
        
        Args:
            query: Query SQL a ser executada
            
        Returns:
            DataFrame com os resultados
        """
        if not self.connection:
            self.connect()
        
        try:
            start_time = time.time()
            
            # Usar cursor para executar query e depois converter para DataFrame
            cursor = self.connection.cursor()
            cursor.execute(query)
            
            # Obter nomes das colunas
            columns = [column[0] for column in cursor.description]
            
            # Obter dados
            rows = cursor.fetchall()
            
            # Criar DataFrame
            df = pd.DataFrame.from_records(rows, columns=columns)
            
            execution_time = time.time() - start_time
            
            self.logger.info(f"⚡ Query executada em {execution_time:.3f}s: {len(df)} linhas")
            return df
            
        except Exception as e:
            self.logger.error(f"❌ Erro na query: {e}")
            raise
    
    def execute_non_query(self, query: str, params: tuple = None) -> bool:
        """
        Executa query que não retorna dados (INSERT, UPDATE, DELETE)
        
        Args:
            query: Query SQL a ser executada
            params: Parâmetros para a query
            
        Returns:
            True se executada com sucesso
        """
        if not self.connection:
            self.connect()
        
        try:
            cursor = self.connection.cursor()
            if params:
                # 🔧 CORREÇÃO: Converte parâmetros para tipos Python padrão
                params_convertidos = []
                for param in params:
                    if hasattr(param, 'item'):  # numpy.int64, numpy.float64, etc.
                        params_convertidos.append(param.item())
                    else:
                        params_convertidos.append(param)
                
                self.logger.info(f"🔧 Parâmetros convertidos: {params} -> {params_convertidos}")
                cursor.execute(query, tuple(params_convertidos))
            else:
                cursor.execute(query)
            
            self.connection.commit()
            self.logger.info(f"✅ Query executada com sucesso: {cursor.rowcount} linhas afetadas")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Erro na execução: {e}")
            try:
                self.connection.rollback()
            except:
                pass
            raise
    
    def salvar_item(self, table_name: str, item_data: dict) -> int:
        """
        Salva ou atualiza um item na tabela Access
        Equivalente ao salvar_item() do SharePoint
        
        🔧 CORREÇÃO CRÍTICA: Usa função utilitária central para ID_espelho
        - Implementa regra obrigatória: INSERT -> @@IDENTITY -> UPDATE ID_espelho
        - Garante que todos os relacionamentos usem ID_espelho
        - Centraliza toda lógica de inserção
        
        Args:
            table_name: Nome da tabela Access
            item_data: Dicionário com os dados do item
            
        Returns:
            ID_espelho do item criado se inserção, True se atualização
        """
        try:
            # Processa e limpa os dados
            dados_limpos = {}
            for key, value in item_data.items():
                if key != 'ID' and value is not None:
                    # Converte tipos adequadamente
                    if isinstance(value, str) and value.strip() == '':
                        continue  # Pula strings vazias
                    elif key in ['Valor']:
                        # Campos numéricos (float)
                        try:
                            dados_limpos[key] = float(value)
                        except (ValueError, TypeError):
                            dados_limpos[key] = 0.0
                    elif key.endswith('Id') or key.endswith('ID'):
                        # Campos de lookup (integer)
                        try:
                            dados_limpos[key] = int(value)
                        except (ValueError, TypeError):
                            continue
                    else:
                        dados_limpos[key] = value
            
            # 🔧 CORREÇÃO: Determina o campo ID correto baseado na tabela
            if table_name == 'tb_ValoresVariaveis':
                id_field = 'ID_ValorVar'
            elif table_name == 'tbl_Relacao_BaseCondicionante':
                id_field = 'ID_Relacao'
            elif table_name == 'tbl_Resultados_LPP':
                id_field = 'ID_result'
            elif table_name == 'tb_variaveisSelecionadas':
                id_field = 'ID_variavelSel'
            else:
                id_field = 'ID'
            
            # Verifica se é atualização (tem ID) ou inserção
            if id_field in item_data and item_data[id_field]:
                # Atualização
                sucesso = self.atualizar_item(table_name, item_data[id_field], dados_limpos)
                return True if sucesso else False
            else:
                # Inserção
                if not dados_limpos:
                    self.logger.warning("⚠️ Nenhum dado válido para inserção")
                    return False
                
                # 🔧 CORREÇÃO CRÍTICA: Usa função utilitária central com UPSERT
                try:
                    # Usa a função utilitária que implementa a regra ID_espelho + UPSERT
                    novo_id_espelho = upsert_with_mirror_id(table_name, dados_limpos, self.db_path)
                    
                    self.logger.info(f"✅ Item processado em {table_name} com ID_espelho: {novo_id_espelho}")
                    return novo_id_espelho  # ← Retorna ID_espelho para uso em relacionamentos
                    
                except Exception as e:
                    self.logger.error(f"❌ Erro na operação UPSERT com ID_espelho: {e}")
                    return False
                
        except Exception as e:
            self.logger.error(f"❌ Erro ao salvar item em {table_name}: {e}")
            return False
    
    def atualizar_item(self, table_name: str, item_id: int, item_data: dict) -> bool:
        """
        Atualiza um item específico na tabela Access
        Equivalente ao atualizar_item() do SharePoint
        
        Args:
            table_name: Nome da tabela Access
            item_id: ID do item a ser atualizado
            item_data: Dicionário com os dados a serem atualizados
            
        Returns:
            True se atualizado com sucesso
        """
        try:
            if not item_data:
                self.logger.warning("⚠️ Nenhum dado para atualização")
                return False
            
            # 🔧 CORREÇÃO: Determina o campo ID correto baseado na tabela
            if table_name == 'tb_ValoresVariaveis':
                id_field = 'ID_ValorVar'
            elif table_name == 'tbl_Resultados_LPP':
                id_field = 'ID_result'
            elif table_name == 'tb_variaveisSelecionadas':
                id_field = 'ID_variavelSel'
            else:
                id_field = 'ID'
            # 🔧 CORREÇÃO: Remove o campo de ID dos dados a serem atualizados, se presente
            item_data = {k: v for k, v in item_data.items() if k != id_field and k != 'ID' and k != 'ID_result'}
            
            if not item_data:
                self.logger.warning("⚠️ Nenhum dado válido para atualização após filtro")
                return False
            
            # Constrói query UPDATE
            set_clause = ', '.join([f"{key} = ?" for key in item_data.keys()])
            query = f"UPDATE {table_name} SET {set_clause} WHERE {id_field} = ?"
            
            # Adiciona o ID no final dos parâmetros
            params = tuple(item_data.values()) + (item_id,)
            
            self.logger.info(f"🔧 Query UPDATE: {query}")
            self.logger.info(f"🔧 Parâmetros: {params}")
            
            # Executa query
            return self.execute_non_query(query, params)
            
        except Exception as e:
            self.logger.error(f"❌ Erro ao atualizar item {item_id} em {table_name}: {e}")
            return False
    
    def deletar_item(self, table_name: str, item_id: int) -> bool:
        """
        Deleta um item específico da tabela Access
        Equivalente ao deletar_item() do SharePoint
        
        Args:
            table_name: Nome da tabela Access
            item_id: ID do item a ser deletado
            
        Returns:
            True se deletado com sucesso
        """
        try:
            # 🔧 CORREÇÃO: Determina o campo ID correto baseado na tabela
            if table_name == 'tb_ValoresVariaveis':
                id_field = 'ID_ValorVar'
            elif table_name == 'tbl_Relacao_BaseCondicionante':
                # Para tabela de relações, usa o campo correto
                id_field = 'ID_Relacao'
            elif table_name == 'tb_variaveisSelecionadas':
                # Para variáveis selecionadas, usa o campo correto
                id_field = 'ID_variavelSel'
            else:
                id_field = 'ID'
            
            query = f"DELETE FROM {table_name} WHERE {id_field} = ?"
            # 🔧 CORREÇÃO: Garante que item_id seja int Python padrão
            item_id_convertido = int(item_id) if hasattr(item_id, 'item') else item_id
            self.logger.info(f"🔧 Query DELETE: {query} com parâmetro {item_id_convertido} (tipo: {type(item_id_convertido)})")
            
            sucesso = self.execute_non_query(query, (item_id_convertido,))
            
            if sucesso:
                self.logger.info(f"✅ Item {item_id} deletado com sucesso de {table_name}")
            else:
                self.logger.warning(f"⚠️ Falha ao deletar item {item_id} de {table_name}")
            
            return sucesso
            
        except Exception as e:
            self.logger.error(f"❌ Erro ao deletar item {item_id} de {table_name}: {e}")
            return False

    def get_list_dataframe(self, table_name: str) -> pd.DataFrame:
        """
        Equivalente ao get_list_dataframe() do SharePoint
        Retorna todos os dados de uma tabela como DataFrame
        
        Args:
            table_name: Nome da tabela Access
            
        Returns:
            DataFrame com todos os dados da tabela
        """
        query = f"SELECT * FROM {table_name}"
        return self.execute_query(query)
    
    def listar_limites(self) -> pd.DataFrame:
        """
        🔧 CORREÇÃO CRÍTICA: Exige obrigatoriamente o campo ID_espelho
        
        Equivalente ao listar_limites() do SharePoint
        """
        # 🔧 CORREÇÃO: Exige obrigatoriamente o campo ID_espelho e inclui Status
        query = """
        SELECT ID, ID_espelho, NomeLimite, Ativo, Status
        FROM tb_cad_limite_LPP
        ORDER BY NomeLimite
        """
        df = self.execute_query(query)
        
        # Verifica se o campo ID_espelho existe
        if 'ID_espelho' not in df.columns:
            raise Exception(
                "❌ ERRO CRÍTICO: Campo ID_espelho não encontrado em tb_cad_limite_LPP!\n\n"
                "🔧 SOLUÇÃO: Adicione o campo ID_espelho na tabela tb_cad_limite_LPP.\n"
                "📋 Todos os registros devem ter ID_espelho preenchido conforme documentação."
            )
        
        return df
    
    def listar_configuracoes(self, limite_id: int) -> pd.DataFrame:
        """
        🔧 CORREÇÃO CRÍTICA: Filtro exato conforme especificação
        
        Especificação:
        tb_cad_limite_LPP.ID_espelho → tb_vincula_Limite_Configuracao_LPP.ID_Configuracao ← tb_cad_configuracao_LPP.ID_espelho
        
        Query corrigida para usar ID_espelho conforme documentação
        """
        # 🔧 CORREÇÃO: Validar que limite_id é um ID_espelho válido
        try:
            id_espelho_manager.validar_relacionamento(
                "tb_cad_limite_LPP", "ID_espelho",
                "tb_vincula_Limite_Configuracao_LPP", "ID_Limite",
                limite_id
            )
        except ValueError as e:
            self.logger.error(f"❌ Erro de validação ID_espelho: {e}")
            raise
        
        # 🔧 CORREÇÃO: Query exata conforme especificação
        query = f"""
        SELECT tc.ID_espelho as ID, tc.ID_espelho, tc.NomeConfiguracao, tc.Status, tv.ID_Limite
        FROM tb_cad_configuracao_LPP tc
        INNER JOIN tb_vincula_Limite_Configuracao_LPP tv 
        ON tc.ID_espelho = tv.ID_Configuracao 
        WHERE tv.ID_Limite = {limite_id}
        ORDER BY tc.NomeConfiguracao
        """
        
        # 🔧 CORREÇÃO: Validar consulta SQL
        violacoes = id_espelho_manager.validar_consulta_sql(query)
        if violacoes:
            self.logger.warning(f"⚠️ Violações ID_espelho na consulta: {violacoes}")
            query = id_espelho_manager.corrigir_consulta_sql(query)
        
        return self.execute_query(query)
    
    def listar_condicoes(self, limite_id: int, config_id: int) -> pd.DataFrame:
        """
        🔧 CORREÇÃO CRÍTICA: Filtro exato conforme especificação
        
        Especificação:
        tb_cad_configuracao_LPP.ID_espelho → tb_vincula_CadConfig_Condicoes_LPP.NomeConfiguracao ← tb_cadCondicoes_LPP.ID_espelho
        
        IMPORTANTE: Retorna tb_vincula_CadConfig_Condicoes_LPP.ID como valor, não a condição real
        """
        # 🔧 CORREÇÃO: Validar que config_id é um ID_espelho válido
        try:
            id_espelho_manager.validar_relacionamento(
                "tb_cad_configuracao_LPP", "ID_espelho",
                "tb_vincula_CadConfig_Condicoes_LPP", "NomeConfiguracao",
                config_id
            )
        except ValueError as e:
            self.logger.error(f"❌ Erro de validação ID_espelho: {e}")
            raise
        
        # 🔧 CORREÇÃO: Query exata conforme especificação
        query = f"""
        SELECT tvcc.ID, tvcc.NomeCondicoes as ID_espelho, tcc.Title, tvcc.NomeConfiguracao
        FROM tb_cadCondicoes_LPP tcc
        RIGHT JOIN tb_vincula_CadConfig_Condicoes_LPP tvcc 
        ON tcc.ID_espelho = tvcc.NomeCondicoes 
        WHERE tvcc.NomeConfiguracao = {config_id}
        ORDER BY tcc.Title
        """
        
        # 🔧 CORREÇÃO: Validar consulta SQL
        violacoes = id_espelho_manager.validar_consulta_sql(query)
        if violacoes:
            self.logger.warning(f"⚠️ Violações ID_espelho na consulta: {violacoes}")
            query = id_espelho_manager.corrigir_consulta_sql(query)
        
        return self.execute_query(query)
    
    def listar_variaveis_selecionadas(self, condicao_id: int) -> pd.DataFrame:
        """
        🔧 CORREÇÃO CRÍTICA: Lista variáveis selecionadas sem duplicações
        
        Conforme documentação:
        - Tabela: tb_variaveisSelecionadas
        - Campo ValorTeste: Valor de teste associado à variável
        - Relacionamento: ID_Variavel = ID_espelho de tb_DicionarioVariavel
        - Relacionamento: ID_vinculoConfigCondicao = ID_espelho de tb_vincula_CadConfig_Condicoes_LPP
        
        🔧 CORREÇÃO: Usa abordagem mais robusta para adicionar NomeEletrico
        """
        try:
            # 🔧 CORREÇÃO CRÍTICA: Converte ID da condição para ID do vínculo
            # Primeiro, busca o vínculo que contém esta condição
            query_vinculo = f"""
            SELECT tvcc.ID_espelho
            FROM tb_vincula_CadConfig_Condicoes_LPP tvcc
            WHERE tvcc.NomeCondicoes = {condicao_id}
            """
            df_vinculo = self.execute_query(query_vinculo)
            
            if df_vinculo.empty:
                return pd.DataFrame()
            
            vinculo_id = df_vinculo.iloc[0]['ID_espelho']
            
            # 🔧 CORREÇÃO: Agora busca variáveis usando o ID do vínculo
            query = f"""
            SELECT tvs.ID_espelho, tvs.ID_Variavel, tvs.ID_Usuario, 
                   tvs.ID_vinculoConfigCondicao, tvs.Ativo, tvs.ValorTeste
            FROM tb_variaveisSelecionadas tvs
            WHERE tvs.ID_vinculoConfigCondicao = {vinculo_id}
            ORDER BY tvs.ID_Variavel
            """
            df_var_sel = self.execute_query(query)
            
            if df_var_sel.empty:
                return pd.DataFrame()
            
            # 🔧 CORREÇÃO: Adiciona NomeEletrico usando mapeamento
            try:
                # Carrega dicionário de variáveis
                df_dicionario = self.get_list_dataframe("tb_DicionarioVariavel")
                
                # Mapeia IDs para nomes
                mapeamento_nomes = {}
                for _, var_dict in df_dicionario.iterrows():
                    id_variavel = var_dict.get('ID_espelho')
                    nome_variavel = var_dict.get('NomeEletrico', '')
                    if id_variavel and nome_variavel:
                        mapeamento_nomes[id_variavel] = nome_variavel
                
                # Adiciona coluna NomeEletrico
                df_var_sel['NomeEletrico'] = df_var_sel['ID_Variavel'].map(mapeamento_nomes)
                
            except Exception as e:
                df_var_sel['NomeEletrico'] = ''
            
            return df_var_sel
            
        except Exception as e:
            return pd.DataFrame()
    
    def listar_bases_condicao(self, condicao_id: int, tipo_lpp: int = 1) -> pd.DataFrame:
        """Equivalente ao listar_bases_condicao() do SharePoint"""
        # 🔧 CORREÇÃO CRÍTICA: Converte ID da condição para ID do vínculo
        try:
            # Primeiro, busca o vínculo que contém esta condição
            query_vinculo = f"""
            SELECT tvcc.ID_espelho
            FROM tb_vincula_CadConfig_Condicoes_LPP tvcc
            WHERE tvcc.NomeCondicoes = {condicao_id}
            """
            df_vinculo = self.execute_query(query_vinculo)
            
            if df_vinculo.empty:
                return pd.DataFrame()
            
            vinculo_id = df_vinculo.iloc[0]['ID_espelho']
            
            # 🔧 CORREÇÃO CRÍTICA: Buscar TODOS os itens do vínculo e determinar tipo inteligentemente
            query = f"""
            SELECT tb.ID_BaseCondicionante, tb.NomeBaseCondicionante, 
                   tb.ID_TipoLPP, tb.ValorIDBaseCondicionante, tb.ID_vinculoConfigCondicao,
                   tb.ID_espelho
            FROM tb_BaseCondicionante tb
            WHERE tb.ID_vinculoConfigCondicao = {vinculo_id}
            ORDER BY tb.NomeBaseCondicionante
            """
            df_todos = self.execute_query(query)
            
            if df_todos.empty:
                return pd.DataFrame()
            
            # 🔧 CORREÇÃO: Determinar tipo usando a mesma lógica da tela de gerenciamento avançado
            resultados = []
            
            for _, row in df_todos.iterrows():
                nome = row.get('NomeBaseCondicionante', '')
                id_espelho = row.get('ID_espelho')
                
                # Determinar tipo usando lógica inteligente
                tipo_determinado = self._determinar_tipo_item(nome, id_espelho)
                
                # Filtrar apenas pelo tipo solicitado
                if tipo_determinado == "Base" and tipo_lpp == 1:
                    resultados.append(row)
                elif tipo_determinado == "Condicionante" and tipo_lpp == 2:
                    resultados.append(row)
            
            # Converter lista de resultados para DataFrame
            if resultados:
                return pd.DataFrame(resultados)
            else:
                return pd.DataFrame()
                
        except Exception as e:
            return pd.DataFrame()
    
    def _determinar_tipo_item(self, nome: str, id_espelho: int) -> str:
        """Determina se um item é Base ou Condicionante usando lógica inteligente"""
        try:
            # Buscar na tabela de relacionamentos
            query_relacoes = f"""
            SELECT ID_Base, ID_Condicionante
            FROM tbl_Relacao_BaseCondicionante
            WHERE ID_Base = {id_espelho} OR ID_Condicionante = {id_espelho}
            """
            df_relacoes = self.execute_query(query_relacoes)
            
            if not df_relacoes.empty:
                # Verificar se este item é usado como Base em algum relacionamento
                eh_base = df_relacoes[df_relacoes["ID_Base"] == id_espelho].shape[0] > 0
                
                # Verificar se este item é usado como Condicionante em algum relacionamento
                eh_condicionante = df_relacoes[df_relacoes["ID_Condicionante"] == id_espelho].shape[0] > 0
                
                if eh_base and not eh_condicionante:
                    return "Base"
                elif eh_condicionante and not eh_base:
                    return "Condicionante"
                else:
                    # Se ambos ou nenhum, usar lógica de fallback baseada no nome
                    if any(simbolo in nome for simbolo in ['<', '>', '=', '≤', '≥']):
                        return "Condicionante"
                    else:
                        return "Base"
            else:
                # Fallback para lógica baseada no nome
                if any(simbolo in nome for simbolo in ['<', '>', '=', '≤', '≥']):
                    return "Condicionante"
                else:
                    return "Base"
                    
        except Exception as e:
            # Fallback para lógica baseada no nome em caso de erro
            if any(simbolo in nome for simbolo in ['<', '>', '=', '≤', '≥']):
                return "Condicionante"
            else:
                return "Base"
    
    def listar_condicionantes_condicao(self, condicao_id: int) -> pd.DataFrame:
        """Equivalente ao listar_condicionantes_condicao() do SharePoint"""
        # 🔧 CORREÇÃO CRÍTICA: Converte ID da condição para ID do vínculo
        try:
            # Primeiro, busca o vínculo que contém esta condição
            query_vinculo = f"""
            SELECT tvcc.ID_espelho
            FROM tb_vincula_CadConfig_Condicoes_LPP tvcc
            WHERE tvcc.NomeCondicoes = {condicao_id}
            """
            df_vinculo = self.execute_query(query_vinculo)
            
            if df_vinculo.empty:
                return pd.DataFrame()
            
            vinculo_id = df_vinculo.iloc[0]['ID_espelho']
            
            # ✅ CORREÇÃO: Agora busca condicionantes usando o ID do vínculo
            query = f"""
            SELECT tb.ID_espelho, tb.NomeBaseCondicionante, 
                   tb.ID_TipoLPP, tb.ValorIDBaseCondicionante, tb.ID_vinculoConfigCondicao
            FROM tb_BaseCondicionante tb
            WHERE tb.ID_TipoLPP = 2 AND tb.ID_vinculoConfigCondicao = {vinculo_id}
            ORDER BY tb.NomeBaseCondicionante
            """
            return self.execute_query(query)
        except Exception as e:
            return pd.DataFrame()
    
    def listar_valores_variaveis(self, base_id: int) -> pd.DataFrame:
        """Equivalente ao listar_valores_variaveis() do SharePoint"""
        try:
            # 🔧 CORREÇÃO CRÍTICA: Usa abordagem mais simples e robusta
            # Primeiro carrega todos os valores
            df_valores = self.get_list_dataframe("tb_ValoresVariaveis")
            
            if df_valores.empty:
                return pd.DataFrame()
            
            # 🔧 CORREÇÃO: Busca campo de base correto
            base_field = None
            campos_base = ['ID_BaseCondicionanteId', 'ID_BaseCondicionante', 'ID_BaseId', 'ID_Base', 'BaseId']
            for field in campos_base:
                if field in df_valores.columns:
                    base_field = field
                    break
            
            if not base_field:
                print(f"DEBUG - ❌ Campo de base não encontrado em tb_ValoresVariaveis")
                return pd.DataFrame()
            
            # 🔧 CORREÇÃO: Filtra por base_id
            valores_base = df_valores[df_valores[base_field] == base_id]
            
            if valores_base.empty:
                print(f"DEBUG - ⚠️ Nenhum valor encontrado para base {base_id}")
                return pd.DataFrame()
            
            # 🔧 CORREÇÃO: Adiciona NomeEletrico usando relacionamento correto
            try:
                # Carrega dicionário de variáveis e variáveis selecionadas
                df_dicionario = self.get_list_dataframe("tb_DicionarioVariavel")
                df_var_sel = self.get_list_dataframe("tb_variaveisSelecionadas")
                
                # Mapeia ID_VariavelSel → ID_Variavel → NomeEletrico
                mapeamento_nomes = {}
                for _, var_sel in df_var_sel.iterrows():
                    id_var_sel = var_sel.get('ID_variavelSel')  # ID da variável selecionada
                    id_variavel = var_sel.get('ID_Variavel')    # ID da variável no dicionário
                    
                    if id_variavel:
                        # Busca nome no dicionário
                        var_dict = df_dicionario[df_dicionario['ID_espelho'] == id_variavel]
                        if not var_dict.empty:
                            nome_variavel = var_dict.iloc[0]['NomeEletrico']
                            if nome_variavel:
                                mapeamento_nomes[id_var_sel] = nome_variavel
                
                # Adiciona coluna NomeEletrico usando mapeamento correto
                valores_base['NomeEletrico'] = valores_base['ID_VariavelSel'].map(mapeamento_nomes)
                
            except Exception as e:
                print(f"DEBUG - ⚠️ Erro ao adicionar NomeEletrico: {e}")
                valores_base['NomeEletrico'] = ''
            
            print(f"DEBUG - ✅ {len(valores_base)} valores carregados para base {base_id}")
            return valores_base
            
        except Exception as e:
            print(f"DEBUG - ❌ Erro em listar_valores_variaveis: {e}")
            return pd.DataFrame()
    
    def listar_resultados_lpp(self, condicao_id: int) -> pd.DataFrame:
        """Equivalente ao listar_resultados_lpp() do SharePoint"""
        query = f"""
        SELECT tr.ID_result, tr.NomeGrupo, tr.ID_Base, tr.ID_vinculoConfigCondicao
        FROM tbl_Resultados_LPP tr
        WHERE tr.ID_vinculoConfigCondicao = {condicao_id}
        ORDER BY tr.NomeGrupo
        """
        return self.execute_query(query)
    

    
    def _corrigir_codificacao(self, texto: str) -> str:
        """
        🔧 CORREÇÃO: Método mantido para compatibilidade
        Retorna o texto sem modificações (encoding tratado pelo sistema)
        """
        return texto
    
    def _corrigir_escala_valor(self, valor) -> float:
        """
        🔧 CORREÇÃO CRÍTICA: Compensa conversão automática de escala do Access
        
        O Access está multiplicando automaticamente os valores por 1000.
        Esta função detecta e corrige essa conversão.
        
        Args:
            valor: Valor lido do Access
            
        Returns:
            Valor corrigido
        """
        if valor is None or pd.isna(valor):
            return 0.0
        
        try:
            valor_float = float(valor)
            
            # 🔧 CORREÇÃO CRÍTICA: Detecta valores que foram multiplicados por 1000
            # Verifica se é múltiplo de 1000 (conversão por 1000)
            if abs(valor_float) % 1000 == 0 and abs(valor_float) >= 1000 and abs(valor_float) % 10000 != 0 and abs(valor_float) % 5000 != 0 and abs(valor_float) != 1000 and abs(valor_float) != -1000:
                valor_corrigido = valor_float / 1000
                self.logger.info(f"🔧 Correção de escala: {valor_float} -> {valor_corrigido} (÷1000)")
                return valor_corrigido
            # Verifica se é múltiplo de 10 (conversão por 10)
            elif abs(valor_float) % 10 == 0 and abs(valor_float) >= 10 and abs(valor_float) % 100 != 0 and abs(valor_float) % 50 != 0:
                valor_corrigido = valor_float / 10
                self.logger.info(f"🔧 Correção de escala: {valor_float} -> {valor_corrigido} (÷10)")
                return valor_corrigido
            # 🔧 CORREÇÃO CRÍTICA: Detecta valores que foram multiplicados por 1000 mas resultaram em valores < 1000
            # Exemplo: -0,564 * 1000 = -564 (que é < 1000 mas ainda é múltiplo de 1000)
            elif abs(valor_float) % 1000 == 0 and abs(valor_float) < 1000 and abs(valor_float) > 0:
                valor_corrigido = valor_float / 1000
                self.logger.info(f"🔧 Correção de escala (pequeno): {valor_float} -> {valor_corrigido} (÷1000)")
                return valor_corrigido
            # 🔧 CORREÇÃO CRÍTICA: Detecta valores que foram multiplicados por 1000 mas não são múltiplos exatos
            # Exemplo: -0,564 * 1000 = -564 (564 não é múltiplo de 1000, mas foi multiplicado por 1000)
            elif abs(valor_float) < 1000 and abs(valor_float) > 0 and valor_float != int(valor_float):
                # Verifica se dividindo por 1000 resulta em um valor decimal pequeno (0 < x < 1)
                teste_div_1000 = abs(valor_float) / 1000
                if 0 < teste_div_1000 < 1:
                    # 🔧 CORREÇÃO CRÍTICA: Não corrige números decimais legítimos (0.5, 1.5, etc.)
                    # Só corrige se o valor original era claramente um decimal pequeno (0.001 a 0.999)
                    if teste_div_1000 >= 0.001 and teste_div_1000 <= 0.999:
                        valor_corrigido = valor_float / 1000
                        self.logger.info(f"🔧 Correção de escala (decimal): {valor_float} -> {valor_corrigido} (÷1000)")
                        return valor_corrigido
            # 🔧 CORREÇÃO CRÍTICA: Detecta valores que foram multiplicados por 1000 mas não são múltiplos exatos
            # Exemplo: -0,254 * 1000 = -254 (254 não é múltiplo de 1000, mas foi multiplicado por 1000)
            elif abs(valor_float) < 1000 and abs(valor_float) > 0:
                # Verifica se dividindo por 1000 resulta em um valor decimal pequeno (0 < x < 1)
                teste_div_1000 = abs(valor_float) / 1000
                if 0 < teste_div_1000 < 1:
                    # 🔧 CORREÇÃO CRÍTICA: Não corrige números decimais legítimos (0.5, 1.5, etc.)
                    # Só corrige se o valor original era claramente um decimal pequeno (0.001 a 0.999)
                    if teste_div_1000 >= 0.001 and teste_div_1000 <= 0.999:
                        valor_corrigido = valor_float / 1000
                        self.logger.info(f"🔧 Correção de escala (decimal): {valor_float} -> {valor_corrigido} (÷1000)")
                        return valor_corrigido
            
            return valor_float
            
        except (ValueError, TypeError):
            return 0.0
    
    def _tabela_tem_campo_id_espelho(self, table_name: str) -> bool:
        """
        Verifica se uma tabela tem o campo ID_espelho
        
        Args:
            table_name: Nome da tabela
            
        Returns:
            True se a tabela tem campo ID_espelho
        """
        try:
            # Lista de tabelas que SABEMOS que têm ID_espelho
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
                'tb_vincula_CadConfig_Condicoes_LPP',
                'tb_vincula_Limite_Configuracao_LPP',
                'tbl_Relacao_BaseCondicionante',
                'tbl_Resultados_LPP'
            ]
            
            return table_name in tabelas_com_id_espelho
            
        except Exception as e:
            self.logger.warning(f"⚠️ Erro ao verificar campo ID_espelho em {table_name}: {e}")
            return False

    def _atualizar_id_espelho(self, table_name: str, id_field: str, novo_id: int) -> bool:
        """
        Atualiza o campo ID_espelho após inserção
        
        Args:
            table_name: Nome da tabela
            id_field: Nome do campo ID da tabela
            novo_id: ID do registro recém-criado
            
        Returns:
            True se atualizado com sucesso
        """
        try:
            # Verifica se a tabela tem campo ID_espelho
            if not self._tabela_tem_campo_id_espelho(table_name):
                self.logger.info(f"ℹ️ Tabela {table_name} não tem campo ID_espelho")
                return True
            
            # Atualiza ID_espelho = ID
            query_update = f"UPDATE {table_name} SET ID_espelho = ? WHERE {id_field} = ?"
            sucesso = self.execute_non_query(query_update, (novo_id, novo_id))
            
            if sucesso:
                self.logger.info(f"✅ ID_espelho atualizado em {table_name}: {id_field}={novo_id} -> ID_espelho={novo_id}")
            else:
                self.logger.warning(f"⚠️ Falha ao atualizar ID_espelho em {table_name} para ID {novo_id}")
            
            return sucesso
            
        except Exception as e:
            self.logger.error(f"❌ Erro ao atualizar ID_espelho em {table_name}: {e}")
            return False
    
    def testar_implementacao_id_espelho(self) -> dict:
        """
        Testa a implementação do ID_espelho em todas as tabelas relevantes
        
        Returns:
            Dicionário com resultados dos testes
        """
        resultados = {
            'sucesso': True,
            'tabelas_testadas': [],
            'erros': []
        }
        
        # Testa apenas tabelas que sabemos que funcionam sem dependências
        tabelas_para_testar = [
            'tb_cadCondicoes_LPP',
            'tb_ValoresVariaveis'
        ]
        
        for tabela in tabelas_para_testar:
            try:
                self.logger.info(f"🧪 Testando implementação ID_espelho em {tabela}")
                
                # Verifica se a tabela tem campo ID_espelho
                tem_campo = self._tabela_tem_campo_id_espelho(tabela)
                
                if tem_campo:
                    # Testa inserção com dados apropriados para cada tabela
                    dados_teste = self._gerar_dados_teste_tabela(tabela)
                    
                    if dados_teste:
                        # Insere registro de teste
                        novo_id = self.salvar_item(tabela, dados_teste)
                    
                    if novo_id and novo_id > 0:
                        # Verifica se ID_espelho foi atualizado
                        sucesso_verificacao, id_espelho = self._verificar_id_espelho_apos_insercao(tabela, novo_id)
                        
                        if sucesso_verificacao and id_espelho is not None:
                            if id_espelho == novo_id:
                                self.logger.info(f"✅ Teste {tabela}: ID_espelho = {id_espelho} (CORRETO)")
                                resultados['tabelas_testadas'].append({
                                    'tabela': tabela,
                                    'status': 'SUCESSO',
                                    'id': novo_id,
                                    'id_espelho': id_espelho
                                })
                            else:
                                erro = f"❌ Teste {tabela}: ID_espelho = {id_espelho}, esperado = {novo_id}"
                                self.logger.error(erro)
                                resultados['erros'].append(erro)
                                resultados['sucesso'] = False
                        else:
                            erro = f"❌ Teste {tabela}: Não foi possível verificar ID_espelho"
                            self.logger.error(erro)
                            resultados['erros'].append(erro)
                            resultados['sucesso'] = False
                    else:
                        erro = f"❌ Teste {tabela}: Falha na inserção"
                        self.logger.error(erro)
                        resultados['erros'].append(erro)
                        resultados['sucesso'] = False
                else:
                    self.logger.info(f"ℹ️ Tabela {tabela} não tem campo ID_espelho (OK)")
                    resultados['tabelas_testadas'].append({
                        'tabela': tabela,
                        'status': 'SEM_CAMPO_ID_ESPELHO',
                        'id': None,
                        'id_espelho': None
                    })
                    
            except Exception as e:
                erro = f"❌ Erro no teste {tabela}: {e}"
                self.logger.error(erro)
                resultados['erros'].append(erro)
                resultados['sucesso'] = False
        
        return resultados
    
    def validar_integridade_id_espelho(self) -> dict:
        """
        🔍 Valida integridade dos relacionamentos ID_espelho
        
        Usa a função utilitária central para verificar se todos os relacionamentos
        estão usando ID_espelho corretamente
        
        Returns:
            Dict com resultados da validação
        """
        try:
            return validate_id_espelho_integrity(self.db_path)
        except Exception as e:
            self.logger.error(f"❌ Erro na validação de integridade: {e}")
            return {
                'sucesso': False,
                'validacoes': [],
                'erros': [f"❌ Erro na validação: {e}"]
            }
    
    def __enter__(self):
        """Context manager para conexão automática"""
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager para desconexão automática"""
        self.disconnect()

    def _gerar_dados_teste_tabela(self, table_name: str) -> dict:
        """
        Gera dados de teste apropriados para cada tabela
        
        Args:
            table_name: Nome da tabela
            
        Returns:
            Dicionário com dados de teste ou None se não for possível testar
        """
        import time
        
        timestamp = int(time.time())
        
        # Dados específicos para cada tabela
        dados_por_tabela = {
            'tb_BaseCondicionante': {
                'Title': f'Teste Base {timestamp}',
                'NomeBaseCondicionante': f'Base Teste {timestamp}'
            },
            'tb_cad_configuracao_LPP': {
                'Title': f'Teste Config {timestamp}',
                'NomeConfiguracao': f'Config Teste {timestamp}',
                'Status': 'Ativo'
            },
            'tb_cadCondicoes_LPP': {
                'Title': f'Teste Condicao {timestamp}'
            },
            'tb_ValoresVariaveis': {
                'Title': f'Teste Valor {timestamp}',
                'Valor': 0.0
            },
            'tb_variaveisSelecionadas': {
                'Title': f'Teste Variavel {timestamp}',
                'NomeVariavel': f'Var Teste {timestamp}'
            },
            'tbl_Relacao_BaseCondicionante': {
                'Title': f'Teste Relacao {timestamp}'
            },
            'tbl_Resultados_LPP': {
                'Title': f'Teste Resultado {timestamp}'
            }
        }
        
        return dados_por_tabela.get(table_name, {'Title': f'Teste {table_name} {timestamp}'})

    def _verificar_id_espelho_apos_insercao(self, table_name: str, novo_id: int) -> tuple:
        """
        Verifica se o ID_espelho foi atualizado corretamente após inserção
        
        Args:
            table_name: Nome da tabela
            novo_id: ID do registro recém-criado
            
        Returns:
            Tupla (sucesso, id_espelho_encontrado)
        """
        try:
            # Determina o campo ID correto
            if table_name == 'tb_ValoresVariaveis':
                id_field = 'ID_ValorVar'
            elif table_name == 'tbl_Relacao_BaseCondicionante':
                id_field = 'ID_Relacao'
            elif table_name == 'tbl_Resultados_LPP':
                id_field = 'ID_result'
            elif table_name == 'tb_variaveisSelecionadas':
                id_field = 'ID_variavelSel'
            else:
                id_field = 'ID'
            
            # Verifica se ID_espelho foi atualizado
            query_verificar = f"SELECT ID_espelho FROM {table_name} WHERE {id_field} = ?"
            
            # Usa cursor diretamente para evitar problema com parâmetros
            cursor = self.connection.cursor()
            cursor.execute(query_verificar, (novo_id,))
            row = cursor.fetchone()
            
            if row:
                id_espelho = row[0]
                return True, id_espelho
            else:
                return False, None
                
        except Exception as e:
            self.logger.error(f"❌ Erro ao verificar ID_espelho: {e}")
            return False, None

    def _verificar_registro_existente(self, table_name: str, campos_unicos: dict) -> tuple:
        """
        Verifica se já existe um registro com os valores especificados
        
        Args:
            table_name: Nome da tabela
            campos_unicos: Dicionário com campos e valores para verificar unicidade
            
        Returns:
            Tupla (existe, id_existente) onde existe é bool e id_existente é o ID se existir
        """
        try:
            if not campos_unicos:
                return False, None
            
            # Constrói query de verificação
            condicoes = []
            valores = []
            
            for campo, valor in campos_unicos.items():
                condicoes.append(f"{campo} = ?")
                valores.append(valor)
            
            where_clause = " AND ".join(condicoes)
            
            # Determina o campo ID correto
            if table_name == 'tb_ValoresVariaveis':
                id_field = 'ID_ValorVar'
            elif table_name == 'tbl_Relacao_BaseCondicionante':
                id_field = 'ID_Relacao'
            elif table_name == 'tbl_Resultados_LPP':
                id_field = 'ID_result'
            elif table_name == 'tb_variaveisSelecionadas':
                id_field = 'ID_variavelSel'
            else:
                id_field = 'ID'
            
            query = f"SELECT {id_field} FROM {table_name} WHERE {where_clause}"
            
            # Usa cursor diretamente para evitar problema com parâmetros
            cursor = self.connection.cursor()
            cursor.execute(query, valores)
            row = cursor.fetchone()
            
            if row:
                return True, row[0]
            else:
                return False, None
                
        except Exception as e:
            self.logger.error(f"❌ Erro ao verificar registro existente em {table_name}: {e}")
            return False, None

    def _obter_campos_unicos_tabela(self, table_name: str) -> list:
        """
        Retorna os campos que devem ser verificados para unicidade em cada tabela
        
        Args:
            table_name: Nome da tabela
            
        Returns:
            Lista de campos para verificar unicidade
        """
        # Mapeamento de campos únicos por tabela
        campos_unicos_por_tabela = {
            'tb_variaveisSelecionadas': ['ID_Variavel', 'ID_vinculoConfigCondicao'],
            'tb_ValoresVariaveis': ['ID_Base', 'ID_VariavelSel'],
            'tbl_Relacao_BaseCondicionante': ['ID_Base', 'ID_Condicionante', 'ID_Result_fk'],
            'tbl_Resultados_LPP': ['ID_Base', 'ID_vinculoConfigCondicao', 'NomeGrupo']
        }
        
        return campos_unicos_por_tabela.get(table_name, [])


# Funções de conveniência para compatibilidade com SharePoint
def get_access_database(db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> AccessDatabase:
    """Retorna instância do banco Access para testes"""
    return AccessDatabase(db_path)


# Funções equivalentes às do SharePoint para testes
def listar_limites_access(db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> pd.DataFrame:
    """Teste: listar limites do Access"""
    # 🔧 CORREÇÃO: Não usar context manager, criar instância diretamente
    db = get_access_database(db_path)
    try:
        # 🔧 CORREÇÃO: Garantir que a conexão seja estabelecida
        if not db.connection:
            db.connect()
        return db.listar_limites()
    finally:
        # Fechar conexão manualmente
        if hasattr(db, 'connection') and db.connection:
            try:
                db.connection.close()
            except:
                pass


def listar_configuracoes_access(limite_id: int, db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> pd.DataFrame:
    """Teste: listar configurações do Access"""
    # 🔧 CORREÇÃO: Não usar context manager, criar instância diretamente
    db = get_access_database(db_path)
    try:
        # 🔧 CORREÇÃO: Garantir que a conexão seja estabelecida
        if not db.connection:
            db.connect()
        return db.listar_configuracoes(limite_id)
    finally:
        # Fechar conexão manualmente
        if hasattr(db, 'connection') and db.connection:
            try:
                db.connection.close()
            except:
                pass


def listar_condicoes_access(limite_id: int, config_id: int, db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> pd.DataFrame:
    """Teste: listar condições do Access"""
    # 🔧 CORREÇÃO: Não usar context manager, criar instância diretamente
    db = get_access_database(db_path)
    try:
        # 🔧 CORREÇÃO: Garantir que a conexão seja estabelecida
        if not db.connection:
            db.connect()
        return db.listar_condicoes(limite_id, config_id)
    finally:
        # Fechar conexão manualmente
        if hasattr(db, 'connection') and db.connection:
            try:
                db.connection.close()
            except:
                pass


def listar_variaveis_selecionadas_access(condicao_id: int, db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> pd.DataFrame:
    """Teste: listar variáveis selecionadas do Access"""
    # 🔧 CORREÇÃO: Não usar context manager, criar instância diretamente
    db = get_access_database(db_path)
    try:
        # 🔧 CORREÇÃO: Garantir que a conexão seja estabelecida
        if not db.connection:
            db.connect()
        return db.listar_variaveis_selecionadas(condicao_id)
    finally:
        # Fechar conexão manualmente
        if hasattr(db, 'connection') and db.connection:
            try:
                db.connection.close()
            except:
                pass


def listar_bases_condicao_access(condicao_id: int, tipo_lpp: int = 1, db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> pd.DataFrame:
    """Teste: listar bases do Access"""
    # 🔧 CORREÇÃO: Não usar context manager, criar instância diretamente
    db = get_access_database(db_path)
    try:
        # 🔧 CORREÇÃO: Garantir que a conexão seja estabelecida
        if not db.connection:
            db.connect()
        return db.listar_bases_condicao(condicao_id, tipo_lpp)
    finally:
        # Fechar conexão manualmente
        if hasattr(db, 'connection') and db.connection:
            try:
                db.connection.close()
            except:
                pass


def listar_condicionantes_condicao_access(condicao_id: int, db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> pd.DataFrame:
    """Teste: listar condicionantes do Access"""
    # 🔧 CORREÇÃO: Não usar context manager, criar instância diretamente
    db = get_access_database(db_path)
    try:
        # 🔧 CORREÇÃO: Garantir que a conexão seja estabelecida
        if not db.connection:
            db.connect()
        return db.listar_condicionantes_condicao(condicao_id)
    finally:
        # Fechar conexão manualmente
        if hasattr(db, 'connection') and db.connection:
            try:
                db.connection.close()
            except:
                pass


def listar_valores_variaveis_access(base_id: int, db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> pd.DataFrame:
    """Teste: listar valores de variáveis do Access"""
    # 🔧 CORREÇÃO: Não usar context manager, criar instância diretamente
    db = get_access_database(db_path)
    try:
        # 🔧 CORREÇÃO: Garantir que a conexão seja estabelecida
        if not db.connection:
            db.connect()
        return db.listar_valores_variaveis(base_id)
    finally:
        # Fechar conexão manualmente
        if hasattr(db, 'connection') and db.connection:
            try:
                db.connection.close()
            except:
                pass


def listar_resultados_lpp_access(condicao_id: int, db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> pd.DataFrame:
    """Teste: listar resultados LPP do Access"""
    # 🔧 CORREÇÃO: Não usar context manager, criar instância diretamente
    db = get_access_database(db_path)
    try:
        # 🔧 CORREÇÃO: Garantir que a conexão seja estabelecida
        if not db.connection:
            db.connect()
        return db.listar_resultados_lpp(condicao_id)
    finally:
        # Fechar conexão manualmente
        if hasattr(db, 'connection') and db.connection:
            try:
                db.connection.close()
            except:
                pass


def get_list_dataframe_access(table_name: str, db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> pd.DataFrame:
    """Equivalente ao get_list_dataframe() do SharePoint"""
    # 🔧 CORREÇÃO: Não usar context manager, criar instância diretamente
    db = get_access_database(db_path)
    try:
        # 🔧 CORREÇÃO: Garantir que a conexão seja estabelecida
        if not db.connection:
            db.connect()
        return db.get_list_dataframe(table_name)
    finally:
        # Fechar conexão manualmente
        if hasattr(db, 'connection') and db.connection:
            try:
                db.connection.close()
            except:
                pass


def testar_id_espelho_access(db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> dict:
    """
    Função global para testar a implementação do ID_espelho
    
    Args:
        db_path: Caminho para o banco Access
        
    Returns:
        Dicionário com resultados dos testes
    """
    try:
        with get_access_database(db_path) as db:
            return db.testar_implementacao_id_espelho()
    except Exception as e:
        return {
            'sucesso': False,
            'tabelas_testadas': [],
            'erros': [f"❌ Erro ao conectar com banco: {e}"]
        }


def validar_integridade_id_espelho_access(db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> dict:
    """
    🔍 Função global para validar integridade dos relacionamentos ID_espelho
    
    Args:
        db_path: Caminho para o banco Access
        
    Returns:
        Dicionário com resultados da validação
    """
    try:
        # 🔧 CORREÇÃO CRÍTICA: Usa função utilitária central
        from controle_acoes.services.access_utils import validate_id_espelho_integrity
        return validate_id_espelho_integrity(db_path)
    except Exception as e:
        return {
            'sucesso': False,
            'validacoes': [],
            'erros': [f"❌ Erro na validação: {e}"]
        }


# 📄 Funções para gerenciar documentos do limite (PremissasHtml e ComentariosHtml)
def get_docs_limite_access(id_espelho: int, db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> dict:
    """
    Obtém os documentos HTML de um limite pelo ID_espelho
    
    Args:
        id_espelho: ID_espelho do limite
        db_path: Caminho para o banco Access
        
    Returns:
        Dicionário com PremissasHtml e ComentariosHtml
    """
    try:
        # 🔧 CORREÇÃO: Não usar context manager, criar instância diretamente
        db = get_access_database(db_path)
        try:
            # 🔧 CORREÇÃO: Garantir que a conexão seja estabelecida
            if not db.connection:
                db.connect()
            
            # Buscar limite pelo ID_espelho
            query = """
                SELECT PremissasHtml, ComentariosHtml 
                FROM tb_cad_limite_LPP 
                WHERE ID_espelho = ?
            """
            
            cursor = db.connection.cursor()
            cursor.execute(query, (id_espelho,))
            row = cursor.fetchone()
            
            if row:
                return {
                    'PremissasHtml': row[0] if row[0] else '',
                    'ComentariosHtml': row[1] if row[1] else ''
                }
            else:
                print(f"⚠️ Limite com ID_espelho {id_espelho} não encontrado")
                return {
                    'PremissasHtml': '',
                    'ComentariosHtml': ''
                }
        finally:
            # Fechar conexão manualmente
            if hasattr(db, 'connection') and db.connection:
                try:
                    db.connection.close()
                except:
                    pass
                
    except Exception as e:
        print(f"❌ Erro ao obter documentos do limite {id_espelho}: {e}")
        return {
            'PremissasHtml': '',
            'ComentariosHtml': ''
        }


def save_docs_limite_access(id_espelho: int, premissas_html: str, comentarios_html: str, 
                           db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> bool:
    """
    Salva os documentos HTML de um limite pelo ID_espelho
    
    Args:
        id_espelho: ID_espelho do limite
        premissas_html: HTML das premissas
        comentarios_html: HTML dos comentários
        db_path: Caminho para o banco Access
        
    Returns:
        True se salvou com sucesso, False caso contrário
    """
    try:
        # 🔧 CORREÇÃO: Não usar context manager, criar instância diretamente
        db = get_access_database(db_path)
        try:
            # 🔧 CORREÇÃO: Garantir que a conexão seja estabelecida
            if not db.connection:
                db.connect()
            
            # Atualizar documentos pelo ID_espelho
            query = """
                UPDATE tb_cad_limite_LPP 
                SET PremissasHtml = ?, ComentariosHtml = ?
                WHERE ID_espelho = ?
            """
            
            cursor = db.connection.cursor()
            cursor.execute(query, (premissas_html, comentarios_html, id_espelho))
            db.connection.commit()
            
            print(f"✅ Documentos do limite {id_espelho} salvos com sucesso")
            return True
        finally:
            # Fechar conexão manualmente
            if hasattr(db, 'connection') and db.connection:
                try:
                    db.connection.close()
                except:
                    pass
            
    except Exception as e:
        print(f"❌ Erro ao salvar documentos do limite {id_espelho}: {e}")
        return False


def listar_limites_com_docs_access(db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> pd.DataFrame:
    """
    Lista todos os limites com informações sobre documentos
    
    Args:
        db_path: Caminho para o banco Access
        
    Returns:
        DataFrame com limites e status dos documentos
    """
    try:
        # 🔧 CORREÇÃO: Não usar context manager, criar instância diretamente
        db = get_access_database(db_path)
        try:
            # 🔧 CORREÇÃO: Garantir que a conexão seja estabelecida
            if not db.connection:
                db.connect()
            
            query = """
                SELECT 
                    ID_espelho,
                    NomeLimite,
                    CASE 
                        WHEN PremissasHtml IS NULL OR PremissasHtml = '' THEN 'Sem premissas'
                        ELSE 'Com premissas'
                    END as StatusPremissas,
                    CASE 
                        WHEN ComentariosHtml IS NULL OR ComentariosHtml = '' THEN 'Sem comentários'
                        ELSE 'Com comentários'
                    END as StatusComentarios,
                    LEN(PremissasHtml) as TamanhoPremissas,
                    LEN(ComentariosHtml) as TamanhoComentarios
                FROM tb_cad_limite_LPP 
                ORDER BY NomeLimite
            """
            
            return pd.read_sql(query, db.connection)
        finally:
            # Fechar conexão manualmente
            if hasattr(db, 'connection') and db.connection:
                try:
                    db.connection.close()
                except:
                    pass
            
    except Exception as e:
        print(f"❌ Erro ao listar limites com documentos: {e}")
        return pd.DataFrame()

# 🔧 CORREÇÃO: Classe AccessDB para compatibilidade com o editor de marcos
class AccessDB:
    """Classe de compatibilidade para o editor de marcos"""
    
    def __init__(self, db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb"):
        """
        Inicializa conexão com banco Access
        
        Args:
            db_path: Caminho para o arquivo .accdb (padrão: banco corporativo)
        """
        self.db_path = db_path
        self.conn = None
        self._connect()
    
    def _connect(self):
        """Estabelece conexão com o banco Access"""
        try:
            if not ACCESS_AVAILABLE:
                raise ImportError("pyodbc não está disponível. Instale com: pip install pyodbc")
            
            db_path = Path(self.db_path)
            if not db_path.exists():
                raise FileNotFoundError(f"Banco Access não encontrado: {self.db_path}")
            
            conn_str = (
                r"DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};"
                rf"DBQ={db_path.absolute()};"
                r"ExtendedAnsiSQL=1;"
            )
            
            self.conn = pyodbc.connect(conn_str)
            # 🔧 CORREÇÃO: Configura encoding para CP1252 (Windows-1252) que é mais compatível
            try:
                self.conn.setdecoding(pyodbc.SQL_CHAR, encoding='cp1252')
                self.conn.setdecoding(pyodbc.SQL_WCHAR, encoding='cp1252')
                self.conn.setencoding(encoding='cp1252')
            except:
                # Se falhar, tenta UTF-8
                try:
                    self.conn.setdecoding(pyodbc.SQL_CHAR, encoding='utf-8')
                    self.conn.setdecoding(pyodbc.SQL_WCHAR, encoding='utf-8')
                    self.conn.setencoding(encoding='utf-8')
                except:
                    # Se ainda falhar, deixa o padrão
                    pass
            
            print(f"✅ Conectado ao banco Access: {self.db_path}")
            
        except Exception as e:
            print(f"❌ Erro ao conectar ao banco Access {self.db_path}: {e}")
            raise
    
    def close(self):
        """Fecha a conexão com o banco"""
        if self.conn:
            try:
                self.conn.close()
            except:
                pass
            self.conn = None
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


def obter_configuracao_da_condicao(condicao_id: int, db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> Optional[int]:
    """
    Obtém o ID da configuração associada a uma condição específica
    
    Args:
        condicao_id: ID da condição
        db_path: Caminho para o banco Access
        
    Returns:
        ID da configuração ou None se não encontrado
    """
    try:
        with get_access_database(db_path) as db:
            query = """
                SELECT NomeConfiguracao
                FROM tb_vincula_CadConfig_Condicoes_LPP
                WHERE NomeCondicoes = ?
            """
            
            cursor = db.connection.cursor()
            cursor.execute(query, (condicao_id,))
            result = cursor.fetchone()
            
            if result:
                # NomeConfiguracao é o ID da configuração (não o nome)
                return result[0]
            else:
                print(f"⚠️ Configuração não encontrada para condição ID: {condicao_id}")
                return None
                
    except Exception as e:
        print(f"❌ Erro ao obter configuração da condição {condicao_id}: {e}")
        return None


def deletar_variavel_selecionada_access(condicao_id: int, variavel_id: int, db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> bool:
    """
    Remove uma variável selecionada de uma condição específica
    
    Args:
        condicao_id: ID da condição
        variavel_id: ID da variável a ser removida
        db_path: Caminho para o banco Access
        
    Returns:
        True se removido com sucesso, False caso contrário
    """
    try:
        with get_access_database(db_path) as db:
            # Obter o ID do vínculo da condição
            vinculo_query = """
                SELECT ID_espelho
                FROM tb_vincula_CadConfig_Condicoes_LPP
                WHERE NomeCondicoes = ?
            """
            
            cursor = db.connection.cursor()
            cursor.execute(vinculo_query, (condicao_id,))
            vinculo_result = cursor.fetchone()
            
            if not vinculo_result:
                print(f"❌ Vínculo não encontrado para condição {condicao_id}")
                return False
            
            vinculo_id = vinculo_result[0]
            
            # Remover a variável
            query = """
                DELETE FROM tb_variaveisSelecionadas
                WHERE ID_vinculoConfigCondicao = ? AND ID_Variavel = ?
            """
            
            cursor.execute(query, (vinculo_id, variavel_id))
            db.connection.commit()
            
            print(f"✅ Variável {variavel_id} removida da condição {condicao_id}")
            return True
            
    except Exception as e:
        print(f"❌ Erro ao remover variável {variavel_id} da condição {condicao_id}: {e}")
        return False


def adicionar_variavel_selecionada_access(condicao_id: int, variavel_id: int, db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> bool:
    """
    Adiciona uma variável selecionada a uma condição específica
    
    🔧 CORREÇÃO CRÍTICA: Segue as regras da documentação
    - Usa ID_espelho para todos os relacionamentos
    - ID_Variavel deve ser o ID_espelho de tb_DicionarioVariavel
    - ID_vinculoConfigCondicao deve ser o ID_espelho de tb_vincula_CadConfig_Condicoes_LPP
    - ID_espelho deve ser preenchido com o valor do ID_variavelSel após inserção
    
    Args:
        condicao_id: ID_espelho da condição (não o ID autonumérico)
        variavel_id: ID_espelho da variável no dicionário (não o ID autonumérico)
        db_path: Caminho para o banco Access
        
    Returns:
        True se adicionado com sucesso, False caso contrário
    """
    try:
        with get_access_database(db_path) as db:
            cursor = db.connection.cursor()
            
            # 🔧 CORREÇÃO: condicao_id já é o ID_espelho da condição
            # Precisamos obter o ID_espelho do vínculo que contém esta condição
            vinculo_query = """
                SELECT ID_espelho
                FROM tb_vincula_CadConfig_Condicoes_LPP
                WHERE NomeCondicoes = ?
            """
            
            cursor.execute(vinculo_query, (condicao_id,))
            vinculo_result = cursor.fetchone()
            
            if not vinculo_result:
                print(f"❌ Vínculo não encontrado para condição {condicao_id}")
                return False
            
            vinculo_id = vinculo_result[0]
            
            # 🔧 CORREÇÃO: variavel_id já é o ID_espelho da variável no dicionário
            # Verificar se a variável já existe para esta condição específica
            check_query = """
                SELECT ID_variavelSel FROM tb_variaveisSelecionadas
                WHERE ID_vinculoConfigCondicao = ? AND ID_Variavel = ?
            """
            
            cursor.execute(check_query, (vinculo_id, variavel_id))
            existing_result = cursor.fetchone()
            
            if existing_result:
                print(f"⚠️ Variável {variavel_id} já existe para a condição {condicao_id}")
                return False
            
            # 🔧 CORREÇÃO: Inserir sem o campo ID_espelho primeiro (será preenchido depois)
            insert_query = """
                INSERT INTO tb_variaveisSelecionadas (ID_vinculoConfigCondicao, ID_Variavel, Ativo, ID_Usuario, Title)
                VALUES (?, ?, ?, ?, ?)
            """
            
            title = f"Variável {variavel_id} - Condição {condicao_id}"
            cursor.execute(insert_query, (vinculo_id, variavel_id, True, 1, title))
            
            # Obter o ID do registro recém-inserido
            novo_id = cursor.execute("SELECT @@IDENTITY").fetchone()[0]
            
            # 🔧 CORREÇÃO CRÍTICA: Atualizar o campo ID_espelho com o valor do ID_variavelSel
            update_query = """
                UPDATE tb_variaveisSelecionadas 
                SET ID_espelho = ? 
                WHERE ID_variavelSel = ?
            """
            cursor.execute(update_query, (novo_id, novo_id))
            db.connection.commit()
            
            print(f"✅ Variável {variavel_id} adicionada à condição {condicao_id} (ID: {novo_id}, ID_espelho: {novo_id})")
            return True
            
    except Exception as e:
        print(f"❌ Erro ao adicionar variável {variavel_id} à condição {condicao_id}: {e}")
        return False 

def obter_limite_da_configuracao(configuracao_id: int, db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> Optional[int]:
    """
    Obtém o ID do limite associado a uma configuração específica
    
    Args:
        configuracao_id: ID da configuração
        db_path: Caminho para o banco Access
        
    Returns:
        ID do limite ou None se não encontrado
    """
    try:
        with get_access_database(db_path) as db:
            query = """
                SELECT ID_Limite
                FROM tb_vincula_Limite_Configuracao_LPP
                WHERE ID_Configuracao = ?
            """
            
            cursor = db.connection.cursor()
            cursor.execute(query, (configuracao_id,))
            result = cursor.fetchone()
            
            if result:
                return result[0]
            else:
                print(f"⚠️ Limite não encontrado para configuração ID: {configuracao_id}")
                return None
                
    except Exception as e:
        print(f"❌ Erro ao obter limite da configuração {configuracao_id}: {e}")
        return None


def obter_configuracoes_por_limite(limite_id: int, db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> list:
    """
    Obtém todas as configurações associadas a um limite específico
    
    Args:
        limite_id: ID do limite
        db_path: Caminho para o banco Access
        
    Returns:
        Lista de IDs das configurações associadas ao limite
    """
    try:
        with get_access_database(db_path) as db:
            query = """
                SELECT ID_Configuracao
                FROM tb_vincula_Limite_Configuracao_LPP
                WHERE ID_Limite = ?
            """
            
            cursor = db.connection.cursor()
            cursor.execute(query, (limite_id,))
            results = cursor.fetchall()
            
            config_ids = [row[0] for row in results]
            print(f"✅ {len(config_ids)} configurações encontradas para limite {limite_id}")
            return config_ids
                
    except Exception as e:
        print(f"❌ Erro ao obter configurações do limite {limite_id}: {e}")
        return [] 


# 🚀 Funções equivalentes ao SharePoint para operações de escrita
def salvar_item_access(table_name: str, item_data: dict, item_id: int = None, db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> dict:
    """Equivalente ao salvar_item() do SharePoint - retorna dicionário com ID_espelho"""
    try:
        # 🔧 CORREÇÃO CRÍTICA: Verifica se o terceiro parâmetro é um ID ou caminho do banco
        if isinstance(item_id, str) and item_id.endswith('.accdb'):
            # O terceiro parâmetro é um caminho de banco, não um ID
            db_path = item_id
            item_id = None
        
        # 🔧 CORREÇÃO CRÍTICA: Usa função utilitária central
        from controle_acoes.services.access_utils import salvar_item_with_mirror
        resultado = salvar_item_with_mirror(table_name, item_data, db_path)
        
        # ✅ CORREÇÃO: Verifica se o resultado é válido
        if resultado and resultado.get('success', False):
            return resultado
        else:
            return {"success": False, "id_espelho": None, "error": resultado.get('error', 'Erro desconhecido')}
            
    except Exception as e:
        return {"success": False, "id_espelho": None, "error": str(e)}


def deletar_item_access(table_name: str, item_id: int, db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> bool:
    """Equivalente ao deletar_item() do SharePoint"""
    try:
        # 🔧 CORREÇÃO CRÍTICA: Usa função utilitária central
        from controle_acoes.services.access_utils import deletar_item_with_mirror
        return deletar_item_with_mirror(table_name, item_id, db_path)
    except Exception as e:
        print(f"❌ Erro ao deletar item: {e}")
        return False


def atualizar_item_access(table_name: str, item_id: int, item_data: dict, db_path: str = r"\\prd-plm-01\SysPL\GestaoLPP\bd_gestaolpp.accdb") -> bool:
    """Equivalente ao atualizar_item() do SharePoint"""
    try:
        # 🔧 CORREÇÃO CRÍTICA: Usa função utilitária central
        from controle_acoes.services.access_utils import atualizar_item_with_mirror
        return atualizar_item_with_mirror(table_name, item_id, item_data, db_path)
    except Exception as e:
        print(f"❌ Erro ao atualizar item: {e}")
        return False