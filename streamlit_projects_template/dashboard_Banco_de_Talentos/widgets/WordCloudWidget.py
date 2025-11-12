import streamlit as st
from wordcloud import WordCloud
import matplotlib.pyplot as plt
import io # Importar io para lidar com bytes da imagem
from collections import Counter # Mover import para o topo

def create_wordcloud(text):
    wordcloud_img = WordCloud(width = 300, height = 300,
                background_color ='white',
                min_font_size = 10).generate(text)
    return wordcloud_img

def get_wordcloud_data_for_streamlit(text_data):
    # Processa o texto para o formato que streamlit_wordcloud.visualize espera
    # Esta é uma implementação simplificada e pode precisar de mais refinamento
    # dependendo da complexidade dos seus dados e do que você quer na nuvem.
    
    # Para demonstração, vou contar a frequência das palavras
    words = text_data.split()
    word_counts = Counter(words)

    # Convertendo para o formato esperado pelo streamlit_wordcloud
    # Exemplo: [{"text": "word1", "value": 10}, {"text": "word2", "value": 5}]
    word_list = []
    for word, count in word_counts.items():
        if len(word) > 2: # Opcional: filtrar palavras muito curtas
            word_list.append({"text": word, "value": count, "color": "#b5de2b"}) # Cor fixa para demonstração
    return word_list

def create_categorized_wordclouds(df, text_column, category_column):
    categorized_wordclouds = {}
    if text_column not in df.columns or category_column not in df.columns:
        st.warning(f"Colunas '{text_column}' ou '{category_column}' não encontradas no DataFrame.")
        return categorized_wordclouds

    # Trata categorias que podem ter múltiplos valores (ex: ';')
    df_exploded = df.assign(**{category_column: df[category_column].astype(str).str.split(';')}).explode(category_column)
    df_exploded[category_column] = df_exploded[category_column].str.strip()

    unique_categories = df_exploded[category_column].dropna().unique()

    for category in unique_categories:
        # Filtrar o DataFrame para a categoria atual
        filtered_df = df_exploded[df_exploded[category_column] == category]
        
        # Combinar o texto da coluna de texto para a categoria
        combined_text = " ".join(filtered_df[text_column].dropna().astype(str).tolist())
        
        if combined_text:
            # Gerar a nuvem de palavras para a categoria
            wordcloud_obj = create_wordcloud(combined_text)
            categorized_wordclouds[category] = wordcloud_obj
        
    return categorized_wordclouds