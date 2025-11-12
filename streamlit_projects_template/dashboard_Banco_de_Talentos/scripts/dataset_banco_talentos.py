import pandas as pd

df_formulario1 = pd.read_excel(r"C:\Users\pedrovictor.veras\OneDrive - Operador Nacional do Sistema Eletrico\Documentos\ESTAGIO_ONS_PVRV_2025\AUTOMACÕES ONS - PLC\ONS Inspira - Projeto Estágiarios\dashboard - Banco de talentos\assets\ONS Inspira__Conhecendo você👋.xlsx")
df_formulario2 = pd.read_excel(r"C:\Users\pedrovictor.veras\OneDrive - Operador Nacional do Sistema Eletrico\Documentos\ESTAGIO_ONS_PVRV_2025\AUTOMACÕES ONS - PLC\ONS Inspira - Projeto Estágiarios\dashboard - Banco de talentos\assets\ONS Inspira__Foi um prazer 🤝.xlsx")

df_merged = None # Inicializa o dataframe mesclado globalmente

def tratamento_dados():
    global df_merged

    df1_temp = df_formulario1.copy()
    df2_temp = df_formulario2.copy()

    # --- Correção para colunas de Email duplicadas ---
    # Remover a coluna 'Email' original antes de renomear 'Email1'
    if 'Email' in df1_temp.columns and 'Email1' in df1_temp.columns:
        df1_temp.drop(columns=['Email'], inplace=True)
    
    # Remover a coluna 'Email' original antes de renomear 'Seu email'
    if 'Email' in df2_temp.columns and 'Seu email' in df2_temp.columns:
        df2_temp.drop(columns=['Email'], inplace=True)
    # --- Fim da correção ---


    # Padronizar nomes de colunas do Formulário 1
    df1_temp.rename(columns={
        'Email1': 'Email', # Agora sim, renomeia sem criar duplicata
        'Qual área do ONS te interessa mais?': 'Area de Interesse',
        'Você pretende cursar faculdade?': 'Pretende Cursar Faculdade',
        'Nome Completo': 'Nome Completo'
    }, inplace=True)

    # Padronizar nomes de colunas do Formulário 2
    df2_temp.rename(columns={
        'Seu email': 'Email', # Agora sim, renomeia sem criar duplicata
        'Seu nome completo': 'Nome Completo',
        'Quais áreas do ONS vc mais se interessou?': 'Area de Interesse',
        'Pretende cursar faculdade?': 'Pretende Cursar Faculdade'
    }, inplace=True)

    # Selecionar e renomear colunas para o merge e evitar duplicação desnecessária
    df1_cols_to_keep = [
        'Email', 'Nome Completo', 'Telefone (Whatsapp)', 'Data de Nascimento',
        'Escolaridade', 'Já ouviu falar do ONS?', 'O que você acha que o ONS faz?',
        'Area de Interesse', 'Pretende Cursar Faculdade'
    ]
    df1_selected = df1_temp[df1_cols_to_keep]

    df2_cols_to_keep = [
        'Email', 'Nome Completo', 'Telefone (Whatsapp)',
        'Você já conhecia o ONS antes da visita?',
        'Depois de hoje, como você descreveria o ONS?',
        'Area de Interesse',
        'Você tem interesse em participar de programas do ONS?',
        'Pretende Cursar Faculdade',
        'Você recomendaria o evento para seus amigos?',
        'Em poucas palavras, o que mais te marcou no evento?',
        'Quer receber informações sobre oportunidades do ONS?'
    ]
    df2_selected = df2_temp[df2_cols_to_keep]

    # Realizar o merge completo (outer join) para unir os dados
    df_merged = pd.merge(df1_selected, df2_selected, on=['Email', 'Nome Completo', 'Telefone (Whatsapp)'], how='outer', suffixes=('_f1', '_f2'))

    # Consolidar a coluna 'Area de Interesse'
    df_merged['Area de Interesse_temp'] = df_merged['Area de Interesse_f1'].fillna('') + ';' + df_merged['Area de Interesse_f2'].fillna('')
    df_merged['Area de Interesse'] = df_merged['Area de Interesse_temp'].apply(
        lambda x: ';'.join(sorted(list(set(item.strip() for item in x.split(';') if item.strip()))))
    )
    df_merged.drop(columns=['Area de Interesse_f1', 'Area de Interesse_f2', 'Area de Interesse_temp'], inplace=True, errors='ignore')

    # Consolidar a coluna 'Pretende Cursar Faculdade'
    df_merged['Pretende Cursar Faculdade'] = df_merged['Pretende Cursar Faculdade_f1'].fillna(df_merged['Pretende Cursar Faculdade_f2'])
    df_merged.drop(columns=['Pretende Cursar Faculdade_f1', 'Pretende Cursar Faculdade_f2'], inplace=True, errors='ignore')

    # Consolidar colunas relacionadas ao conhecimento do ONS
    df_merged['Conhecia ONS'] = df_merged['Já ouviu falar do ONS?'].fillna(df_merged['Você já conhecia o ONS antes da visita?'])
    df_merged.drop(columns=['Já ouviu falar do ONS?', 'Você já conhecia o ONS antes da visita?'], errors='ignore', inplace=True)

    # Remover colunas 'Id' e 'Nome' (se existirem e não forem mais necessárias após o merge e renomeio)
    df_merged.drop(columns=['Id_f1', 'Id_f2'], errors='ignore', inplace=True)

    # Garantir que não haja colunas de sufixo (_f1, _f2) restantes, a menos que intencional
    # Isso é um passo genérico; em um cenário real, você listaria explicitamente o que manter.
    cols_to_drop_after_coalescing = [col for col in df_merged.columns if '_f1' in col or '_f2' in col]
    df_merged.drop(columns=cols_to_drop_after_coalescing, errors='ignore', inplace=True)


def show_dataset():
    print(df_formulario1.columns)
    print(df_formulario1.head())

    print("\n\n")

    print(df_formulario2.columns)
    print(df_formulario2.head())


# Executar o tratamento de dados quando o script é importado
tratamento_dados()

print(df_merged.columns)
print(df_merged.head())

df_merged.to_excel(r"C:\Users\pedrovictor.veras\OneDrive - Operador Nacional do Sistema Eletrico\Documentos\ESTAGIO_ONS_PVRV_2025\GitHub\dashboard-website-template\streamlit_projects_template\dashboard_Banco_de_Talentos\assets\ONS_Inspira_Banco_de_Talentos_Merged.xlsx", index=False)