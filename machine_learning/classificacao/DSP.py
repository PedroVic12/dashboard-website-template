# ml_pipeline.py
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler, label_binarize
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    roc_curve, auc, roc_auc_score
)
import matplotlib.pyplot as plt
import joblib

# Model imports (lazy imported in factory below)
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB

from IPython.display import display

# Optional for warnings
import warnings
warnings.filterwarnings("ignore")


class DSP:
    """
    Classe DSP para pré-processamento, treino, avaliação e predição.
    Suporta múltiplos modelos supervisionados e gera ROC (binária ou multiclass).
    """
    def __init__(self, df: pd.DataFrame):
        self.dataset = df.copy()
        self.encoders: Dict[str, LabelEncoder] = {}
        self.scaler: Optional[StandardScaler] = None
        self.models: Dict[str, Any] = {}  # name -> trained model
        self.trained = False

    # -------------------------
    # Pré-processamento
    # -------------------------
    def init_encoder(self, column: str):
        """Cria LabelEncoder para a coluna e transforma a coluna no dataset."""
        le = LabelEncoder()
        self.dataset[column] = le.fit_transform(self.dataset[column].astype(str))
        self.encoders[column] = le
        return le

    def apply_encoders_to(self, df: pd.DataFrame) -> pd.DataFrame:
        """Aplica encoders aos dados novos (modifica cópia)."""
        df_ = df.copy()
        for col, enc in self.encoders.items():
            if col in df_.columns:
                df_[col] = enc.transform(df_[col].astype(str))
            else:
                raise KeyError(f"Coluna '{col}' ausente nos novos dados.")
        return df_

    def fit_scaler(self, X: pd.DataFrame):
        """Ajusta StandardScaler nos dados X (numéricos)."""
        self.scaler = StandardScaler()
        X_num = X.select_dtypes(include=[np.number])
        self.scaler.fit(X_num)
        return self.scaler

    def transform_with_scaler(self, X: pd.DataFrame) -> pd.DataFrame:
        """Transforma colunas numéricas com o scaler já treinado."""
        if self.scaler is None:
            raise RuntimeError("Scaler não foi treinado. Chame fit_scaler primeiro.")
        X_ = X.copy()
        num_cols = X_.select_dtypes(include=[np.number]).columns
        X_[num_cols] = self.scaler.transform(X_[num_cols])
        return X_

    # -------------------------
    # Model factory & training
    # -------------------------
    @staticmethod
    def _model_factory(name: str):
        """Retorna uma instância do modelo pelo nome."""
        mapping = {
            "random_forest": RandomForestClassifier,
            "arvore_decisao": DecisionTreeClassifier,
            "regressao_logistica": LogisticRegression,
            "knn": KNeighborsClassifier,
            "svm": SVC,
            "naive_bayes": GaussianNB
        }
        if name not in mapping:
            raise ValueError(f"Modelo '{name}' não suportado. Escolha entre {list(mapping.keys())}")
        # SVC precisa de probability=True para ROC
        if name == "svm":
            return mapping[name](probability=True)
        # LogisticRegression pode exigir solver dependendo dos dados
        if name == "regressao_logistica":
            return mapping[name](max_iter=1000, solver="liblinear")
        return mapping[name]()

    def train_model(self, name: str, X: pd.DataFrame, y: pd.Series):
        """Treina e guarda modelo sob o nome dado."""
        model = self._model_factory(name)
        model.fit(X, y)
        self.models[name] = model
        self.trained = True
        return model

    # -------------------------
    # Avaliação & ROC
    # -------------------------
    def evaluate(self, model_name: str, X_test: pd.DataFrame, y_test: pd.Series, show_report: bool = True):
        """
        Avalia o modelo: acurácia, classification report, confusion matrix e ROC plot.
        Retorna dicionário com métricas.
        """
        if model_name not in self.models:
            raise KeyError(f"Modelo '{model_name}' não encontrado entre modelos treinados.")

        model = self.models[model_name]
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)

        if show_report:
            print(f"\n--- Avaliação do modelo: {model_name} ---")
            print(f"Acurácia: {acc:.4f}")
            print("\nClassification Report:")
            print(classification_report(y_test, y_pred))
            print("\nConfusion Matrix:")
            print(confusion_matrix(y_test, y_pred))

        # ROC / AUC
        self._plot_roc(model, X_test, y_test, model_name)

        return {"accuracy": acc, "y_pred": y_pred}

    def _plot_roc(self, model, X_test: pd.DataFrame, y_test: pd.Series, model_name: str):
        """
        Plota ROC. Suporta binário e multiclass (one-vs-rest).
        Usa probabilidades do model.predict_proba quando disponível.
        """
        y_true = y_test
        classes = np.unique(y_true)
        n_classes = len(classes)

        # Tentar probabilidades
        if hasattr(model, "predict_proba"):
            y_score = model.predict_proba(X_test)
        elif hasattr(model, "decision_function"):
            try:
                decision = model.decision_function(X_test)
                if n_classes == 2:
                    # decision_function retorna shape (n,) para binária -> transformar
                    y_score = np.vstack([1 - self._sigmoid(decision), self._sigmoid(decision)]).T
                else:
                    y_score = self._softmax(decision)
            except Exception:
                print("Modelo não fornece score utilizável para ROC.")
                return
        else:
            print("Modelo não fornece probabilidade nem decision_function — ROC não disponível.")
            return

        # Binarize y_true para multiclass ROC
        y_bin = label_binarize(y_true, classes=classes)
        if n_classes == 1:
            print("Somente uma classe presente em y_test — ROC não aplicável.")
            return
        fig, ax = plt.subplots(figsize=(6, 5))
        if n_classes == 2:
            # y_score could be shape (n,2) or (n,) depending; get positive class prob
            if y_score.ndim == 1:
                fpr, tpr, _ = roc_curve(y_bin.ravel(), y_score)
                roc_auc = auc(fpr, tpr)
                ax.plot(fpr, tpr, label=f"{model_name} (AUC = {roc_auc:.3f})")
            else:
                # take class 1 probs
                fpr, tpr, _ = roc_curve(y_bin.ravel(), y_score[:, 1])
                roc_auc = auc(fpr, tpr)
                ax.plot(fpr, tpr, label=f"{model_name} (AUC = {roc_auc:.3f})")
        else:
            # multiclass: compute ROC for each class and macro-average
            fpr = dict()
            tpr = dict()
            roc_auc = dict()
            for i in range(n_classes):
                fpr[i], tpr[i], _ = roc_curve(y_bin[:, i], y_score[:, i])
                roc_auc[i] = auc(fpr[i], tpr[i])
                ax.plot(fpr[i], tpr[i], lw=2, label=f"class {classes[i]} (AUC={roc_auc[i]:.3f})")
            # macro-average AUC
            try:
                macro_auc = roc_auc_score(y_bin, y_score, average="macro", multi_class="ovr")
                ax.plot([], [], ' ', label=f"Macro AUC = {macro_auc:.3f}")
            except Exception:
                pass

        ax.plot([0, 1], [0, 1], "k--", lw=1)
        ax.set_xlim([0.0, 1.0])
        ax.set_ylim([0.0, 1.05])
        ax.set_xlabel("False Positive Rate")
        ax.set_ylabel("True Positive Rate")
        ax.set_title(f"ROC - {model_name}")
        ax.legend(loc="lower right")
        plt.show()

    @staticmethod
    def _sigmoid(x):
        return 1.0 / (1.0 + np.exp(-x))

    @staticmethod
    def _softmax(x):
        e_x = np.exp(x - np.max(x, axis=1, keepdims=True))
        return e_x / e_x.sum(axis=1, keepdims=True)

    # -------------------------
    # Save / Load modelo e preprocessadores
    # -------------------------
    def save_model(self, model_name: str, filename: str):
        if model_name not in self.models:
            raise KeyError(model_name)
        joblib.dump(self.models[model_name], filename)

    def load_model(self, filename: str):
        return joblib.load(filename)

    def save_pipeline(self, filename: str):
        """Salva encoders, scaler e modelos (dicionário) para produção."""
        payload = {
            "encoders": self.encoders,
            "scaler": self.scaler,
            "models": self.models
        }
        joblib.dump(payload, filename)

    def load_pipeline(self, filename: str):
        payload = joblib.load(filename)
        self.encoders = payload.get("encoders", {})
        self.scaler = payload.get("scaler", None)
        self.models = payload.get("models", {})
        self.trained = len(self.models) > 0

    # -------------------------
    # Predição em novos dados
    # -------------------------
    def predict_new(self, model_name: str, novos_dados: pd.DataFrame):
        """Prever novos dados (aplica encoders e scaler)."""
        df_enc = self.apply_encoders_to(novos_dados)
        df_scaled = self.transform_with_scaler(df_enc)
        model = self.models.get(model_name)
        if model is None:
            raise KeyError(f"Modelo {model_name} não treinado.")
        preds = model.predict(df_scaled)
        return preds


# -------------------------
# Função orquestradora
# -------------------------
def run_ml(
    path_dataset: str,
    target_column: str,
    id_column: Optional[str] = None,
    categorical_cols: Optional[List[str]] = None,
    test_size: float = 0.3,
    random_state: int = 42,
    models_to_run: Optional[List[str]] = None,
    path_novos: Optional[str] = None
):
    """
    Orquestra pipeline de ML:
    - Carrega CSV
    - Inicializa encoders (nas colunas categóricas passadas)
    - Separa X/y
    - Treina modelos em models_to_run
    - Avalia (accuracy, report, confusion matrix, ROC)
    - Se path_novos fornecido faz predição em novos dados e mostra resultados
    """

    if models_to_run is None:
        models_to_run = ["arvore_decisao", "knn", "random_forest"]

    # 1) Carregar dados
    df = pd.read_csv(path_dataset)
    dsp = DSP(df)

    # 2) Encoders
    categorical_cols = categorical_cols or []
    for col in categorical_cols:
        dsp.init_encoder(col)

    # 3) Definir X e y
    y = dsp.dataset[target_column]
    X = dsp.dataset.drop(columns=[target_column] + ([id_column] if id_column else []))

    # 4) Treino/teste
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=random_state)

    # 5) Scaler fit on numeric features
    dsp.fit_scaler(X_train)
    X_train_scaled = dsp.transform_with_scaler(X_train)
    X_test_scaled = dsp.transform_with_scaler(X_test)

    # 6) Treinar modelos
    results = {}
    for model_name in models_to_run:
        print(f"\nTreinando modelo: {model_name}")
        model = dsp.train_model(model_name, X_train_scaled, y_train)
        res = dsp.evaluate(model_name, X_test_scaled, y_test, show_report=True)
        results[model_name] = res

    # 7) Escolher melhor modelo por acurácia
    best_model = max(results.items(), key=lambda item: item[1]["accuracy"])
    best_model_name, best_metrics = best_model
    print(f"\nMelhor modelo por acurácia: {best_model_name} -> {best_metrics['accuracy']:.4f}")

    # 8) Salvar pipeline e modelo principal
    dsp.save_pipeline("pipeline_saved.joblib")
    dsp.save_model(best_model_name, f"best_model_{best_model_name}.pkl")
    print("Pipeline e melhor modelo salvos.")

    # 9) Previsão em novos dados (se solicitado)
    if path_novos:
        novos = pd.read_csv(path_novos)
        print("\nNovos clientes (antes do encoding):")
        display(novos.head(5))
        novos_enc = dsp.apply_encoders_to(novos)
        novos_enc_scaled = dsp.transform_with_scaler(novos_enc)
        preds = dsp.models[best_model_name].predict(novos_enc_scaled)
        print(f"\nPredições ({best_model_name}):")
        display(pd.DataFrame({"prediction": preds}))
    else:
        print("\nNenhum arquivo de novos dados informado (path_novos=None).")

    # 10) Cheque de sanidade: mostre alguns pares (y_test vs y_pred do melhor modelo)
    print("\nExemplo de comparação entre y_test e y_pred (primeiros 10 exemplos):")
    y_pred_best = results[best_model_name]["y_pred"]
    comp = pd.DataFrame({"y_test": y_test.reset_index(drop=True), "y_pred": y_pred_best})
    display(comp.head(10))

    return dsp, results


# -------------------------
# Exemplo de uso
# -------------------------
if __name__ == "__main__":
    # Ajuste apenas estes caminhos / colunas
    PATH_DATA = r"C:\Users\pedrovictor.veras\OneDrive - Operador Nacional do Sistema Eletrico\Documentos\ESTAGIO_ONS_PVRV_2025\GitHub\dashboard-website-template\machine_learning\classificacao\clientes.csv"          # coloque seu CSV aqui
    PATH_NOVOS = r"C:\Users\pedrovictor.veras\OneDrive - Operador Nacional do Sistema Eletrico\Documentos\ESTAGIO_ONS_PVRV_2025\GitHub\dashboard-website-template\machine_learning\classificacao\novos_clientes.csv"   # ou None
    TARGET = "score_credito"
    ID_COL = "id_cliente"   # ou None
    CATEGORICAL_COLS = ["profissao", "mix_credito", "comportamento_pagamento"]

    dsp_obj, all_results = run_ml(
        path_dataset=PATH_DATA,
        target_column=TARGET,
        id_column=ID_COL,
        categorical_cols=CATEGORICAL_COLS,
        test_size=0.3,
        random_state=42,
        models_to_run=["arvore_decisao", "knn", "random_forest", "regressao_logistica"],
        path_novos=PATH_NOVOS
    )
