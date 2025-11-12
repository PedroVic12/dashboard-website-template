import streamlit as st
import pandas as pd
import sys
import os
import matplotlib.pyplot as plt
import altair as alt
import io # Para salvar a imagem

# Adiciona o diretório raiz do projeto ao sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../')))

# Importar o dataset_banco_talentos.py e seus dataframes
from scripts.dataset_banco_talentos import df_formulario1, df_formulario2, df_merged

# Importar o sistema de recomendação
from scripts.recommendation_system import get_recommendations

# Importar os widgets
from widgets.CrossHighlightWidget import vega_lite_json
from widgets.IsoTypeGridWidget import get_chart_67593
from widgets.WordCloudWidget import create_wordcloud, get_wordcloud_data_for_streamlit, create_categorized_wordclouds # Importar a nova função



#st.set_page_config(layout="wide", page_title="Dashboard ONS Inspira - Banco de Talentos")

st.title("Dashboard ONS Inspira - Banco de Talentos")

# Seção para exibir os dados brutos
st.header("Dados dos Formulários")
st.subheader("Formulário 1: Conhecendo Você")
st.dataframe(df_formulario1.head())
st.subheader("Formulário 2: Foi um prazer")
st.dataframe(df_formulario2.head())
st.subheader("Dados Unificados (df_merged)")
st.dataframe(df_merged.head())


# Seção de insights (com base em upgrades.md)
st.header("Insights dos Formulários")

st.markdown("""
    A análise dos formulários `Conhecendo Você` e `Foi um prazer` revelou informações valiosas sobre os talentos e suas percepções sobre o ONS.
    Identificamos um forte interesse em áreas como `Tecnologia` e `Engenharia Elétrica`, além de uma alta taxa de recomendação do ONS.
    O interesse em programas de `Estágio` e `Jovem Aprendiz` é promissor para futuras oportunidades.
""")

# ------------- Nuvem de Palavras com Abas e Salvar Imagem -------------
st.subheader("Nuvem de Palavras das Áreas de Interesse")

tab_mpl, tab_interactive = st.tabs(["Nuvem de Palavras (Matplotlib)", "Nuvem de Palavras (Interativa)"])

if 'Area de Interesse' in df_merged.columns:
    all_interests = []
    for interests_str in df_merged['Area de Interesse'].dropna().astype(str):
        all_interests.extend([item.strip() for item in interests_str.split(';') if item.strip()])
    
    areas_interesse_texto = " ".join(all_interests)

    if areas_interesse_texto:
        with tab_mpl:
            st.markdown("### Nuvem de Palavras com Matplotlib")
            wordcloud_image = create_wordcloud(areas_interesse_texto)
            fig, ax = plt.subplots(figsize=(12, 8))
            ax.imshow(wordcloud_image)
            plt.axis("off")
            st.pyplot(fig)

            # Botão para salvar a imagem
            buf = io.BytesIO()
            plt.savefig(buf, format="png")
            st.download_button(
                label="Salvar Imagem",
                data=buf.getvalue(),
                file_name="nuvem_de_palavras.png",
                mime="image/png"
            )

        with tab_interactive:
            st.markdown("### Nuvem de Palavras Interativa (Streamlit WordCloud)")
            words_for_interactive = get_wordcloud_data_for_streamlit(areas_interesse_texto)
            # if words_for_interactive:
            #     wordcloud_image.visualize(words_for_interactive, tooltip_data_fields={
            #         'text':'Área', 'value':'Frequência'
            #     }, per_word_coloring=False)
            # else:
            #     st.info("Nenhum dado disponível para gerar a Nuvem de Palavras Interativa.")
    else:
        st.info("Nenhum dado disponível na coluna 'Area de Interesse' para gerar a Nuvem de Palavras.")
else:
    st.warning("Coluna 'Area de Interesse' não encontrada no dataframe mesclado. Verifique o nome da coluna.")

# ------------- Fim da Nuvem de Palavras -------------

# ------------- Nuvem de Palavras Categorizadas -------------
st.subheader("Nuvens de Palavras por Categoria")

if 'Em poucas palavras, o que mais te marcou no evento?' in df_merged.columns and \
   'Escolaridade' in df_merged.columns:

    categorized_wordclouds_dict = create_categorized_wordclouds(
        df=df_merged,
        text_column='Em poucas palavras, o que mais te marcou no evento?',
        category_column='Escolaridade'
    )

    if categorized_wordclouds_dict:
        category_tabs = st.tabs(list(categorized_wordclouds_dict.keys()))
        
        for i, category in enumerate(categorized_wordclouds_dict.keys()):
            with category_tabs[i]:
                st.markdown(f"### Nuvem de Palavras para Escolaridade: {category}")
                wordcloud_obj = categorized_wordclouds_dict[category]
                fig, ax = plt.subplots(figsize=(12, 8))
                ax.imshow(wordcloud_obj)
                plt.axis("off")
                st.pyplot(fig)

                buf = io.BytesIO()
                plt.savefig(buf, format="png")
                st.download_button(
                    label=f"Salvar Imagem - {category}",
                    data=buf.getvalue(),
                    file_name=f"nuvem_de_palavras_{category.replace(' ', '_')}.png",
                    mime="image/png"
                )
    else:
        st.info("Nenhuma nuvem de palavras categorizada foi gerada. Verifique os dados e as colunas.")
else:
    st.warning("Colunas 'Em poucas palavras, o que mais te marcou no evento?' ou 'Escolaridade' não encontradas no dataframe mesclado para Nuvem de Palavras Categorizada. Verifique os nomes das colunas.")
# ------------- Fim da Nuvem de Palavras Categorizadas -------------


# Exemplo de uso do IsoTypeGridWidget (para visualização de proporções)
st.subheader("Visualização de Proporções: Pretende Cursar Faculdade?")

if 'Pretende Cursar Faculdade' in df_merged.columns:
    # Contar a frequência das respostas
    faculdade_counts = df_merged['Pretende Cursar Faculdade'].value_counts(normalize=True).reset_index()
    faculdade_counts.columns = ['Resposta', 'Proporcao']

    # Criar um gráfico de barras simples com Altair para mostrar a proporção
    chart_faculdade = alt.Chart(faculdade_counts).mark_bar().encode(
        x=alt.X('Resposta:N', title='Pretende Cursar Faculdade?'),
        y=alt.Y('Proporcao:Q', title='Proporção', axis=alt.Axis(format='%')),
        tooltip=['Resposta', alt.Tooltip('Proporcao', format='.1%')]
    ).properties(
        title='Proporção de Respostas sobre Pretender Cursar Faculdade'
    )
    st.altair_chart(chart_faculdade, use_container_width=True)
    st.info("O `IsoTypeGridWidget` original cria uma grade genérica. Aqui, usamos um gráfico de barras Altair para visualizar a proporção 'Pretende Cursar Faculdade?' dos seus dados. Você pode adaptar a lógica para criar uma visualização de grade isotípica personalizada se desejar.")
else:
    st.warning("Coluna 'Pretende Cursar Faculdade' não encontrada no dataframe mesclado. Verifique o nome da coluna.")


# Exemplo de uso do CrossHighlightWidget (para interação entre gráficos)
st.subheader("Interação entre Gráficos: Escolaridade vs. Área de Interesse")
st.markdown("""
    Este widget é projetado para criar gráficos interativos com destaque cruzado.
    Vamos criar dois gráficos Altair que interagem, mostrando a relação entre a escolaridade e as áreas de interesse.
""")

if 'Escolaridade' in df_merged.columns and 'Area de Interesse' in df_merged.columns:
    # Gráfico 1: Escolaridade
    base = alt.Chart(df_merged).encode(
        x=alt.X('count()', title='Número de Pessoas'),
        y=alt.Y('Escolaridade:N', sort='-x', title='Escolaridade'),
        tooltip=['Escolaridade', 'count()']
    )

    brush = alt.selection_interval(encodings=['y']) # Seleção na barra de escolaridade

    bars_edu = base.mark_bar().encode(
        color=alt.condition(brush, 'Escolaridade:N', alt.value('lightgray'))
    ).add_params(brush)

    # Gráfico 2: Área de Interesse filtrado pela escolaridade selecionada
    chart_area_filtered = alt.Chart(df_merged).mark_bar().encode(
        x=alt.X('count()', title='Número de Pessoas'),
        y=alt.Y('Area de Interesse:N', sort='-x', title='Área de Interesse'),
        tooltip=['Area de Interesse', 'count()']
    ).transform_filter(brush) # Filtra áreas de interesse com base na seleção de escolaridade

    # Concatenar os dois gráficos
    st.altair_chart(bars_edu | chart_area_filtered, use_container_width=True)

else:
    st.warning("Colunas 'Escolaridade' ou 'Area de Interesse' não encontradas no dataframe mesclado para o Cross-Highlight. Verifique os nomes das colunas.")


# ------------- Sistema de Recomendação -------------
st.header("Sistema de Recomendação de Candidatos")
st.markdown("""
    Selecione um candidato para encontrar outros candidatos com interesses semelhantes.
""")

if not df_merged.empty and 'Email' in df_merged.columns and 'Nome Completo' in df_merged.columns:
    candidate_options = df_merged.apply(lambda row: f"{row['Nome Completo']} ({row['Email']})", axis=1).tolist()
    selected_candidate_str = st.selectbox("Selecione um candidato:", options=candidate_options)

    if selected_candidate_str:
        # Extrair o email do candidato selecionado
        selected_email = selected_candidate_str.split('(')[-1][:-1]

        # Colunas de texto para o sistema de recomendação
        recommendation_text_columns = [
            'Area de Interesse',
            'O que você acha que o ONS faz?',
            'Depois de hoje, como você descreveria o ONS?',
            'Em poucas palavras, o que mais te marcou no evento?'
        ]

        # Filtrar apenas as colunas que realmente existem no df_merged
        existing_text_columns = [col for col in recommendation_text_columns if col in df_merged.columns]

        if existing_text_columns:
            st.subheader(f"Candidatos Recomendados para {selected_candidate_str}:")
            recommended_candidates = get_recommendations(
                df_original=df_merged,
                candidate_id=selected_email,
                text_columns=existing_text_columns,
                top_n=5
            )

            if not recommended_candidates.empty:
                st.dataframe(recommended_candidates)
            else:
                st.info("Nenhum candidato recomendado encontrado ou o candidato selecionado não possui informações de texto suficientes.")
        else:
            st.warning("Nenhuma das colunas de texto para recomendação foi encontrada no dataframe mesclado. Verifique os nomes das colunas.")
else:
    st.warning("O DataFrame mesclado está vazio ou as colunas 'Email' ou 'Nome Completo' não foram encontradas para o sistema de recomendação.")

# ------------- Fim do Sistema de Recomendação -------------
