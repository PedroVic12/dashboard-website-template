import pandas as pd

must_df = pd.read_excel(r"C:\Users\pedrovictor.veras\OneDrive - Operador Nacional do Sistema Eletrico\Documentos\ESTAGIO_ONS_PVRV_2025\GitHub\dashboard-website-template\dashboard_must_webiste\static\must_tables_PDF_notes_merged.xlsx")


output_folder = r"C:\Users\pedrovictor.veras\OneDrive - Operador Nacional do Sistema Eletrico\Documentos\ESTAGIO_ONS_PVRV_2025\GitHub\dashboard-website-template\dashboard_must_webiste\static"

print(must_df)

must_df.to_sql(
    "must_db.sqlite"
)