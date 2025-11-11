import pandas as pd
import sqlite3
import os

# Caminho do arquivo Excel consolidado
excel_path = r"C:\Users\pedrovictor.veras\OneDrive - Operador Nacional do Sistema Eletrico\Documentos\ESTAGIO_ONS_PVRV_2025\GitHub\dashboard-website-template\dashboard_must_webiste\static\must_tables_PDF_notes_merged.xlsx"

# Caminho do banco de dados SQLite (na pasta db)
db_path = os.path.join(
    os.path.dirname(__file__),
    "must_db.sqlite"
)
# Nome da tabela no banco de dados
table_name = "must_tables_pdf_notes"

# Lê o arquivo Excel
must_df = pd.read_excel(excel_path)

print("Primeiras linhas do DataFrame:")
print(must_df.head())

# Conecta ao banco de dados SQLite (cria se não existir)
conn = sqlite3.connect(db_path)

# Exporta o DataFrame para o banco de dados SQLite
must_df.to_sql(
    table_name,
    conn,
    if_exists="replace",  # sobrescreve a tabela se já existir
    index=False
)

print(f"Tabela '{table_name}' criada/atualizada no banco '{db_path}' com {len(must_df)} registros.")

conn.close()