import streamlit as st
import pandas as pd
import os
import plotly.express as px # Novo import para Plotly

# Importações do chatbot (assumindo que 'oraculo Chatbot' está no mesmo diretório)
from oraculo_chatbot.config import API_KEY, DEFAULT_MODEL, historico_c3po_inicial
from oraculo_chatbot.assistente_genai import AssistenteGenAI

from widgets.WordCloudWidget import create_wordcloud
from scripts.recommendation_system import get_recommendations
import altair as alt
import matplotlib.pyplot as plt

# Para instalar as depedencias
#! pip install pandas streamlit plotly gtts google-generativeai

# Para executar o dashboard
#! streamlit run dashboard_talentos_streamlit.py


### ---- Funções auxiliares

# --- 1. Função para carregar os dados (get_results_forms) ---
def get_results_forms():
    base_path = os.path.join(
        os.path.dirname(__file__),
        "assets"
    )
    
    file_path1 = os.path.join(base_path, "ONS Inspira__Conhecendo você👋.xlsx")
    file_path2 = os.path.join(base_path, "ONS Inspira__Foi um prazer 🤝.xlsx")

    df1 = pd.read_excel(file_path1)
    df2 = pd.read_excel(file_path2)
    
    return df1, df2

def get_initial_chatbot_history_with_context(df1: pd.DataFrame, df2: pd.DataFrame):
    # Copia o histórico inicial para não modificá-lo globalmente
    contextual_history = list(historico_c3po_inicial)

    dataframe_context = ""
    if df1 is not None and not df1.empty:
        dataframe_context += "\n\nDados do Formulário 1 (Conhecendo Você):\n" + df1.to_markdown(index=False)
    if df2 is not None and not df2.empty:
        dataframe_context += "\n\nDados do Formulário 2 (Evento Foi um Prazer):\n" + df2.to_markdown(index=False)

    if dataframe_context:
        contextual_history.append({
            "role": "user",
            "parts": [{
                "text": (
                    "Mestre Pedro, por favor, me informe sobre os dados dos formulários de talentos. "
                    "Tenho acesso a uma amostra detalhada dos dados do Formulário 1 e do Formulário 2, "
                    "que me auxiliarão a responder suas perguntas de forma mais precisa. "
                    "Aqui estão os dados: "
                    f"\n\n{dataframe_context}"
                )
            }],
        })
        contextual_history.append({"role": "model", "parts": [{"text": "Ah, compreendo, Mestre Pedro! Que maravilha! Terei esses dados em mente para auxiliá-lo da melhor forma possível. Como posso proceder?"}]})

    return contextual_history


### -----------------------------------------

# Custom CSS for styling the tabs, supporting dark and light modes
from styles import custom_css

st.markdown(custom_css, unsafe_allow_html=True)


### ---- Classes de Componentes 

# --- 2. Classe para Análise de Formulários (FormularyAnalyzer) ---
class FormularyAnalyzer:
    def __init__(self, df: pd.DataFrame, form_name: str):
        self.df = df
        self.form_name = form_name

    def display_metrics(self):
        with st.expander(f"Métricas Gerais do {self.form_name}"):
            col1, col2, col3 = st.columns(3)
            col1.metric("Total de Linhas", self.df.shape[0])
            col2.metric("Total de Colunas", self.df.shape[1])       
            # Adicione mais métricas conforme necessário
            st.write(self.df)
            #st.write(self.df.info())
            #st.write(self.df.describe())
            #st.write(self.df.columns)
            #st.write(self.df.dtypes)

    def generate_age_distribution_chart(self, name_column: str, dob_column: str, title: str):
        st.subheader(title)
        df_copy = self.df.copy()
        
        # Tenta converter a coluna de data de nascimento para datetime
        # Ignora erros para manter o DataFrame em caso de valores inválidos
        df_copy[dob_column] = pd.to_datetime(df_copy[dob_column], errors='coerce')
        
        # Remove linhas com datas de nascimento inválidas
        df_copy.dropna(subset=[dob_column], inplace=True)

        if not df_copy.empty:
            # Calcula a idade
            current_year = pd.Timestamp.now().year
            df_copy['Idade'] = current_year - df_copy[dob_column].dt.year
            
            # Ordena por idade para um gráfico de linha significativo
            df_copy.sort_values(by='Idade', inplace=True)

            # Usar o índice para garantir cores diferentes para cada entrada
            fig = px.bar(df_copy, x=name_column, y='Idade', color=df_copy.index.astype(str), 
                         title="Distribuição de Idade por Participante",
                         labels={'color': 'Entrada do Formulário'}) # Adiciona um rótulo para a legenda de cores

            # Adicionar a faixa etária de 17 a 24 anos
            intervalo_idade = [17, 24]
            fig.add_hrect(y0=intervalo_idade[0], y1=intervalo_idade[1], line_width=0, fillcolor="red", opacity=0.2, annotation_text=f"Idade: {intervalo_idade}")
            
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info(f"Não há dados de data de nascimento válidos para gerar o gráfico de idade para {self.form_name}.")

    def generate_chart1(self, column: str, title: str):
        st.subheader(title)
        # Tratamento para colunas com múltiplas seleções (separadas por ';')
        if self.df[column].dtype == 'object' and self.df[column].apply(lambda x: ';' in str(x)).any():
            # Expande as respostas de múltipla escolha
            expanded_data = self.df[column].str.split(';').explode().str.strip()
            chart_data = expanded_data.value_counts().reset_index()
            chart_data.columns = [column, 'Contagem']
            fig = px.pie(chart_data, names=column, values='Contagem')
        else:
            chart_data = self.df[column].value_counts().reset_index()
            chart_data.columns = [column, 'Contagem']
            fig = px.pie(chart_data, names=column, values='Contagem')
        st.plotly_chart(fig, use_container_width=True)

    def generate_chart2(self, column: str, title: str):
        st.subheader(title)
        chart_data = self.df[column].value_counts().reset_index()
        chart_data.columns = [column, 'Contagem']
        fig = px.pie(chart_data, names=column, values='Contagem', title=title)
        st.plotly_chart(fig, use_container_width=True)

    def generate_chart3(self, column: str, title: str):
        st.subheader(title)
        st.write(self.df[column].value_counts())
        # Aqui você pode adicionar um gráfico mais complexo, como um word cloud para texto livre, etc.

    def NuvemPalavras(self, nome_coluna: str = "Qual área do ONS te interessa mais?"):
        # Exemplo de uso do WordCloudWidget para áreas de interesse
        st.subheader("Nuvem de Palavras das Áreas de Interesse")

        df_merged = self.df.copy()

        if nome_coluna in df_merged.columns:
            # Trata a coluna 'Area de Interesse' para nuvem de palavras (lidando com múltiplos valores)
            all_interests = []
            for interests_str in df_merged[nome_coluna].dropna().astype(str):
                all_interests.extend([item.strip() for item in interests_str.split(';') if item.strip()])
            
            areas_interesse_texto = " ".join(all_interests)

            if areas_interesse_texto:
                wordcloud_image = create_wordcloud(areas_interesse_texto)
                fig, ax = plt.subplots(figsize=(12, 8))
                ax.imshow(wordcloud_image)
                plt.axis("off")
                st.pyplot(fig)
            else:
                st.info(f"Nenhum dado disponível na coluna '{nome_coluna}' para gerar a Nuvem de Palavras.")
        else:
            st.warning(f"Coluna '{nome_coluna}' não encontrada no dataframe mesclado. Verifique o nome da coluna.")

    def MarkBarChartWidget(self, type_chart: str = "altair"):
        df_merged = self.df.copy()

        # Exemplo de uso do IsoTypeGridWidget (para visualização de proporções)
        coluna = "Você pretende cursar faculdade?"
        titulo = 'Pretende Cursar Faculdade?'

        if coluna in df_merged.columns:
            # Contar a frequência das respostas
            faculdade_counts = df_merged[coluna].value_counts(normalize=True).reset_index()
            faculdade_counts.columns = ['Resposta', 'Proporcao']

            # Criar um gráfico de barras simples com Altair para mostrar a proporção
            if type_chart == "altair":
                chart_faculdade = alt.Chart(faculdade_counts).mark_bar().encode(
                    x=alt.X('Resposta:N', title=titulo),
                    y=alt.Y('Proporcao:Q', title='Proporção', axis=alt.Axis(format='%')),
                    tooltip=['Resposta', alt.Tooltip('Proporcao', format='.1%')]
                ).properties(
                    title=titulo
                )
                st.altair_chart(chart_faculdade, use_container_width=True)
                st.info("O `IsoTypeGridWidget` original cria uma grade genérica. Aqui, usamos um gráfico de barras Altair para visualizar a proporção 'Pretende Cursar Faculdade?' dos seus dados. Você pode adaptar a lógica para criar uma visualização de grade isotípica personalizada se desejar.")
            
            elif type_chart == "pizza":
                # 2. Create the pie chart using Plotly Express
                fig = px.pie(df_merged, 
                            values=faculdade_counts['Proporcao'], 
                            names=faculdade_counts['Resposta'], 
                            title=titulo,
                            hole=0.3) # Optional: create a donut chart

                # 3. Display the chart in Streamlit
                st.plotly_chart(fig, use_container_width=True)
        else:
            st.warning(f"Tipo de gráfico '{type_chart}' não suportado. Use 'altair'.")

    def CrossHighlightContainer(self):
        df_merged = self.df.copy()

        nomes_colunas = ["Escolaridade", "Qual área do ONS te interessa mais?"]

        # Exemplo de uso do CrossHighlightWidget (para interação entre gráficos)
        st.subheader(f" {nomes_colunas[0]} vs. {nomes_colunas[1]}")
        st.markdown("""
            Este widget é projetado para criar gráficos interativos com destaque cruzado.
            Vamos criar dois gráficos Altair que interagem, mostrando a relação entre a escolaridade e as áreas de interesse.
        """)

        if 'Escolaridade' in df_merged.columns and 'Qual área do ONS te interessa mais?' in df_merged.columns:
            # Gráfico 1: Escolaridade
            base = alt.Chart(df_merged).encode(
                x=alt.X('count()', title='Número de Pessoas'),
                y=alt.Y(f'{nomes_colunas[0]}:N', sort='-x', title=f'{nomes_colunas[0]}'),
                tooltip=[f'{nomes_colunas[0]}', 'count()']
            )

            brush = alt.selection_interval(encodings=['y']) # Seleção na barra de escolaridade

            bars_edu = base.mark_bar().encode(
                color=alt.condition(brush, 'Escolaridade:N', alt.value('lightgray'))
            ).add_params(brush)

            # Gráfico 2: Área de Interesse filtrado pela escolaridade selecionada
            chart_area_filtered = alt.Chart(df_merged).mark_bar().encode(
                x=alt.X('count()', title='Número de Pessoas'),
                y=alt.Y(f'{nomes_colunas[1]}:N', sort='-x', title=f'{nomes_colunas[1]}'),
                tooltip=[f'{nomes_colunas[1]}', 'count()']
            ).transform_filter(brush) # Filtra áreas de interesse com base na seleção de escolaridade

            # Concatenar os dois gráficos
            st.altair_chart(bars_edu | chart_area_filtered, use_container_width=True)

        else:
            st.warning("Colunas 'Escolaridade' ou 'Area de Interesse' não encontradas no dataframe mesclado para o Cross-Highlight. Verifique os nomes das colunas.")


    def SistemaRecomendaWidget(self, df_merged):

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
                    'Qual área do ONS te interessa mais?',
                    'O que você acha que o ONS faz?',
                    #'Depois de hoje, como você descreveria o ONS?',
                    #'Em poucas palavras, o que mais te marcou no evento?'
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

                        #plot das recomendações
                        fig = px.bar(
                            recommended_candidates,
                            x='Nome Completo',
                            y='Similaridade',
                            title=f'Similarity Scores dos Candidatos Recomendados para {selected_candidate_str}',
                            labels={'Nome Completo': 'Candidato', 'Similaridade': 'Pontuação de Similaridade'}
                        )
                        
                        
                        #st.plotly_chart(fig, use_container_width=True)
                        

                    else:
                        st.info("Nenhum candidato recomendado encontrado ou o candidato selecionado não possui informações de texto suficientes.")
                else:
                    st.warning("Nenhuma das colunas de texto para recomendação foi encontrada no dataframe mesclado. Verifique os nomes das colunas.")
        else:
            st.warning("O DataFrame mesclado está vazio ou as colunas 'Email' ou 'Nome Completo' não foram encontradas para o sistema de recomendação.")

        # ------------- Fim do Sistema de Recomendação -------------


    def BarChart(self, df, column, tittle):
        st.subheader(tittle)
        chart_data = df[column].value_counts().reset_index()
        chart_data.columns = [column, 'Contagem']
        fig = px.bar(chart_data, x=column, y='Contagem')
        st.plotly_chart(fig, use_container_width=True)

# --- 3. Classe para o Chatbot (ChatbotComponent) ---
class ChatbotComponent:
    def __init__(self, model_name: str = DEFAULT_MODEL):
        self.model_name = model_name
        self.assistente = AssistenteGenAI(api_key=API_KEY) # Inicializa o assistente
        
        # O st.session_state.messages será inicializado externamente (no DashboardApp)
        # Se por algum motivo ele não estiver inicializado (ex: primeiro carregamento da sessão sem DashboardApp),
        # ele será um array vazio, mas o DashboardApp garante o contexto.
        if 'current_audio_bytes' not in st.session_state:
            st.session_state.current_audio_bytes = None
        if 'current_audio_key' not in st.session_state:
            st.session_state.current_audio_key = None
        if 'last_processed_user_message' not in st.session_state:
            st.session_state.last_processed_user_message = None


        
        self.PROMPT_RH = "me de os 5 melhores candidatos que tem a faixa de idade de 18 a 25 anos, que se interessa no programa de estagio ou jovem aprendiz do ONS e se interessa na área adminstrativa e tecnologia e me de as duas tabelas separadas "

    def display_chatbot(self):
        st.subheader("Chatbot ONS Inspira (Powered by Gemini)")
        st.write("Olá! Eu sou o chatbot do ONS Inspira. Pergunte-me sobre os programas ou qualquer dúvida que tiver! Posso te ajudar com informações sobre os formulários de talentos.")

        # Exibir histórico de chat (apenas mensagens não-contextuais)
        chat_history_container = st.container(height=500, border=False)
        with chat_history_container:
            for i, message in enumerate(st.session_state.messages):
                if message.get("is_context_message"):
                    continue # Ignora mensagens de contexto

                role = message["role"]
                display_text = ""
                if "parts" in message and isinstance(message["parts"], list):
                    display_text = "".join(p.get("text", "") for p in message["parts"] if isinstance(p, dict))

                with st.chat_message(name=role, avatar="🤖" if role == "model" else "🧑‍🚀"):
                    st.markdown(display_text)
                    if role == "model" and display_text and not display_text.startswith("🤖"):
                        tts_button_key = f"tts_{i}_{role}"
                        if st.button(f"🔊 Ouvir", key=tts_button_key, help="Ouvir a resposta do Chatbot"):
                            with st.spinner("Gerando áudio... Por favor, aguarde."):
                                audio_bytes, error = self.assistente.generate_audio_gtts(display_text)
                                if error:
                                    st.toast(f"Erro no TTS: {error}", icon="🚨")
                                elif audio_bytes:
                                    st.session_state.current_audio_bytes = audio_bytes
                                    st.session_state.current_audio_key = tts_button_key
                                    st.rerun()
        
        # Audio Player
        if 'current_audio_bytes' in st.session_state and st.session_state.current_audio_bytes:
            if 'last_triggered_button_key' not in st.session_state or st.session_state.last_triggered_button_key == st.session_state.get('current_audio_key'):
                st.audio(st.session_state.current_audio_bytes, format='audio/mp3', start_time=0)
            st.session_state.current_audio_bytes = None
            st.session_state.current_audio_key = None

        # User Input
        user_prompt = st.chat_input("Digite sua mensagem para o Chatbot...")
        if user_prompt:
            st.session_state.messages.append({"role": "user", "parts": [{"text": user_prompt}]})
            st.session_state.current_audio_bytes = None
            st.session_state.current_audio_key = None
            st.rerun()

        # Handle Gemini Response (chamada fora do loop de entrada para evitar reruns indesejados)
        self._handle_gemini_response()

    def _handle_gemini_response(self):
        if st.session_state.messages and st.session_state.messages[-1]["role"] == "user":
            if 'last_processed_user_message' not in st.session_state or st.session_state.last_processed_user_message != st.session_state.messages[-1]:
                last_user_message = st.session_state.messages[-1]
                st.session_state.last_processed_user_message = last_user_message

                with st.spinner("Chatbot está pensando..."):
                    response_text, ai_history_entry, error = self.assistente.send_to_gemini(
                        prompt_text=last_user_message["parts"][0]["text"],
                        history=st.session_state.messages[:-1]
                    )

                if ai_history_entry:
                    st.session_state.messages.append(ai_history_entry)
                elif response_text and not ai_history_entry:
                    st.session_state.messages.append({"role": "model", "parts": [{"text": response_text}]})
                elif error:
                    st.session_state.messages.append({"role": "model", "parts": [{"text": f"🤖 Oh não! Erro interno: {error}"}]})
                st.rerun()

### -----------------------------------------
# --- 4. Classe Principal do Dashboard (DashboardApp) ---
class DashboardApp:
    def __init__(self):
        st.set_page_config(
            page_title="ONS Inspira - Banco de Talentos",
            layout="wide"
            #initial_sidebar_state="expanded"
        )

        # Carregar os dados dos formulários (models)
        self.df1, self.df2 = get_results_forms()

        # Importação das classes de análise de formulários (Controllers)
        self.analyzer1 = FormularyAnalyzer(self.df1, "Formulário 1: Conhecendo Você")
        self.analyzer2 = FormularyAnalyzer(self.df2, "Formulário 2: Evento Foi um Prazer")

        # Inicializar st.session_state.messages com o histórico contextualizado
        if 'messages' not in st.session_state:
            initial_history_with_context = get_initial_chatbot_history_with_context(self.df1, self.df2)
            st.session_state.messages = initial_history_with_context
        
        self.chatbot = ChatbotComponent()
        if not self.df1.empty and not self.df2.empty:
            print("✅ DataFrames carregados e passado para o histórico inicial do chatbot!")

    def AppBar(self):
        st.title("Minha App Bar")

        # Cria três colunas para organizar os botões
        col1, col2, col3 = st.columns(3)

        # Botão de link para o Google
        with col1:
            st.link_button("Site Dashboard Template", "https://dashboard-moderno.streamlit.app/")

        # Botão de link para o Streamlit
        with col2:
            st.link_button("Documentação Streamlit", "https://docs.streamlit.io/")

        # Botão de link com ícone
        with col3:
            st.link_button("Galeria Streamlit", "https://vega.github.io/editor/#/examples/vega-lite/isotype_grid", use_container_width=True, icon="🚀")

    def run(self):
        #self.AppBar()

        col1, col2 = st.columns(2)
        with col1:
            try:
                st.image("assets/imgs/Logo_ONSInspira.png", use_column_width=True)
            except Exception as e:
                st.error(f"Erro ao carregar a imagem: {e}")


        with col2:
            st.title("Dashboard ONS Inspira 2025")
            st.subheader("Análise de Candidatos para o Banco de talentos ")
            st.markdown("Este dashboard apresenta uma análise detalhada das informações coletadas para a criação de um Banco de Talentos para o programa ONS Inspira, auxiliando o RH na seleção de futuros colaboradores.")

        # Inicializar st.session_state.messages com o histórico contextualizado
        if 'messages' not in st.session_state:
            initial_history_with_context = get_initial_chatbot_history_with_context(self.df1, self.df2)
            st.session_state.messages = initial_history_with_context

        tab1, tab2, tab_chatbot = st.tabs([
            "Formulário 1: Conhecendo os candidatos",
            "Formulário 2: Agradecimento após evento WorkShop",
            "Chatbot AI"
        ])

        with tab1:
            self.analyzer1.display_metrics()

            #! Escolaridade, Já conhece o ONS, O que acha da empresa, Qual área do ONS te interessa mais? Pretende cursar faculdade?

            #! 1) Idades dos Participantes (contador)
            self.analyzer1.generate_age_distribution_chart("Nome", "Data de Nascimento", "Distribuição de Idade dos Participantes")

            # separando um container com tabela e grafico um do lado do outro
            st.subheader("Áreas de Interesse dos candidatos (Form. 1)")
            col1, col2 = st.columns(2)
            with col1:
                st.dataframe(self.df1[["Nome", "Qual área do ONS te interessa mais?"]])
            with col2:
                #self.analyzer1.generate_chart1("Qual área do ONS te interessa mais?", "Áreas de Interesse dos candidatos (Form. 1)")
                self.analyzer1.BarChart(self.df1, "Qual área do ONS te interessa mais?", "Nome do candidato X Área de interesse")

            # 2) Pretendo cursar faculdade? (IsoTypeGridWidget)
            self.analyzer1.MarkBarChartWidget(
                type_chart="pizza"
            )
        
            # 3) Escolaridade vs. Área de Interesse
            self.analyzer1.CrossHighlightContainer()
            

            # 4) Nuvem de Palavras O que eles acham sobre o que é ONS
            #self.analyzer1.NuvemPalavras()

        with tab2:
            self.analyzer2.display_metrics()

            #! Já conhece o ONS antes da Visita? Como descreve a empresa ONS? Qual área do ONS te interessa mais? Pretende pretenda participar dos processos seletivos? Quer fazer faculdade?
            # 1) Já conhece o ONS antes da Visita? Como descreve a empresa ONS?
            
            # 2) Nome do candidato vs Qual área do ONS te interessa mais? vs Pretende cursar faculdade?
            #self.analyzer2.generate_chart1("Quais áreas do ONS vc mais se interessou?", "Áreas de Interesse dos candidatos")
            #self.analyzer2.BarChart(self.df2, "Qual área do ONS te interessa mais?", "Áreas de Interesse dos candidatos (Form. 2)")

            # 3) Nuvem de Palavras - O que mais te marcou no evento?
            #self.analyzer2.NuvemPalavras("Em poucas palavras, o que mais te marcou no evento?")

            # 4) Você já conhecia o ONS antes da visita? Você tem interesse em participar de programas do ONS?
            self.analyzer2.generate_chart1("Você já conhecia o ONS antes da visita?", "Conhecimento Prévio do ONS")

            # Sistema de Recomendação de Candidatos
            # 5) O que mais te marcou no evento ONS Inspira? Quer receber informacoes sobre futuros processos seletivos?
            self.analyzer2.SistemaRecomendaWidget(pd.merge(self.df1, self.df2, how='outer'))

            self.analyzer2.generate_chart2("Você tem interesse em participar de programas do ONS?", "Interesse em Programas ONS")


        with tab_chatbot:
            # Garantir que o assistente do chatbot esteja carregado
            if not self.chatbot.assistente.model:
                st.error("🔴 Modelo de IA para o chatbot não pôde ser carregado. Verifique a API Key.")
            else:
                self.chatbot.display_chatbot()

# --- Execução Principal ---
if __name__ == "__main__":
    app = DashboardApp()
    app.run()
