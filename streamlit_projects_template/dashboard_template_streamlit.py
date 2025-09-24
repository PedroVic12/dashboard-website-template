import streamlit as st
import pandas as pd
import plotly.express as px
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from typing import Dict, List, Any, Optional, Union, Tuple
from abc import ABC, abstractmethod
from io import BytesIO
import base64


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
        """Carrega dados de diferentes fontes"""
        try:
            if isinstance(self.data_source, str):
                self.df = pd.read_csv(self.data_source)
            elif isinstance(self.data_source, pd.DataFrame):
                self.df = self.data_source.copy()
            else:
                raise ValueError("Fonte de dados inválida")
            
            self.df_filtered = self.df.copy()
            return self.df
            
        except Exception as e:
            st.error(f"Erro ao carregar dados: {str(e)}")
            return pd.DataFrame()
    
    def apply_filters(self, filters: Dict[str, Any]) -> pd.DataFrame:
        """Aplica filtros aos dados"""
        if self.df is None or self.df.empty:
            return pd.DataFrame()
        
        df_temp = self.df.copy()
        
        for column, values in filters.items():
            if values and column in df_temp.columns:
                if isinstance(values, (list, tuple)):
                    if len(values) == 2 and all(isinstance(v, (int, float)) for v in values):
                        # Range numérico
                        df_temp = df_temp[(df_temp[column] >= values[0]) & (df_temp[column] <= values[1])]
                    else:
                        # Lista de valores categóricos
                        df_temp = df_temp[df_temp[column].isin(values)]
        
        self.df_filtered = df_temp
        return self.df_filtered
    
    def get_column_info(self) -> Dict[str, List[str]]:
        """Retorna informações sobre tipos de colunas"""
        if self.df is None:
            return {"numeric": [], "categorical": [], "datetime": []}
        
        return {
            "numeric": self.df.select_dtypes(include=[np.number]).columns.tolist(),
            "categorical": self.df.select_dtypes(include=['object', 'category']).columns.tolist(),
            "datetime": self.df.select_dtypes(include=['datetime64']).columns.tolist()
        }
    
    def calculate_metrics(self) -> Dict[str, Any]:
        """Calcula métricas dos dados filtrados"""
        if self.df_filtered is None or self.df_filtered.empty:
            return {}
        
        metrics = {
            "total_records": len(self.df_filtered),
            "total_columns": len(self.df_filtered.columns)
        }
        
        column_info = self.get_column_info()
        
        # Métricas numéricas
        for col in column_info["numeric"]:
            if col in self.df_filtered.columns:
                metrics.update({
                    f"{col}_mean": self.df_filtered[col].mean(),
                    f"{col}_median": self.df_filtered[col].median(),
                    f"{col}_max": self.df_filtered[col].max(),
                    f"{col}_min": self.df_filtered[col].min()
                })
        
        # Métricas categóricas
        for col in column_info["categorical"]:
            if col in self.df_filtered.columns and not self.df_filtered[col].empty:
                mode_value = self.df_filtered[col].mode()
                metrics[f"{col}_most_frequent"] = mode_value[0] if len(mode_value) > 0 else "N/A"
        
        return metrics


# ====================================
# MATPLOTLIB CHART GENERATOR
# ====================================

class MatplotlibChartGenerator:
    """Gerador de gráficos usando Matplotlib"""
    
    def __init__(self, df: pd.DataFrame, style: str = 'seaborn-v0_8'):
        self.df = df
        self.style = style
        self._setup_style()
    
    def _setup_style(self):
        """Configura o estilo dos gráficos"""
        try:
            plt.style.use(self.style)
        except:
            plt.style.use('default')
        
        sns.set_palette("husl")
        plt.rcParams.update({
            'figure.figsize': (10, 6),
            'font.size': 10,
            'axes.titlesize': 12,
            'axes.labelsize': 10,
            'xtick.labelsize': 9,
            'ytick.labelsize': 9,
            'legend.fontsize': 9
        })
    
    def create_line_chart(self, x_column: str, y_column: str, 
                         title: str = None, color: str = 'blue') -> plt.Figure:
        """Cria gráfico de linhas"""
        fig, ax = plt.subplots(figsize=(10, 6))
        
        # Ordenar dados por x para linha contínua
        df_sorted = self.df.sort_values(x_column)
        
        ax.plot(df_sorted[x_column], df_sorted[y_column], 
               color=color, linewidth=2, marker='o', markersize=4)
        
        ax.set_xlabel(x_column.replace('_', ' ').title())
        ax.set_ylabel(y_column.replace('_', ' ').title())
        ax.set_title(title or f'{y_column.replace("_", " ").title()} por {x_column.replace("_", " ").title()}')
        ax.grid(True, alpha=0.3)
        
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        return fig
    
    def create_bar_chart(self, x_column: str, y_column: str = None,
                        title: str = None, horizontal: bool = False,
                        top_n: int = 10) -> plt.Figure:
        """Cria gráfico de barras"""
        fig, ax = plt.subplots(figsize=(10, 6))
        
        if y_column:
            # Gráfico agregado
            data = self.df.groupby(x_column)[y_column].mean().nlargest(top_n)
        else:
            # Gráfico de contagem
            data = self.df[x_column].value_counts().head(top_n)
        
        if horizontal:
            bars = ax.barh(range(len(data)), data.values)
            ax.set_yticks(range(len(data)))
            ax.set_yticklabels(data.index)
            ax.set_xlabel(y_column.replace('_', ' ').title() if y_column else 'Contagem')
            ax.set_ylabel(x_column.replace('_', ' ').title())
        else:
            bars = ax.bar(range(len(data)), data.values)
            ax.set_xticks(range(len(data)))
            ax.set_xticklabels(data.index, rotation=45, ha='right')
            ax.set_ylabel(y_column.replace('_', ' ').title() if y_column else 'Contagem')
            ax.set_xlabel(x_column.replace('_', ' ').title())
        
        # Colorir barras
        colors = plt.cm.viridis(np.linspace(0, 1, len(data)))
        for bar, color in zip(bars, colors):
            bar.set_color(color)
        
        ax.set_title(title or f'Top {top_n} {x_column.replace("_", " ").title()}')
        plt.tight_layout()
        
        return fig
    
    def create_pie_chart(self, column: str, title: str = None,
                        top_n: int = 8, others_threshold: float = 0.02) -> plt.Figure:
        """Cria gráfico de pizza"""
        fig, ax = plt.subplots(figsize=(10, 8))
        
        # Calcular proporções
        data = self.df[column].value_counts()
        total = data.sum()
        
        # Agrupar valores pequenos em "Outros"
        small_values = data[data / total < others_threshold]
        if len(small_values) > 0:
            data = data[data / total >= others_threshold]
            if len(small_values) > 1:
                data['Outros'] = small_values.sum()
        
        # Limitar ao top_n
        data = data.head(top_n)
        
        # Criar gráfico
        colors = plt.cm.Set3(np.linspace(0, 1, len(data)))
        wedges, texts, autotexts = ax.pie(data.values, labels=data.index, autopct='%1.1f%%',
                                         colors=colors, startangle=90)
        
        # Melhorar legibilidade
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')
        
        ax.set_title(title or f'Distribuição de {column.replace("_", " ").title()}')
        plt.tight_layout()
        
        return fig
    
    def create_scatter_plot(self, x_column: str, y_column: str,
                           color_column: str = None, size_column: str = None,
                           title: str = None) -> plt.Figure:
        """Cria gráfico de dispersão"""
        fig, ax = plt.subplots(figsize=(10, 6))
        
        x = self.df[x_column]
        y = self.df[y_column]
        
        # Configurar cores
        if color_column and color_column in self.df.columns:
            c = self.df[color_column]
            if self.df[color_column].dtype in ['object', 'category']:
                # Categórico
                unique_vals = self.df[color_column].unique()
                colors = plt.cm.tab10(np.linspace(0, 1, len(unique_vals)))
                color_map = dict(zip(unique_vals, colors))
                c = [color_map[val] for val in c]
            scatter = ax.scatter(x, y, c=c, cmap='viridis', alpha=0.7)
            if self.df[color_column].dtype not in ['object', 'category']:
                plt.colorbar(scatter, label=color_column.replace('_', ' ').title())
        else:
            ax.scatter(x, y, alpha=0.7)
        
        # Configurar tamanhos
        if size_column and size_column in self.df.columns:
            sizes = self.df[size_column]
            sizes = (sizes - sizes.min()) / (sizes.max() - sizes.min()) * 100 + 20
        
        ax.set_xlabel(x_column.replace('_', ' ').title())
        ax.set_ylabel(y_column.replace('_', ' ').title())
        ax.set_title(title or f'{y_column.replace("_", " ").title()} vs {x_column.replace("_", " ").title()}')
        ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        return fig
    
    def figure_to_base64(self, fig: plt.Figure) -> str:
        """Converte figura matplotlib para base64"""
        buffer = BytesIO()
        fig.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        buffer.close()
        plt.close(fig)
        return image_base64


# ====================================
# VIEW LAYER
# ====================================

class DashboardView:
    """View para interface do dashboard"""
    
    def __init__(self):
        self._setup_page()
    
    def _setup_page(self):
        """Configura a página Streamlit"""
        st.set_page_config(
            page_title="Dashboard MVC - Análise de Dados",
            page_icon="📊",
            layout="wide"
        )
    
    def render_header(self, title: str, description: str = None):
        """Renderiza o cabeçalho"""
        st.title(title)
        if description:
            st.markdown(description)
    
    def render_sidebar_filters(self, df: pd.DataFrame, column_info: Dict[str, List[str]]) -> Dict[str, Any]:
        """Renderiza filtros na sidebar"""
        st.sidebar.header("🔍 Filtros")
        
        filters = {}
        
        # Informações do dataset
        st.sidebar.info(f"**Registros:** {len(df)}\n**Colunas:** {len(df.columns)}")
        
        # Filtros categóricos
        for col in column_info["categorical"]:
            if df[col].nunique() <= 50:  # Só criar filtro se não tiver muitos valores únicos
                unique_values = sorted(df[col].dropna().unique())
                selected = st.sidebar.multiselect(
                    col.replace('_', ' ').title(),
                    unique_values,
                    default=unique_values
                )
                filters[col] = selected
        
        # Filtros numéricos
        for col in column_info["numeric"]:
            min_val = float(df[col].min())
            max_val = float(df[col].max())
            if min_val != max_val:  # Só criar slider se houver variação
                selected_range = st.sidebar.slider(
                    col.replace('_', ' ').title(),
                    min_value=min_val,
                    max_value=max_val,
                    value=(min_val, max_val)
                )
                filters[col] = selected_range
        
        # Botão reset
        if st.sidebar.button("🔄 Resetar Filtros"):
            st.rerun()
        
        return filters
    
    def render_metrics(self, metrics: Dict[str, Any]):
        """Renderiza métricas em cards"""
        st.subheader("📈 Métricas Principais")
        
        if not metrics:
            st.warning("Nenhuma métrica disponível.")
            return
        
        # Organizar métricas por tipo
        basic_metrics = {}
        detailed_metrics = {}
        
        for key, value in metrics.items():
            if key in ["total_records", "total_columns"]:
                basic_metrics[key] = value
            elif "_most_frequent" in key or "_mean" in key or "_max" in key:
                detailed_metrics[key] = value
        
        # Renderizar métricas básicas
        if basic_metrics:
            cols = st.columns(len(basic_metrics))
            for i, (key, value) in enumerate(basic_metrics.items()):
                with cols[i]:
                    formatted_value = f"{value:,}" if isinstance(value, (int, float)) else str(value)
                    st.metric(key.replace('_', ' ').title(), formatted_value)
        
        # Renderizar métricas detalhadas se houver espaço
        if detailed_metrics:
            st.markdown("**Métricas Detalhadas:**")
            cols = st.columns(min(len(detailed_metrics), 4))
            for i, (key, value) in enumerate(list(detailed_metrics.items())[:4]):
                with cols[i % 4]:
                    if isinstance(value, (int, float)):
                        formatted_value = f"{value:,.2f}" if value != int(value) else f"{int(value):,}"
                    else:
                        formatted_value = str(value)
                    
                    st.metric(
                        key.replace('_', ' ').title(),
                        formatted_value
                    )
    
    def render_chart_controls(self, column_info: Dict[str, List[str]]) -> Dict[str, Any]:
        """Renderiza controles para seleção de gráficos"""
        st.subheader("🎨 Configuração de Gráficos")
        
        col1, col2, col3, col4 = st.columns(4)
        
        chart_config = {}
        
        with col1:
            chart_config["chart_type"] = st.selectbox(
                "Tipo de Gráfico",
                ["line", "bar", "pie", "scatter"],
                format_func=lambda x: {
                    "line": "📈 Linha",
                    "bar": "📊 Barras", 
                    "pie": "🥧 Pizza",
                    "scatter": "🎯 Dispersão"
                }[x]
            )
        
        with col2:
            if chart_config["chart_type"] in ["line", "bar", "scatter"]:
                chart_config["x_column"] = st.selectbox(
                    "Coluna X",
                    column_info["categorical"] + column_info["numeric"]
                )
        
        with col3:
            if chart_config["chart_type"] in ["line", "scatter"]:
                chart_config["y_column"] = st.selectbox(
                    "Coluna Y", 
                    column_info["numeric"]
                )
            elif chart_config["chart_type"] == "bar":
                chart_config["y_column"] = st.selectbox(
                    "Coluna Y (Opcional)",
                    [""] + column_info["numeric"]
                )
            elif chart_config["chart_type"] == "pie":
                chart_config["pie_column"] = st.selectbox(
                    "Coluna para Pizza",
                    column_info["categorical"]
                )
        
        with col4:
            if chart_config["chart_type"] == "bar":
                chart_config["horizontal"] = st.checkbox("Horizontal")
                chart_config["top_n"] = st.slider("Top N", 5, 20, 10)
        
        return chart_config
    
    def render_matplotlib_chart(self, fig_base64: str, title: str = "Gráfico"):
        """Renderiza gráfico matplotlib"""
        if fig_base64:
            st.markdown(f"**{title}**")
            st.markdown(f'<img src="data:image/png;base64,{fig_base64}" style="width:100%">', 
                       unsafe_allow_html=True)
    
    def render_data_table(self, df: pd.DataFrame):
        """Renderiza tabela de dados"""
        st.subheader("🗂️ Dados Detalhados")
        
        col1, col2 = st.columns([3, 1])
        with col2:
            rows_to_show = st.selectbox("Linhas:", [10, 25, 50, 100], index=1)
        
        st.dataframe(df.head(rows_to_show), use_container_width=True)
        st.info(f"Mostrando {min(rows_to_show, len(df))} de {len(df)} registros")


# ====================================
# CONTROLLER LAYER
# ====================================

class DashboardController:
    """Controller principal do dashboard MVC"""
    
    def __init__(self, data_source: Union[str, pd.DataFrame], 
                 title: str = "Dashboard MVC", 
                 description: str = None):
        self.model = DataModel(data_source)
        self.view = DashboardView()
        self.chart_generator = None
        self.title = title
        self.description = description
        
        if not self.model.df.empty:
            self.chart_generator = MatplotlibChartGenerator(self.model.df_filtered)
    
    def run(self):
        """Executa o dashboard completo"""
        if self.model.df is None or self.model.df.empty:
            st.error("Não foi possível carregar os dados.")
            return
        
        # Renderizar cabeçalho
        self.view.render_header(self.title, self.description)
        
        # Obter informações das colunas
        column_info = self.model.get_column_info()
        
        # Renderizar filtros e obter seleções
        filters = self.view.render_sidebar_filters(self.model.df, column_info)
        
        # Aplicar filtros
        df_filtered = self.model.apply_filters(filters)
        
        if df_filtered.empty:
            st.warning("Nenhum dado corresponde aos filtros selecionados.")
            return
        
        # Atualizar chart generator com dados filtrados
        self.chart_generator = MatplotlibChartGenerator(df_filtered)
        
        # Calcular e renderizar métricas
        metrics = self.model.calculate_metrics()
        self.view.render_metrics(metrics)
        
        st.markdown("---")
        
        # Renderizar controles de gráfico
        chart_config = self.view.render_chart_controls(column_info)
        
        # Gerar e exibir gráfico
        self._render_selected_chart(chart_config, df_filtered)
        
        st.markdown("---")
        
        # Renderizar tabela de dados
        self.view.render_data_table(df_filtered)
    
    def _render_selected_chart(self, config: Dict[str, Any], df: pd.DataFrame):
        """Renderiza o gráfico selecionado"""
        if not config or not self.chart_generator:
            return
        
        try:
            chart_type = config.get("chart_type")
            
            if chart_type == "line" and config.get("x_column") and config.get("y_column"):
                fig = self.chart_generator.create_line_chart(
                    config["x_column"], 
                    config["y_column"]
                )
                fig_base64 = self.chart_generator.figure_to_base64(fig)
                self.view.render_matplotlib_chart(fig_base64, "Gráfico de Linha")
            
            elif chart_type == "bar" and config.get("x_column"):
                y_col = config.get("y_column") if config.get("y_column") else None
                fig = self.chart_generator.create_bar_chart(
                    config["x_column"],
                    y_col,
                    horizontal=config.get("horizontal", False),
                    top_n=config.get("top_n", 10)
                )
                fig_base64 = self.chart_generator.figure_to_base64(fig)
                self.view.render_matplotlib_chart(fig_base64, "Gráfico de Barras")
            
            elif chart_type == "pie" and config.get("pie_column"):
                fig = self.chart_generator.create_pie_chart(config["pie_column"])
                fig_base64 = self.chart_generator.figure_to_base64(fig)
                self.view.render_matplotlib_chart(fig_base64, "Gráfico de Pizza")
            
            elif chart_type == "scatter" and config.get("x_column") and config.get("y_column"):
                fig = self.chart_generator.create_scatter_plot(
                    config["x_column"],
                    config["y_column"]
                )
                fig_base64 = self.chart_generator.figure_to_base64(fig)
                self.view.render_matplotlib_chart(fig_base64, "Gráfico de Dispersão")
        
        except Exception as e:
            st.error(f"Erro ao gerar gráfico: {str(e)}")


# ====================================
# FUNÇÃO DE CONVENIÊNCIA
# ====================================

def create_mvc_dashboard(data_source: Union[str, pd.DataFrame], 
                        title: str = "Dashboard MVC",
                        description: str = None):
    """
    Cria um dashboard seguindo padrão MVC
    
    Args:
        data_source: URL, caminho ou DataFrame
        title: Título do dashboard
        description: Descrição opcional
    """
    controller = DashboardController(data_source, title, description)
    controller.run()


# ====================================
# EXECUÇÃO
# ====================================

if __name__ == "__main__":
    # Exemplo de uso com seus dados
    data_url = "https://raw.githubusercontent.com/PedroVic12/Repopulation-With-Elite-Set/refs/heads/main/resultados%20-%20Artigo%20PIBIC/2025-09-01_resultados.csv"
    
    create_mvc_dashboard(
        data_source=data_url,
        title="🎲 Dashboard MVC - Análise de Salários",
        description="Dashboard construído com arquitetura MVC e gráficos Matplotlib personalizáveis."
    )