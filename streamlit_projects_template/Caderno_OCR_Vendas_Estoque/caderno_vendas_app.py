"""
STREAMLIT - OCR DE CADERNO MANUSCRITO (GEMINI VISION)

Fluxo:
1. Usuário envia foto ou tira pela câmera
2. Imagem aparece na tela
3. Gemini Vision extrai TEXTO PURO
4. Texto é convertido em tabela (Cliente, Produto, Quantidade, Valor)
5. Excel é gerado para download
"""

import streamlit as st
import pandas as pd
import re
import os
from PIL import Image
from google import genai

# =========================
# CONFIG
# =========================

assert os.getenv("GOOGLE_API_KEY"), "❌ GOOGLE_API_KEY não configurada"

client = genai.Client()
MODEL_NAME = "gemini-3-flash-preview"

PROMPT = """
Você está analisando uma imagem de um caderno manuscrito de controle de vendas.

REGRAS:
- Leia TODA a folha visível
- NÃO resuma
- NÃO pule linhas
- NÃO corrija ortografia
- NÃO invente dados
- Extraia TODAS as linhas de produtos

FORMATO:
- Uma linha por item exatamente como escrito
- Preserve números, vírgulas e pontos
- Se ilegível, escreva [ilegível]

Retorne SOMENTE o texto extraído.
"""

# =========================
# MODEL
# =========================

def texto_para_dataframe(texto: str, cliente: str) -> pd.DataFrame:
    linhas = texto.splitlines()
    dados = []

    for linha in linhas:
        if not re.search(r"\d", linha):
            continue

        match = re.match(
            r"(?P<qtd>\d+)\s+(?P<produto>.+?)\s+(?P<valor>[\d\.,]+)$",
            linha.strip()
        )

        if match:
            qtd = int(match.group("qtd"))
            produto = match.group("produto")

            valor_str = match.group("valor").replace(".", "").replace(",", ".")
            try:
                valor = float(valor_str)
            except:
                valor = None

            dados.append({
                "Cliente": cliente,
                "Produto": produto,
                "Quantidade": qtd,
                "Valor Total": valor
            })

    return pd.DataFrame(dados)

# =========================
# CONTROLLER
# =========================

def processar_imagem(image: Image.Image) -> str:
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=[PROMPT, image],
        config={
            "temperature": 0.0,
            "max_output_tokens": 2048
        }
    )
    return response.text

# =========================
# VIEW (STREAMLIT)
# =========================

st.set_page_config(page_title="OCR Caderno de Vendas", layout="wide")

st.title("📒 OCR de Caderno de Vendas (Manuscrito)")
st.caption("Transforme fotos de cadernos em planilhas automaticamente")

cliente = st.text_input("👤 Nome do Cliente", value="Viviane")

col1, col2 = st.columns(2)

with col1:
    st.subheader("📸 Entrada da Imagem")
    img_file = st.file_uploader(
        "Envie uma foto do caderno",
        type=["jpg", "jpeg", "png"]
    )
    camera_img = st.camera_input("Ou tire a foto agora")

image = None

if img_file:
    image = Image.open(img_file)
elif camera_img:
    image = Image.open(camera_img)

if image:
    st.image(image, caption="Imagem carregada", use_column_width=True)

    if st.button("🧠 Processar OCR"):
        with st.spinner("Processando imagem com Gemini Vision..."):
            texto_extraido = processar_imagem(image)

        st.subheader("📄 Texto Extraído")
        st.text_area("OCR", texto_extraido, height=250)

        df = texto_para_dataframe(texto_extraido, cliente)

        st.subheader("📊 Tabela Estruturada")
        st.dataframe(df, use_container_width=True)

        if not df.empty:
            excel_bytes = df.to_excel(index=False, engine="openpyxl")

            st.download_button(
                label="📥 Baixar Excel",
                data=excel_bytes,
                file_name=f"vendas_{cliente.lower()}.xlsx",
                mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
else:
    st.info("Envie uma imagem ou use a câmera para começar.")
