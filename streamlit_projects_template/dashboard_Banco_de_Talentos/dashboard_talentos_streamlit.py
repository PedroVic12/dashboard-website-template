import streamlit as st
import pandas as pd
import os
import plotly.express as px # Novo import para Plotly
import google.generativeai as genai
from gtts import gTTS
import io

# Importações do chatbot (assumindo que 'oraculo Chatbot' está no mesmo diretório)
from oraculo_chatbot.config import API_KEY, DEFAULT_MODEL, historico_c3po_inicial
from oraculo_chatbot.assistente_genai import AssistenteGenAI

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


### ----

# Custom CSS for styling the tabs, supporting dark and light modes
custom_css = """
<style>
/* General tab styling */
.stTabs [data-baseweb="tab-list"] button {
    border-radius: 5px 5px 0 0;
    transition: all 0.3s ease; /* Smooth transition for hover effects */
    padding: 0.5em 1em; /* Adjust padding for text size */
    font-size: 1rem; /* Adjust font size as needed */
}




/* Active tab - Common styles */
.stTabs [data-baseweb="tab-list"] button[aria-selected="true"] {
    font-weight: bold;
}

/* Tab content area - Common styles */
.stTabs [data-baseweb="tab-panel"] {


    padding: 1em;
    border-radius: 0 0 5px 5px;
}

/* Light mode */
.light-mode .stTabs [data-baseweb="tab-list"] button {
    background-color: #f0f2f6; /* Light gray background for inactive tabs */
    color: #333;
}

.light-mode .stTabs [data-baseweb="tab-list"] button[aria-selected="true" {
    background-color: #4CAF50; /* Green background for active tab */
    color: white;
}

.light-mode .stTabs [data-baseweb="tab-panel"] {
    background-color: #e6e6e6; /* Lighter gray background for content */
    color: black;
}

/* Dark mode */
.dark-mode .stTabs [data-baseweb="tab-list"] button {
    background-color: #262730; /* Dark gray background for inactive tabs */
    color: #808080;
}

.dark-mode .stTabs [data-baseweb="tab-list"] button[aria-selected="true"] {
    background-color: #4CAF50; /* Green background for active tab */
    color: white;
}

.dark-mode .stTabs [data-baseweb="tab-panel"] {
    background-color: #464755; /* Darker gray background for content */
    color: #FAFAFA;
}

/* Responsive adjustments (example) */
@media (max-width: 600px) {
    .stTabs [data-baseweb="tab-list"] button {
        font-size: 0.8rem; /* Smaller font size on smaller screens */
        padding: 0.4em 0.8em;
    }
}
</style>

<script>
// Function to add/remove dark mode class based on Streamlit theme
function detectColorScheme() {
  var theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    document.body.classList.remove("light-mode");
  } else {
    document.body.classList.add("light-mode");
    document.body.classList.remove("dark-mode");
  }
}

// Initial detection
detectColorScheme();

// Listen for changes in prefers-color-scheme
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", detectColorScheme);
</script>
"""



### ---- Classes Principais 

# --- 2. Classe para Análise de Formulários (FormularyAnalyzer) ---
class FormularyAnalyzer:
    def __init__(self, df: pd.DataFrame, form_name: str):
        self.df = df
        self.form_name = form_name

    def display_metrics(self):
        st.subheader(f"Métricas Gerais do {self.form_name}")
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
            st.bar_chart(chart_data, x=column, y='Contagem')
        else:
            chart_data = self.df[column].value_counts().reset_index()
            chart_data.columns = [column, 'Contagem']
            st.bar_chart(chart_data, x=column, y='Contagem')

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

# --- 4. Classe Principal do Dashboard (DashboardApp) ---
class DashboardApp:
    def __init__(self):
        st.set_page_config(
            page_title="ONS Inspira - Banco de Talentos",
            layout="wide"
            #initial_sidebar_state="expanded"
        )
        self.df1, self.df2 = get_results_forms()

        # Importação das classes de análise de formulários
        self.analyzer1 = FormularyAnalyzer(self.df1, "Formulário 1: Conhecendo Você")
        self.analyzer2 = FormularyAnalyzer(self.df2, "Formulário 2: Evento Foi um Prazer")

        # Inicializar st.session_state.messages com o histórico contextualizado
        if 'messages' not in st.session_state:
            initial_history_with_context = get_initial_chatbot_history_with_context(self.df1, self.df2)
            st.session_state.messages = initial_history_with_context
        
        self.chatbot = ChatbotComponent()
        if not self.df1.empty and not self.df2.empty:
            print("✅ DataFrames carregados e passado para o histórico inicial do chatbot!")


    def run(self):
        st.markdown(custom_css, unsafe_allow_html=True)

        st.title("Dashboard ONS Inspira 2025")
        st.subheader("Análise de Candidatos para o Banco de talentos ")
        st.markdown("Este dashboard apresenta uma análise detalhada das informações coletadas para a criação de um Banco de Talentos para o programa ONS Inspira, auxiliando o RH na seleção de futuros colaboradores.")

        # Inicializar st.session_state.messages com o histórico contextualizado
        if 'messages' not in st.session_state:
            initial_history_with_context = get_initial_chatbot_history_with_context(self.df1, self.df2)
            st.session_state.messages = initial_history_with_context

        tab1, tab2, tab_chatbot = st.tabs([
            #"Formulário 1: Conhecendo Você", 
            #"Formulário 2: Evento Foi um Prazer", 
            "Formulário 1: Conhecendo os candidatos",
            "Formulário 2: Agradecimento pelo evento WorkShop",
            "Chatbot AI"
        ])

        with tab1:
            self.analyzer1.display_metrics()

            #! Idades dos Participantes
            self.analyzer1.generate_age_distribution_chart("Nome", "Data de Nascimento", "Distribuição de Idade dos Participantes")


            #! Escolaridade, Já conhece o ONS, O que acha da empresa, Qual área do ONS te interessa mais? Pretende cursar faculdade?
            #self.analyzer1.generate_chart1("Escolaridade", "Distribuição por Escolaridade")
            #self.analyzer1.generate_chart1("Qual área do ONS te interessa mais?", "Áreas de Interesse (Form. 1)")
            #self.analyzer1.generate_chart2("Você pretende cursar faculdade?", "Intenção de Cursar Faculdade")

        with tab2:
            self.analyzer2.display_metrics()

            #! Já conhece o ONS antes da Visita? Como descreve a empresa ONS, Qual área do ONS te interessa mais? Pretende pretenda participar dos processos seletivos? Quer fazer faculdade?


            #! O que mais te marcou no evento ONS Inspira? Quer receber informacoes sobre futuros processos seletivos?

            #self.analyzer2.generate_chart1("Você já conhecia o ONS antes da visita?", "Conhecimento Prévio do ONS")
            #self.analyzer2.generate_chart1("Quais áreas do ONS vc mais se interessou?", "Áreas de Interesse (Form. 2)")
            #self.analyzer2.generate_chart2("Você tem interesse em participar de programas do ONS?", "Interesse em Programas ONS")

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
