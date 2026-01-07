
"""
TESTE DE EXTRAÇÃO DE TEXTO MANUSCRITO
USANDO GEMINI (LLM MULTIMODAL)

Objetivo:
- Enviar imagem de caderno manuscrito
- Receber APENAS o texto que o modelo entende
- Sem organizar, sem tabela, sem inferência extra
"""

import os
from PIL import Image
from google import genai
from dotenv import load_dotenv
import re
import pandas as pd

# Carrega .env
load_dotenv()

# ================================
# CONFIGURAÇÃO
# ================================

# Opção 1: via variável de ambiente
API_KEY = os.getenv("GOOGLE_API_KEY")


IMAGE_PATH = r"C:\Users\pedrovictor.veras\OneDrive - Operador Nacional do Sistema Eletrico\Documentos\ESTAGIO_ONS_PVRV_2025\GitHub\dashboard-website-template\streamlit_projects_template\Caderno_OCR_Vendas_Estoque\assets\paper_venda_viviane.jpg"

assert API_KEY, "❌ GOOGLE_API_KEY não configurada"

client = genai.Client(
    api_key = API_KEY
)

modelo_Google = "gemini-3-flash-preview"

# ================================
# PROMPT DE EXTRAÇÃO
# ================================

PROMPT = """
Você está analisando uma imagem de um caderno manuscrito de controle de vendas.

REGRAS OBRIGATÓRIAS:
- Leia TODA a folha visível, do topo até o final
- NÃO resuma
- NÃO pule linhas
- NÃO agrupe itens
- NÃO corrija ortografia
- NÃO invente dados que não estejam visíveis
- Extraia TODAS as linhas de produtos, mesmo que pareçam repetidas ou confusas

FORMATO DE SAÍDA:
- Uma linha por item exatamente como escrito
- Preserve números, vírgulas e pontos
- Se algo estiver ilegível, escreva [ilegível]

Retorne SOMENTE o texto extraído, linha por linha.
"""


# Processando os dados extraidos

def texto_para_dataframe(texto, cliente):
    linhas = texto.splitlines()

    dados = []

    for linha in linhas:
        # ignora cabeçalhos e lixo
        if not re.search(r"\d", linha):
            continue

        # padrão: quantidade + produto + valor
        match = re.match(
            r"(?P<qtd>\d+)\s+(?P<produto>.+?)\s+(?P<valor>[\d\.,]+)$",
            linha.strip(),
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

    df = pd.DataFrame(dados)
    return df


# Usando LLM de imagens
def response_imagem(client, image_path, prompt):
    response = client.models.generate_content(
    model=modelo_Google,
    contents=[
        prompt,
        Image.open(image_path)
    ]
    )
    return response.text

def response_texto(client, prompt):
    response = client.models.generate_content(
        model=modelo_Google,
        contents=[
            prompt
        ]
    )
    print(response.model_dump_json(
    exclude_none=True, indent=4))

    return response.text

def list_models(client):
    print("List of models that support generateContent:\n")
    for m in client.models.list():
        for action in m.supported_actions:
            if action == "generateContent":
                print(m.name)

# ================================
# EXECUÇÃO
# ================================

def main(gerar_tabela = False):


    print("🧠 Enviando imagem para o Gemini Vision...")
    resultado_img = response_imagem(client, IMAGE_PATH, PROMPT)

    print("\n📄 TEXTO EXTRAÍDO PELO LLM:\n")

    print(resultado_img)

    if gerar_tabela:
        df = texto_para_dataframe(resultado_img, cliente="Viviane")

        output_path = "./vendas_viviane.xlsx"
        df.to_excel(output_path, index=False)

        print("\n📊 PLANILHA GERADA:")
        print(df)
        print(f"\n✅ Excel salvo em: {output_path}")


if __name__ == "__main__":
    main(gerar_tabela=True)
