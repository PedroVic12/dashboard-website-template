import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from typing import Dict, List, Any, Union, Tuple
from datetime import datetime
import io

# ====================================
# MODEL LAYER
# ====================================

class DataModel:
    """Model para gerenciamento de dados"""
    
    def __init__(self, data_source: Union[str, pd.DataFrame]):
        self.data_source = data_source
        self.df = None
        self.df_filtered = None
        self.load_data()
    
    def load_data(self) -> pd.DataFrame:
        """Carrega dados de diferentes fontes e realiza limpeza inicial."""
        try:
            if isinstance(self.data_source, str):
                if self.data_source.endswith('.csv'):
                    self.df = pd.read_csv(self.data_source)
                elif self.data_source.endswith(('.xlsx', '.xls')):
                    self.df = pd.read_excel(self.data_source, engine='openpyxl')
                else:
                    # Assume CSV se não tiver extensão clara
                    self.df = pd.read_csv(self.data_source)
            
            elif isinstance(self.data_source, pd.DataFrame):
                self.df = self.data_source.copy()
            
            elif hasattr(self.data_source, 'name'):
                file_name = self.data_source.name
                if file_name.endswith('.csv'):
                    self.df = pd.read_csv(self.data_source)
                elif file_name.endswith(('.xlsx', '.xls')):
                    self.df = pd.read_excel(self.data_source, engine='openpyxl')
                else:
                    raise ValueError("Formato não suportado. Use .csv ou .xlsx.")
            else:
                raise ValueError("Fonte de dados inválida")
            
            # Limpeza de colunas
            self.df = self.df.loc[:, ~self.df.columns.str.contains('^Unnamed')]
            self.df.columns = [str(col).strip() for col in self.df.columns]
            
            # Detecta e converte colunas de data
            self._auto_detect_dates()
            
            self.df_filtered = self.df.copy()
            return self.df
        
        except Exception as e:
            st.error(f"Erro ao carregar dados: {str(e)}")
            return pd.DataFrame()
    
    def _auto_detect_dates(self):
        """Detecta e converte automaticamente colunas de data."""
        for col in self.df.columns:
            if self.df[col].dtype == 'object':
                try:
                    # Tenta converter para datetime
                    converted = pd.to_datetime(self.df[col], errors='coerce')
                    if converted.notna().sum() / len(self.df) > 0.5:
                        self.df[col] = converted
                except:
                    pass
    
    def apply_filters(self, filters: Dict[str, Any]) -> pd.DataFrame:
        """Aplica filtros aos dados"""
        if self.df is None or self.df.empty:
            return pd.DataFrame()
        
        df_temp = self.df.copy()
        
        for column, values in filters.items():
            if values and column in df_temp.columns:
                if isinstance(values, (list, tuple)):
                    if len(values) == 2 and all(isinstance(v, (int, float)) for v in values):
                        condition = (df_temp[column] >= values[0]) & (df_temp[column] <= values[1])
                        df_temp = df_temp[condition | df_temp[column].isna()]
                    else:
                        df_temp = df_temp[df_temp[column].isin(values)]
        
        self.df_filtered = df_temp
        return self.df_filtered
    
    def get_column_info(self) -> Dict[str, List[str]]:
        """Retorna informações sobre tipos de colunas"""
        if self.df is None:
            return {"numeric": [], "categorical": [], "datetime": []}
        
        return {
            "numeric": self.df.select_dtypes(include=np.number).columns.tolist(),
            "categorical": self.df.select_dtypes(include=['object', 'category']).columns.tolist(),
            "datetime": self.df.select_dtypes(include=['datetime64']).columns.tolist()
        }
    
    def calculate_metrics(self) -> Dict[str, Any]:
        """Calcula métricas gerais e detalhadas dos dados filtrados"""
        if self.df_filtered is None or self.df_filtered.empty:
            return {}
        
        metrics = {
            "total_records": len(self.df_filtered),
            "total_columns": len(self.df_filtered.columns),
            "missing_values": self.df_filtered.isna().sum().sum(),
            "numeric_details": {}
        }
        
        column_info = self.get_column_info()
        
        for col in column_info["numeric"]:
            if col in self.df_filtered.columns:
                metrics["numeric_details"][col] = {
                    "Média": self.df_filtered[col].mean(),
                    "Mediana": self.df_filtered[col].median(),
                    "Máximo": self.df_filtered[col].max(),
                    "Mínimo": self.df_filtered[col].min(),
                    "Desvio Padrão": self.df_filtered[col].std()
                }
        
        return metrics
    
    def calculate_grouped_metrics(self, group_by_col: str, agg_col: str, agg_func: str) -> pd.DataFrame:
        """Calcula métricas agrupadas"""
        if self.df_filtered is None or self.df_filtered.empty:
            return pd.DataFrame()
        
        try:
            grouped_df = self.df_filtered.groupby(group_by_col)[agg_col].agg(agg_func).reset_index()
            return grouped_df.sort_values(by=agg_col, ascending=False)
        except Exception:
            return pd.DataFrame()
    
    def export_to_csv(self) -> bytes:
        """Exporta dados filtrados para CSV"""
        return self.df_filtered.to_csv(index=False).encode('utf-8')
    
    def export_to_excel(self) -> bytes:
        """Exporta dados filtrados para Excel"""
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            self.df_filtered.to_excel(writer, index=False, sheet_name='Dados')
        return output.getvalue()


# ====================================
# CHART GENERATOR LAYER
# ====================================

class MatplotlibChartGenerator:
    """Gerador de gráficos usando Matplotlib e Seaborn"""
    
    def __init__(self, df: pd.DataFrame, style: str = 'seaborn-v0_8-whitegrid'):
        self.df = df
        plt.style.use(style)
        sns.set_palette("viridis")
    
    def _setup_chart(self, title: str, figsize: Tuple = (10, 6)) -> Tuple[plt.Figure, plt.Axes]:
        fig, ax = plt.subplots(figsize=figsize)
        ax.set_title(title, fontsize=14, weight='bold')
        return fig, ax
    
    def create_line_chart(self, x_column: str, y_column: str, color_column: str = None) -> plt.Figure:
        """Cria um gráfico de linhas"""
        x_label = x_column.replace("_", " ").title() if x_column != '[Índice]' else 'Índice'
        title = f'{y_column.replace("_", " ").title()} por {x_label}'
        if color_column:
            title += f' (por {color_column.title()})'
        
        fig, ax = self._setup_chart(title)
        
        df_plot = self.df.copy()
        if x_column == '[Índice]':
            df_plot['[Índice]'] = df_plot.index
        
        sns.lineplot(data=df_plot, x=x_column, y=y_column, hue=color_column, marker='o', ax=ax)
        
        ax.set_xlabel(x_label)
        ax.set_ylabel(y_column.replace('_', ' ').title())
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        return fig
    
    def create_bar_chart(self, x_column: str, y_column: str = None, color_column: str = None, horizontal: bool = False) -> plt.Figure:
        """Cria um gráfico de barras"""
        fig, ax = self._setup_chart("")
        
        if y_column:
            title = f'Média de {y_column.title()} por {x_column.title()}'
            if color_column:
                title += f' (por {color_column.title()})'
            ax.set_title(title, fontsize=14, weight='bold')
            sns.barplot(data=self.df, x=x_column, y=y_column, hue=color_column, ax=ax, orient='v' if not horizontal else 'h')
        else:
            title = f'Contagem de {x_column.title()}'
            if color_column:
                title += f' (por {color_column.title()})'
            ax.set_title(title, fontsize=14, weight='bold')
            sns.countplot(data=self.df, x=x_column if not horizontal else None, y=x_column if horizontal else None, hue=color_column, ax=ax)
        
        if not horizontal:
            plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        return fig
    
    def create_pie_chart(self, column: str, top_n: int = 7) -> plt.Figure:
        title = f'Distribuição de {column.replace("_", " ").title()}'
        fig, ax = self._setup_chart(title)
        data = self.df[column].value_counts()
        
        if len(data) > top_n:
            top_data = data.head(top_n)
            others = pd.Series([data.iloc[top_n:].sum()], index=['Outros'])
            data_to_plot = pd.concat([top_data, others])
        else:
            data_to_plot = data
        
        ax.pie(data_to_plot, labels=data_to_plot.index, autopct='%1.1f%%', startangle=90)
        ax.axis('equal')
        plt.tight_layout()
        return fig
    
    def create_scatter_plot(self, x_column: str, y_column: str, color_column: str = None) -> plt.Figure:
        title = f'{y_column.title()} vs {x_column.title()}'
        fig, ax = self._setup_chart(title)
        sns.scatterplot(data=self.df, x=x_column, y=y_column, hue=color_column, palette="viridis", ax=ax, alpha=0.7)
        ax.set_xlabel(x_column.title())
        ax.set_ylabel(y_column.title())
        plt.tight_layout()
        return fig
    
    def create_histogram(self, column: str, bins: int = 30) -> plt.Figure:
        title = f'Distribuição de {column.title()}'
        fig, ax = self._setup_chart(title)
        ax.hist(self.df[column].dropna(), bins=bins, color='steelblue', edgecolor='black', alpha=0.7)
        ax.set_xlabel(column.title())
        ax.set_ylabel('Frequência')
        plt.tight_layout()
        return fig


# ====================================
# VIEW LAYER
# ====================================

class DashboardView:
    """View para interface do dashboard"""
    
    def render_header(self, title: str, description: str = None):
        st.title(title)
        if description:
            st.markdown(description)
    
    def render_sidebar_filters(self, df: pd.DataFrame, column_info: Dict[str, List[str]]) -> Dict[str, Any]:
        st.sidebar.header("🔍 Filtros")
        
        # Info do dataset
        with st.sidebar.expander("📊 Info do Dataset", expanded=True):
            st.metric("Registos Totais", f"{len(df):,}")
            st.metric("Colunas", len(df.columns))
            st.metric("Valores Nulos", f"{df.isna().sum().sum():,}")
        
        filters = {}
        
        # Filtros categóricos
        if column_info["categorical"]:
            st.sidebar.subheader("📋 Filtros Categóricos")
            for col in column_info["categorical"]:
                if 1 < df[col].nunique() <= 50:
                    unique_vals = df[col].unique()
                    nan_values = [v for v in unique_vals if pd.isna(v)]
                    non_nan_values = sorted([v for v in unique_vals if pd.notna(v)])
                    final_options = nan_values + non_nan_values
                    filters[col] = st.sidebar.multiselect(
                        col.title(), 
                        final_options, 
                        default=final_options,
                        key=f"filter_{col}"
                    )
        
        # Filtros numéricos
        if column_info["numeric"]:
            st.sidebar.subheader("🔢 Filtros Numéricos")
            for col in column_info["numeric"]:
                if not df[col].dropna().empty:
                    min_val, max_val = float(df[col].dropna().min()), float(df[col].dropna().max())
                    if min_val < max_val:
                        filters[col] = st.sidebar.slider(
                            col.title(), 
                            min_val, 
                            max_val, 
                            (min_val, max_val),
                            key=f"slider_{col}"
                        )
        
        if st.sidebar.button("🔄 Reiniciar Filtros"):
            st.rerun()
        
        return filters
    
    def render_metrics(self, metrics: Dict[str, Any], column_info: Dict[str, List[str]]):
        st.divider()
        st.subheader("📈 Métricas dos Dados Filtrados")
        
        if not metrics or "total_records" not in metrics:
            st.warning("Nenhuma métrica disponível.")
            return
        
        col1, col2, col3 = st.columns(3)
        col1.metric("Total de Registos", f"{metrics.get('total_records', 0):,}")
        col2.metric("Total de Colunas", f"{metrics.get('total_columns', 0):,}")
        col3.metric("Valores Ausentes", f"{metrics.get('missing_values', 0):,}")
        
        if column_info["numeric"]:
            st.divider()
            st.markdown("### 📊 Estatísticas Descritivas")
            
            selected_col = st.selectbox(
                "Selecione uma coluna numérica:", 
                column_info["numeric"],
                key="metric_col_select"
            )
            
            if selected_col and selected_col in metrics.get("numeric_details", {}):
                details = metrics["numeric_details"][selected_col]
                cols = st.columns(5)
                cols[0].metric("Mínimo", f"{details.get('Mínimo', 0):.2f}")
                cols[1].metric("Média", f"{details.get('Média', 0):.2f}")
                cols[2].metric("Mediana", f"{details.get('Mediana', 0):.2f}")
                cols[3].metric("Máximo", f"{details.get('Máximo', 0):.2f}")
                cols[4].metric("Desvio Padrão", f"{details.get('Desvio Padrão', 0):.2f}")
    
    def render_export_section(self, model: 'DataModel'):
        """Renderiza opções de exportação"""
        st.sidebar.divider()
        st.sidebar.subheader("💾 Exportar Dados")
        
        col1, col2 = st.sidebar.columns(2)
        
        if col1.button("📄 CSV"):
            csv = model.export_to_csv()
            st.sidebar.download_button(
                label="Download CSV",
                data=csv,
                file_name=f"dados_filtrados_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                mime="text/csv"
            )
        
        if col2.button("📊 Excel"):
            excel = model.export_to_excel()
            st.sidebar.download_button(
                label="Download Excel",
                data=excel,
                file_name=f"dados_filtrados_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx",
                mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
    
    def render_grouped_analysis_controls(self, column_info: Dict[str, List[str]]) -> Dict[str, str]:
        st.subheader("🧩 Análise Agrupada")
        
        if not column_info["categorical"] or not column_info["numeric"]:
            st.warning("Requer pelo menos uma coluna categórica e uma numérica.")
            return {}
        
        cols = st.columns(3)
        group_by_col = cols[0].selectbox("Agrupar por:", column_info["categorical"])
        agg_col = cols[1].selectbox("Analisar:", column_info["numeric"])
        agg_funcs = {"Média": "mean", "Soma": "sum", "Contagem": "count", "Mínimo": "min", "Máximo": "max"}
        selected_func = cols[2].selectbox("Cálculo:", list(agg_funcs.keys()))
        
        return {
            "group_by_col": group_by_col,
            "agg_col": agg_col,
            "agg_func": agg_funcs[selected_func]
        }
    
    def render_chart_controls(self, column_info: Dict[str, List[str]]) -> Dict[str, Any]:
        st.subheader("🎨 Visualizações")
        
        chart_config = {}
        col1, col2, col3, col4 = st.columns(4)
        
        chart_map = {
            "Linha": "line", 
            "Barras": "bar", 
            "Pizza": "pie", 
            "Dispersão": "scatter",
            "Histograma": "histogram"
        }
        
        with col1:
            selected_chart = st.selectbox("Tipo de Gráfico", list(chart_map.keys()))
            chart_config["chart_type"] = chart_map[selected_chart]
        
        with col2:
            if chart_config["chart_type"] in ["line", "bar", "scatter"]:
                options = column_info["numeric"] + column_info["categorical"]
                if chart_config["chart_type"] == 'line':
                    options = ['[Índice]'] + options
                chart_config["x_column"] = st.selectbox("Eixo X", options)
            elif chart_config["chart_type"] == "histogram":
                chart_config["hist_column"] = st.selectbox("Coluna", column_info["numeric"])
        
        with col3:
            if chart_config["chart_type"] in ["line", "scatter"]:
                chart_config["y_column"] = st.selectbox("Eixo Y", column_info["numeric"])
            elif chart_config["chart_type"] == "bar":
                chart_config["y_column"] = st.selectbox("Eixo Y (opcional)", [None] + column_info["numeric"])
            elif chart_config["chart_type"] == "pie":
                chart_config["pie_column"] = st.selectbox("Coluna", column_info["categorical"])
        
        with col4:
            if chart_config["chart_type"] in ["line", "bar", "scatter"]:
                chart_config["color_column"] = st.selectbox("Cor (opcional)", [None] + column_info["categorical"])
            if chart_config["chart_type"] == "bar":
                chart_config["horizontal"] = st.toggle("Horizontal")
            elif chart_config["chart_type"] == "histogram":
                chart_config["bins"] = st.slider("Bins", 10, 100, 30)
        
        return chart_config
    
    def render_chart(self, fig: plt.Figure):
        if fig:
            # use_container_width deprecated; use width='stretch' for full-width rendering
            st.pyplot(fig, width='stretch')
    
    def render_data_table(self, df: pd.DataFrame, title: str):
        if df.empty:
            st.warning("Nenhum dado para exibir.")
            return
        
        with st.expander(label=title, expanded=True):
            # use_container_width deprecated; use width='stretch' for full-width rendering
            st.dataframe(df, width='stretch')
            st.info(f"Mostrando {len(df)} registos.")


# ====================================
# CONTROLLER LAYER
# ====================================

class DashboardController:
    """Controller principal do dashboard MVC"""
    
    def __init__(self, data_source: Union[str, pd.DataFrame], title: str, description: str = None):
        self.model = DataModel(data_source)
        self.view = DashboardView()
        self.title = title
        self.description = description
    
    def run(self):
        """Executa o fluxo completo do dashboard"""
        if self.model.df is None or self.model.df.empty:
            st.error("Falha ao carregar os dados.")
            return
        
        # Header
        self.view.render_header(self.title, self.description)
        
        # Configuração
        column_info = self.model.get_column_info()
        
        # Filtros e exportação
        filters = self.view.render_sidebar_filters(self.model.df, column_info)
        self.view.render_export_section(self.model)
        
        df_filtered = self.model.apply_filters(filters)
        metrics = self.model.calculate_metrics()
        
        # Tabela de dados
        self.view.render_data_table(df_filtered, "🗂️ Dados Consolidados")
        
        # Métricas
        self.view.render_metrics(metrics, column_info)
        st.markdown("---")
        
        if df_filtered.empty:
            st.warning("Nenhum dado corresponde aos filtros.")
            return
        
        # Análise agrupada
        grouped_config = self.view.render_grouped_analysis_controls(column_info)
        # grouped_config may be empty; ensure required keys exist and are truthy
        required_keys = ("group_by_col", "agg_col", "agg_func")
        if grouped_config and all(grouped_config.get(k) for k in required_keys):
            grouped_df = self.model.calculate_grouped_metrics(
                grouped_config["group_by_col"],
                grouped_config["agg_col"],
                grouped_config["agg_func"],
            )
            self.view.render_data_table(grouped_df, f"📊 Agrupado por {grouped_config['group_by_col'].title()}")
        
        st.markdown("---")
        
        # Gráficos
        chart_generator = MatplotlibChartGenerator(df_filtered)
        chart_config = self.view.render_chart_controls(column_info)
        self._render_selected_chart(chart_config, chart_generator)
    
    def _render_selected_chart(self, config: Dict[str, Any], chart_generator: MatplotlibChartGenerator):
        """Renderiza o gráfico selecionado"""
        try:
            chart_type = config.get("chart_type")
            fig = None
            
            # Ensure required keys exist and values are not None before calling chart functions
            if chart_type == "line" and config.get("x_column") and config.get("y_column"):
                fig = chart_generator.create_line_chart(config["x_column"], config["y_column"], config.get("color_column"))
            elif chart_type == "bar" and config.get("x_column"):
                # y_column is optional for bar (counts vs aggregated)
                fig = chart_generator.create_bar_chart(config["x_column"], config.get("y_column"), config.get("color_column"), config.get("horizontal", False))
            elif chart_type == "pie" and config.get("pie_column"):
                fig = chart_generator.create_pie_chart(config["pie_column"])
            elif chart_type == "scatter" and config.get("x_column") and config.get("y_column"):
                fig = chart_generator.create_scatter_plot(config["x_column"], config["y_column"], config.get("color_column"))
            elif chart_type == "histogram" and config.get("hist_column"):
                fig = chart_generator.create_histogram(config["hist_column"], config.get("bins", 30))
            
            if fig:
                self.view.render_chart(fig)
        except Exception as e:
            st.error(f"Erro ao gerar gráfico: {e}")


# ====================================
# ENTRY POINT
# ====================================

def create_mvc_dashboard(data_source: Union[str, pd.DataFrame], title: str = "Dashboard MVC", description: str = None):
    """Cria e executa um dashboard MVC."""
    controller = DashboardController(data_source, title, description)
    controller.run()


# ====================================
# EXECUTION
# ====================================

if __name__ == "__main__":
    st.set_page_config(
        page_title="Dashboard Analítico", 
        page_icon="📊", 
        layout="wide",
        initial_sidebar_state="expanded"
    )
    
    st.sidebar.title("🔧 Configurações")
    
    # Opções de fonte de dados
    data_source_option = st.sidebar.radio(
        "Escolha a fonte dos dados:",
        ("Upload de ficheiro", "URL de exemplo")
    )
    
    data_source = None
    
    if data_source_option == "URL de exemplo":
        url_input = st.sidebar.text_input(
            "Cole a URL do dataset:",
            value="https://raw.githubusercontent.com/PedroVic12/Repopulation-With-Elite-Set/refs/heads/main/src/assets/2025-09-01_resultados_IEEE_14_filtrados.csv"
        )
        if url_input:
            data_source = url_input
    else:
        uploaded_file = st.sidebar.file_uploader(
            "Arraste e solte ou clique para fazer upload",
            type=["csv", "xlsx", "xls"]
        )
        if uploaded_file:
            data_source = uploaded_file
    
    # Renderiza dashboard
    if data_source is not None:
        create_mvc_dashboard(
            data_source=data_source,
            title="📊 Dashboard Analítico Interativo",
            description="Explore seus dados com filtros dinâmicos, visualizações e análises estatísticas."
        )
    else:
        st.info("👈 Selecione uma fonte de dados na barra lateral para começar.")
        
        # Instruções de uso
        with st.expander("📖 Como usar este dashboard"):
            st.markdown("""
            ### Funcionalidades:
            - **Upload de Dados**: Suporta CSV e Excel
            - **Filtros Dinâmicos**: Filtre por colunas categóricas e numéricas
            - **Métricas Automáticas**: Estatísticas descritivas calculadas automaticamente
            - **Análise Agrupada**: Agregue dados por categorias
            - **Visualizações**: 5 tipos de gráficos disponíveis
            - **Exportação**: Baixe os dados filtrados em CSV ou Excel
            
            ### Passos:
            1. Faça upload de um arquivo ou use a URL de exemplo
            2. Use os filtros na barra lateral
            3. Explore as métricas e visualizações
            4. Exporte os resultados se necessário
            """)