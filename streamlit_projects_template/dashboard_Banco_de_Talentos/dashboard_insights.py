import streamlit as st
import pandas as pd
import sys
import os
import matplotlib.pyplot as plt # Adicionar import para matplotlib
import altair as alt # Adicionar import para Altair

# Adiciona o diretório raiz do projeto ao sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../')))

# Importar o dataset_banco_talentos.py e seus dataframes
from scripts.dataset_banco_talentos import df_formulario1, df_formulario2

# Importar os widgets
from widgets.CrossHighlightWidget import vega_lite_json
from widgets.IsoTypeGridWidget import get_chart_67593
from widgets.WordCloudWidget import create_wordcloud

st.set_page_config(layout="wide", page_title="Dashboard ONS Inspira - Banco de Talentos")

st.title("Dashboard ONS Inspira - Banco de Talentos")

# Seção para exibir os dados brutos (opcional)
st.header("Dados dos Formulários")
st.subheader("Formulário 1: Conhecendo Você")
st.dataframe(df_formulario1.head())
st.subheader("Formulário 2: Foi um prazer")
st.dataframe(df_formulario2.head())

# Seção de insights (com base em upgrades.md)
st.header("Insights dos Formulários")

st.markdown("""
    A análise dos formulários `Conhecendo Você` e `Foi um prazer` revelou informações valiosas sobre os talentos e suas percepções sobre o ONS.
    Identificamos um forte interesse em áreas como `Tecnologia` e `Engenharia Elétrica`, além de uma alta taxa de recomendação do ONS.
    O interesse em programas de `Estágio` e `Jovem Aprendiz` é promissor para futuras oportunidades.
""")

# Exemplo de uso do WordCloudWidget para áreas de interesse
st.subheader("Nuvem de Palavras das Áreas de Interesse")

# Assumindo que 'Área de Interesse' é o nome da coluna no df_formulario1
if 'Área de Interesse' in df_formulario1.columns:
    areas_interesse_texto = " ".join(df_formulario1['Área de Interesse'].dropna().astype(str).tolist())
    if areas_interesse_texto:
        wordcloud_image = create_wordcloud(areas_interesse_texto)
        fig, ax = plt.subplots(figsize = (12, 8)) # Importar matplotlib.pyplot as plt
        ax.imshow(wordcloud_image)
        plt.axis("off")
        st.pyplot(fig)
    else:
        st.info("Nenhum dado disponível na coluna 'Área de Interesse' para gerar a Nuvem de Palavras.")
else:
    st.warning("Coluna 'Área de Interesse' não encontrada no Formulário 1. Verifique o nome da coluna.")


# Exemplo de uso do IsoTypeGridWidget (para visualização de proporções)
st.subheader("Visualização de Proporções (Exemplo com IsoTypeGrid)")
# Para usar o IsoTypeGridWidget, você precisará adaptar os dados.
# Por exemplo, a proporção de pessoas interessadas em estágio vs. jovem aprendiz.
# Aqui, vou renderizar o gráfico padrão do widget.
iso_chart = get_chart_67593(use_container_width=True)

tab1, tab2 = st.tabs(["Streamlit theme (default)", "Altair native theme"])

with tab1:
    st.altair_chart(iso_chart, theme="streamlit", use_container_width=True)
with tab2:
    st.altair_chart(iso_chart, theme=None, use_container_width=True)


# Exemplo de uso do CrossHighlightWidget (para interação entre gráficos)
st.subheader("Interação entre Gráficos (Exemplo com CrossHighlight)")
st.markdown("""
    Este widget é projetado para criar gráficos interativos com destaque cruzado.
    Para uma demonstração funcional, vamos usar um conjunto de dados de exemplo.
""")

# Criar um dataframe dummy para a demonstração do CrossHighlightWidget
cross_highlight_df = pd.DataFrame({
    'categoria': ['A', 'B', 'C', 'A', 'B', 'C', 'A', 'B', 'C'],
    'valor1': [10, 20, 15, 12, 22, 18, 11, 25, 17],
    'valor2': [5, 8, 7, 6, 9, 8, 7, 10, 9]
})

# Adapte a especificação vega_lite_json se necessário para usar cross_highlight_df
# Por simplicidade, para demonstração, vou exibir a especificação original e
# um gráfico vega-lite básico que se alinha com a ideia.
# st.vega_lite_chart(cross_highlight_df, vega_lite_json, use_container_width=True)
# A especificação original em vega_lite_json usa "data": {"url": "data/movies.json"},
# Para usar com um dataframe, a especificação precisa ser atualizada.
# Por enquanto, vou fazer uma demonstração mais simples que pode ser expandida.

# Exemplo de uma especificação Vega-Lite simplificada para demonstração:
simple_vega_spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "Um gráfico de dispersão simples.",
    "mark": "point",
    "encoding": {
        "x": {"field": "valor1", "type": "quantitative"},
        "y": {"field": "valor2", "type": "quantitative"},
        "color": {"field": "categoria", "type": "nominal"}
    }
}

st.vega_lite_chart(cross_highlight_df, simple_vega_spec, use_container_width=True)
st.info("Para um destaque cruzado mais avançado, o `vega_lite_json` no `CrossHighlightWidget.py` precisa ser adaptado para usar os dados do seu dataframe ou uma estrutura de dados compatível.")
