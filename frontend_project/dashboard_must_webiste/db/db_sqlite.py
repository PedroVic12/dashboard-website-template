
import sqlite3
import pandas as pd
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SQLiteDatabase:
    """
    Classe para gerenciamento de banco de dados SQLite, com foco na replicação
    do schema e dados de um banco Access.
    """

    def __init__(self, db_path: str = "lpp_dashboard.db"):
        self.db_path = db_path
        self.conn = None

    def connect(self):
        """Estabelece a conexão com o banco de dados SQLite."""
        try:
            self.conn = sqlite3.connect(self.db_path)
            self.conn.execute("PRAGMA foreign_keys = ON;") # Habilita chaves estrangeiras
            logger.info(f"✅ Conectado ao banco SQLite: {self.db_path}")
        except sqlite3.Error as e:
            logger.error(f"❌ Erro ao conectar ao banco SQLite {self.db_path}: {e}")
            raise

    def close(self):
        """Fecha a conexão com o banco de dados SQLite."""
        if self.conn:
            self.conn.close()
            self.conn = None
            logger.info(f"🔌 Conexão SQLite fechada: {self.db_path}")

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()

    def create_tables(self):
        """Cria as tabelas no banco de dados SQLite com base no schema do Access."""
        if not self.conn:
            self.connect()

        cursor = self.conn.cursor()

        # Tabela tb_cad_limite_LPP
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tb_cad_limite_LPP (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_espelho INTEGER UNIQUE,
                NomeLimite TEXT NOT NULL,
                Ativo BOOLEAN,
                Status TEXT,
                PremissasHtml TEXT,
                ComentariosHtml TEXT
            );
        """)

        # Tabela tb_cad_configuracao_LPP
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tb_cad_configuracao_LPP (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_espelho INTEGER UNIQUE,
                NomeConfiguracao TEXT NOT NULL,
                Status TEXT,
                Title TEXT
            );
        """)

        # Tabela tb_vincula_Limite_Configuracao_LPP
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tb_vincula_Limite_Configuracao_LPP (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_Limite INTEGER NOT NULL,
                ID_Configuracao INTEGER NOT NULL,
                FOREIGN KEY (ID_Limite) REFERENCES tb_cad_limite_LPP(ID_espelho),
                FOREIGN KEY (ID_Configuracao) REFERENCES tb_cad_configuracao_LPP(ID_espelho)
            );
        """)

        # Tabela tb_cadCondicoes_LPP
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tb_cadCondicoes_LPP (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_espelho INTEGER UNIQUE,
                Title TEXT NOT NULL
            );
        """)

        # Tabela tb_vincul-CadConfig_Condicoes_LPP
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tb_vincul-CadConfig_Condicoes_LPP (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_espelho INTEGER UNIQUE,
                NomeCondicoes INTEGER NOT NULL, -- Refere-se ao ID_espelho de tb_cadCondicoes_LPP
                NomeConfiguracao INTEGER NOT NULL, -- Refere-se ao ID_espelho de tb_cad_configuracao_LPP
                FOREIGN KEY (NomeCondicoes) REFERENCES tb_cadCondicoes_LPP(ID_espelho),
                FOREIGN KEY (NomeConfiguracao) REFERENCES tb_cad_configuracao_LPP(ID_espelho)
            );
        """)

        # Tabela tb_DicionarioVariavel
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tb_DicionarioVariavel (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_espelho INTEGER UNIQUE,
                NomeEletrico TEXT NOT NULL
            );
        """)

        # Tabela tb_variaveisSelecionadas
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tb_variaveisSelecionadas (
                ID_variavelSel INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_espelho INTEGER UNIQUE,
                ID_Variavel INTEGER NOT NULL, -- Refere-se ao ID_espelho de tb_DicionarioVariavel
                ID_Usuario INTEGER,
                ID_vinculoConfigCondicao INTEGER NOT NULL, -- Refere-se ao ID_espelho de tb_vincul-CadConfig_Condicoes_LPP
                Ativo BOOLEAN,
                ValorTeste REAL,
                Title TEXT,
                NomeVariavel TEXT,
                FOREIGN KEY (ID_Variavel) REFERENCES tb_DicionarioVariavel(ID_espelho),
                FOREIGN KEY (ID_vinculoConfigCondicao) REFERENCES tb_vincul-CadConfig_Condicoes_LPP(ID_espelho)
            );
        """)

        # Tabela tb_BaseCondicionante
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tb_BaseCondicionante (
                ID_BaseCondicionante INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_espelho INTEGER UNIQUE,
                NomeBaseCondicionante TEXT NOT NULL,
                ID_TipoLPP INTEGER,
                ValorIDBaseCondicionante TEXT,
                ID_vinculoConfigCondicao INTEGER, -- Refere-se ao ID_espelho de tb_vincul-CadConfig_Condicoes_LPP
                Title TEXT,
                FOREIGN KEY (ID_vinculoConfigCondicao) REFERENCES tb_vincul-CadConfig_Condicoes_LPP(ID_espelho)
            );
        """)

        # Tabela tbl_Relacao_BaseCondicionante
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tbl_Relacao_BaseCondicionante (
                ID_Relacao INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_Base INTEGER NOT NULL, -- Refere-se ao ID_espelho de tb_BaseCondicionante
                ID_Condicionante INTEGER NOT NULL, -- Refere-se ao ID_espelho de tb_BaseCondicionante
                ID_Result_fk INTEGER,
                Title TEXT,
                FOREIGN KEY (ID_Base) REFERENCES tb_BaseCondicionante(ID_espelho),
                FOREIGN KEY (ID_Condicionante) REFERENCES tb_BaseCondicionante(ID_espelho)
            );
        """)

        # Tabela tb_ValoresVariaveis
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tb_ValoresVariaveis (
                ID_ValorVar INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_espelho INTEGER UNIQUE,
                ID_Base INTEGER NOT NULL, -- Refere-se ao ID_espelho de tb_BaseCondicionante
                ID_VariavelSel INTEGER NOT NULL, -- Refere-se ao ID_espelho de tb_variaveisSelecionadas
                Title TEXT,
                Valor REAL,
                NomeEletrico TEXT,
                FOREIGN KEY (ID_Base) REFERENCES tb_BaseCondicionante(ID_espelho),
                FOREIGN KEY (ID_VariavelSel) REFERENCES tb_variaveisSelecionadas(ID_espelho)
            );
        """)
        
        # Tabela tbl_Resultados_LPP
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tbl_Resultados_LPP (
                ID_result INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_espelho INTEGER UNIQUE,
                NomeGrupo TEXT NOT NULL,
                ID_Base INTEGER,
                ID_vinculoConfigCondicao INTEGER, -- Refere-se ao ID_espelho de tb_vincul-CadConfig_Condicoes_LPP
                Title TEXT,
                FOREIGN KEY (ID_Base) REFERENCES tb_BaseCondicionante(ID_espelho),
                FOREIGN KEY (ID_vinculoConfigCondicao) REFERENCES tb_vincul-CadConfig_Condicoes_LPP(ID_espelho)
            );
        """)

        self.conn.commit()
        logger.info("✅ Tabelas SQLite criadas/verificadas com sucesso.")

    def insert_dataframe(self, table_name: str, df: pd.DataFrame):
        """
        Insere dados de um DataFrame em uma tabela SQLite.
        Assume que as colunas do DataFrame correspondem aos campos da tabela.
        """
        if not self.conn:
            self.connect()

        df.to_sql(table_name, self.conn, if_exists='append', index=False)
        logger.info(f"✅ {len(df)} linhas inseridas na tabela {table_name}.")

    def execute_query(self, query: str) -> pd.DataFrame:
        """Executa uma query SQL e retorna os resultados como DataFrame."""
        if not self.conn:
            self.connect()
        return pd.read_sql_query(query, self.conn)

# Exemplo de uso (para demonstração)
if __name__ == "__main__":
    sqlite_db_path = "lpp_dashboard.db"
    with SQLiteDatabase(sqlite_db_path) as db:
        db.create_tables()

        # Exemplo de inserção de dados (apenas para teste inicial)
        # df_limites = pd.DataFrame([
        #     {'ID_espelho': 1, 'NomeLimite': 'Limite Teste 1', 'Ativo': True, 'Status': 'Ativo', 'PremissasHtml': '<b>Premissas</b>', 'ComentariosHtml': '<i>Comentários</i>'},
        #     {'ID_espelho': 2, 'NomeLimite': 'Limite Teste 2', 'Ativo': False, 'Status': 'Inativo', 'PremissasHtml': '<b>Premissas 2</b>', 'ComentariosHtml': '<i>Comentários 2</i>'},
        # ])
        # db.insert_dataframe("tb_cad_limite_LPP", df_limites)

        # df_configs = pd.DataFrame([
        #     {'ID_espelho': 101, 'NomeConfiguracao': 'Config Teste A', 'Status': 'OK', 'Title': 'Config A'},
        #     {'ID_espelho': 102, 'NomeConfiguracao': 'Config Teste B', 'Status': 'OK', 'Title': 'Config B'},
        # ])
        # db.insert_dataframe("tb_cad_configuracao_LPP", df_configs)

        # df_vinculos_limite_config = pd.DataFrame([
        #     {'ID_Limite': 1, 'ID_Configuracao': 101},
        #     {'ID_Limite': 1, 'ID_Configuracao': 102},
        # ])
        # db.insert_dataframe("tb_vincula_Limite_Configuracao_LPP", df_vinculos_limite_config)

        # O resto das inserções de exemplo pode ser adicionado aqui
