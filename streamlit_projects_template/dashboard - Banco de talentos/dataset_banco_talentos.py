import pandas as pd

df_formulario1 = pd.read_excel(r"C:\Users\pedrovictor.veras\OneDrive - Operador Nacional do Sistema Eletrico\Documentos\ESTAGIO_ONS_PVRV_2025\AUTOMACÕES ONS - PLC\ONS Inspira - Projeto Estágiarios\dashboard - Banco de talentos\assets\ONS Inspira__Conhecendo você👋.xlsx")

df_formulario2 = pd.read_excel(r"C:\Users\pedrovictor.veras\OneDrive - Operador Nacional do Sistema Eletrico\Documentos\ESTAGIO_ONS_PVRV_2025\AUTOMACÕES ONS - PLC\ONS Inspira - Projeto Estágiarios\dashboard - Banco de talentos\assets\ONS Inspira__Foi um prazer 🤝.xlsx")

print(df_formulario1.columns)
print(df_formulario1.head())

print("\n\n")

print(df_formulario2.columns)
print(df_formulario2.head())

