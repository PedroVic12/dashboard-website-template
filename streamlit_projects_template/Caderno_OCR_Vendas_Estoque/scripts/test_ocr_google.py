import os
from google.cloud import vision
from dotenv import load_dotenv

# Carrega .env
load_dotenv()

# 🔑 Caminho do JSON
cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

if not cred_path:
    raise RuntimeError("GOOGLE_APPLICATION_CREDENTIALS não encontrado no .env")

if not os.path.exists(cred_path):
    raise FileNotFoundError(f"Arquivo de credencial NÃO encontrado: {cred_path}")

# 👉 ESSA LINHA É CRÍTICA
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = cred_path

print("✅ Usando credencial:", cred_path)

# 📸 Imagem de teste
IMAGE_PATH = r"C:\Users\pedrovictor.veras\OneDrive - Operador Nacional do Sistema Eletrico\Documentos\ESTAGIO_ONS_PVRV_2025\GitHub\dashboard-website-template\streamlit_projects_template\Caderno_OCR_Vendas_Estoque\assets\paper_venda_viviane.jpg"

if not os.path.exists(IMAGE_PATH):
    raise FileNotFoundError("Imagem de teste não encontrada")

def main():
    client = vision.ImageAnnotatorClient()

    with open(IMAGE_PATH, "rb") as f:
        content = f.read()

    image = vision.Image(content=content)
    response = client.text_detection(image=image)

    if response.error.message:
        raise RuntimeError(response.error.message)

    texts = response.text_annotations

    if not texts:
        print("❌ Nenhum texto detectado")
        return

    print("\n📄 TEXTO OCR COMPLETO:\n")
    print(texts[0].description)

if __name__ == "__main__":
    main()
