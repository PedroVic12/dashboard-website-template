import pandas as pd
import os
from get_db_access_connection import get_db_connection
import pyodbc

# --- CONFIGURAÇÕES ---
# Caminho do arquivo Excel
EXCEL_PATH = r"C:\Users\pedrovictor.veras\OneDrive - Operador Nacional do Sistema Eletrico\Documentos\ESTAGIO_ONS_PVRV_2025\GitHub\dashboard-website-template\dashboard_must_webiste\arquivos\database\must_tables_PDF_notes_merged.xlsx"


# Nome da tabela no banco de dados SQL Server
TABLE_NAME = "MustTablesPdfNotes"

def import_data_to_sql_server():
    """
    Lê dados de um arquivo Excel e os insere em uma tabela no SQL Server.
    A tabela é recriada a cada execução para garantir dados atualizados.
    """
    if not os.path.exists(EXCEL_PATH):
        print(f"Erro: O arquivo Excel não foi encontrado em '{EXCEL_PATH}'")
        return

    print(f"Lendo dados do arquivo: {EXCEL_PATH}...")
    try:
        df = pd.read_excel(EXCEL_PATH)
    except Exception as e:
        print(f"Ocorreu um erro ao ler o arquivo Excel: {e}")
        return

    # Limpeza dos nomes das colunas para serem compatíveis com SQL
    df.columns = [col.replace(' ', '_').replace('/', '_').replace('-', '_') for col in df.columns]

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if not conn:
            print("Não foi possível conectar ao banco de dados. Abortando a importação.")
            return

        cursor = conn.cursor()
        print("Conexão com o banco de dados estabelecida com sucesso.")

        # 1. Apaga a tabela se ela já existir
        print(f"Verificando se a tabela '{TABLE_NAME}' já existe...")
        cursor.execute(f"IF OBJECT_ID('{TABLE_NAME}', 'U') IS NOT NULL DROP TABLE {TABLE_NAME}")
        print(f"Tabela '{TABLE_NAME}' antiga (se existiu) foi removida.")

        # 2. Cria a nova tabela (usando tipos de dados genéricos)
        # Para um ambiente de produção, defina os tipos e tamanhos de coluna com mais precisão.
        cols_with_types = ", ".join([f"[{col}] NVARCHAR(MAX)" for col in df.columns])
        create_table_sql = f"CREATE TABLE {TABLE_NAME} ({cols_with_types});"
        
        print("Criando nova tabela...")
        cursor.execute(create_table_sql)
        print(f"Tabela '{TABLE_NAME}' criada com sucesso.")

        # 3. Insere os dados do DataFrame na tabela
        print(f"Iniciando a inserção de {len(df)} registros. Isso pode levar um momento...")
        
        # Converte o DataFrame em uma lista de tuplas para inserção em massa
        data_to_insert = [tuple(x) for x in df.to_numpy()]
        
        insert_sql = f"INSERT INTO {TABLE_NAME} ([{'], ['.join(df.columns)}]) VALUES ({', '.join(['?'] * len(df.columns))})"
        
        # Utiliza executemany para uma inserção em massa eficiente
        cursor.fast_executemany = True
        cursor.executemany(insert_sql, data_to_insert)
        
        conn.commit()
        print(f"{len(df)} registros foram inseridos com sucesso na tabela '{TABLE_NAME}'.")

    except pyodbc.Error as e:
        print(f"Ocorreu um erro de banco de dados: {e}")
        if conn:
            conn.rollback()
    except Exception as e:
        print(f"Ocorreu um erro inesperado: {e}")
    finally:
        if cursor:
            cursor.close()
            print("Cursor fechado.")
        if conn:
            conn.close()
            print("Conexão com o banco de dados fechada.")




import_data_to_sql_server()
