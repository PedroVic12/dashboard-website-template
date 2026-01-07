"""
========================================================
STREAMLIT OCR - CADERNO MANUSCRITO (CONTROLE DE BEBIDAS)
========================================================

PASSO A PASSO DO FUNCIONAMENTO:

1. Usuário envia uma foto (upload ou câmera) do caderno
2. A imagem é enviada para o Google Vision OCR (Handwritten)
3. O texto completo é retornado (debug visível)
4. O sistema:
   - Extrai o nome do cliente (primeira linha)
   - Extrai produtos, quantidades e valores
5. Gera uma tabela estruturada:
   Cliente | Produto | Quantidade | Valor | Total
6. Mostra:
   - Texto OCR bruto
   - Tabela organizada
   - Resumo por produto
7. Permite exportar Excel por cliente

OBS:
- OCR manuscrito NÃO é perfeito
- Parser será ajustado conforme o padrão real do caderno
========================================================
"""

import streamlit as st
import pandas as pd
from PIL import Image
import io
import re

from google.cloud import vision

# export GOOGLE_APPLICATION_CREDENTIALS="clickverasstarup-31d0ecc332f5.json"


# ======================================================
# MODEL - OCR (GOOGLE VISION)
# ======================================================
class OCRModel:
    def __init__(self):
        self.client = vision.ImageAnnotatorClient()

    def ler_imagem(self, image_bytes: bytes) -> str:
        image = vision.Image(content=image_bytes)
        response = self.client.text_detection(image=image)

        if response.error.message:
            raise Exception(response.error.message)

        textos = response.text_annotations
        return textos[0].description if textos else ""


# ======================================================
# MODEL - PARSER (TEXTO -> DADOS)
# ======================================================
class ParserModel:
    def extrair_cliente(self, texto: str) -> str:
        linhas = [l.strip() for l in texto.splitlines() if l.strip()]
        return linhas[0] if linhas else "Cliente Desconhecido"

    def extrair_itens(self, texto: str) -> pd.DataFrame:
        """
        Espera linhas parecidas com:
        2 COCA COLA 10,00
        1 SKOL 5,50
        """

        dados = []

        for linha in texto.splitlines():
            linha = linha.strip()

            # regex flexível para manuscrito
            padrao = re.search(
                r"(\d+)\s+([A-Za-zÀ-ÿ\s]+)\s+([\d,.]+)",
                linha
            )

            if padrao:
                qtd = int(padrao.group(1))
                produto = padrao.group(2).strip()
                total = float(padrao.group(3).replace(",", "."))

                valor_unit = round(total / qtd, 2) if qtd else 0

                dados.append({
                    "Cliente": "",
                    "Produto": produto,
                    "Quantidade": qtd,
                    "Valor": valor_unit,
                    "Total": total
                })

        return pd.DataFrame(dados)


# ======================================================
# CONTROLLER
# ======================================================
def processar_imagem(imagem: Image.Image):
    buffer = io.BytesIO()
    imagem.save(buffer, format="JPEG")

    ocr = OCRModel()
    parser = ParserModel()

    texto = ocr.ler_imagem(buffer.getvalue())
    cliente = parser.extrair_cliente(texto)
    df = parser.extrair_itens(texto)

    if not df.empty:
        df["Cliente"] = cliente

    return texto, cliente, df


# ======================================================
# VIEW - STREAMLIT
# ======================================================
st.set_page_config(
    page_title="OCR Caderno - Bebidas",
    layout="wide"
)

st.title("📒 OCR de Caderno Manuscrito")
st.caption("Transformando papel em dados. Controle real de vendas.")

abas = st.tabs([
    "📸 Captura",
    "📄 OCR / Tabela",
    "⬇️ Exportar"
])

# ------------------------------------------------------
# ABA 1 - CAPTURA
# ------------------------------------------------------
with abas[0]:
    st.subheader("Enviar imagem do caderno")

    arquivo = st.file_uploader(
        "Upload da galeria",
        type=["jpg", "jpeg", "png"]
    )

    camera = st.camera_input("Ou tire uma foto")

    imagem = None
    if arquivo:
        imagem = Image.open(arquivo)
    elif camera:
        imagem = Image.open(camera)

    if imagem:
        st.image(imagem, caption="Imagem carregada", use_column_width=True)

        if st.button("🔍 Executar OCR"):
            with st.spinner("Lendo letra manuscrita..."):
                texto, cliente, df = processar_imagem(imagem)

                st.session_state["texto"] = texto
                st.session_state["cliente"] = cliente
                st.session_state["df"] = df

            st.success("OCR finalizado!")


# ------------------------------------------------------
# ABA 2 - RESULTADO
# ------------------------------------------------------
with abas[1]:
    if "texto" in st.session_state:
        st.subheader(f"Cliente detectado: {st.session_state['cliente']}")

        st.markdown("### 🧠 Texto OCR (Debug)")
        st.text_area(
            "OCR bruto",
            st.session_state["texto"],
            height=220
        )

        df = st.session_state["df"]

        if not df.empty:
            st.markdown("### 📋 Tabela Organizada")
            st.dataframe(df, use_container_width=True)

            resumo = (
                df.groupby("Produto")
                .agg({
                    "Quantidade": "sum",
                    "Total": "sum"
                })
                .reset_index()
            )

            st.markdown("### 📊 Resumo por Produto")
            st.dataframe(resumo, use_container_width=True)
        else:
            st.warning("Nenhum item reconhecido. Ajustar parser.")


# ------------------------------------------------------
# ABA 3 - EXPORTAR
# ------------------------------------------------------
with abas[2]:
    if "df" in st.session_state and not st.session_state["df"].empty:
        cliente = st.session_state["cliente"]
        df = st.session_state["df"]

        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="Vendas")

        st.download_button(
            "⬇️ Baixar Excel",
            buffer.getvalue(),
            file_name=f"{cliente}_controle_vendas.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
