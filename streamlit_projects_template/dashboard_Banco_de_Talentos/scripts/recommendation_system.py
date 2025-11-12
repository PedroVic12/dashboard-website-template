import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def preprocess_text_for_recommendation(df, text_columns):
    """
    Preprocessa as colunas de texto para o sistema de recomendação.
    Combina o texto de múltiplas colunas e trata valores NaN.
    """
    df_copy = df.copy()
    df_copy['combined_text'] = df_copy[text_columns].fillna('').agg(' '.join, axis=1)
    return df_copy

def get_recommendations(df_original, candidate_id, text_columns, top_n=5):
    """
    Gera recomendações de candidatos com base na similaridade de texto.

    Args:
        df_original (pd.DataFrame): O DataFrame original com todos os dados dos candidatos.
        candidate_id: O ID do candidato para o qual as recomendações serão geradas.
        text_columns (list): Lista de nomes das colunas de texto a serem usadas para similaridade.
        top_n (int): Número de recomendações a serem retornadas.

    Returns:
        pd.DataFrame: Um DataFrame contendo os candidatos recomendados, com sua similaridade.
    """
    if 'Email' not in df_original.columns:
        raise ValueError("A coluna 'Email' é necessária para identificar os candidatos.")

    # Pré-processar o texto
    df_processed = preprocess_text_for_recommendation(df_original, text_columns)

    # Inicializar o vetorizador TF-IDF
    tfidf_vectorizer = TfidfVectorizer(stop_words=None) # Ajustar stop_words conforme necessário

    # Ajustar e transformar o texto combinado em uma matriz TF-IDF
    tfidf_matrix = tfidf_vectorizer.fit_transform(df_processed['combined_text'])

    # Encontrar o índice do candidato selecionado
    try:
        candidate_index = df_processed[df_processed['Email'] == candidate_id].index[0]
    except IndexError:
        return pd.DataFrame() # Retorna um DataFrame vazio se o candidato não for encontrado

    # Calcular a similaridade de cosseno entre o candidato selecionado e todos os outros
    cosine_similarities = cosine_similarity(tfidf_matrix[candidate_index:candidate_index+1], tfidf_matrix).flatten()

    # Obter os índices dos candidatos mais semelhantes (excluindo o próprio candidato)
    # Usar argsort para obter índices ordenados
    related_indices = cosine_similarities.argsort()[:-top_n-2:-1] # top_n + 1 para excluir o próprio candidato

    # Criar um DataFrame com os candidatos recomendados e suas similaridades
    recommendations = pd.DataFrame({
        'Email': df_original.loc[related_indices, 'Email'].values,
        'Nome Completo': df_original.loc[related_indices, 'Nome Completo'].values,
        'Similaridade': cosine_similarities[related_indices]
    })

    # Remover o próprio candidato da lista de recomendações
    recommendations = recommendations[recommendations['Email'] != candidate_id]
    
    return recommendations
