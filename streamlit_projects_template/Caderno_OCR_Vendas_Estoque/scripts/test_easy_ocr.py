import cv2
from doctr.io import DocumentFile
from doctr.models import ocr_predictor


# pip install python-doctr[torch] opencv-python pillow matplotlib


# 📸 IMAGEM DO CADERNO
IMAGE_PATH = r"C:\Users\pedrovictor.veras\OneDrive - Operador Nacional do Sistema Eletrico\Documentos\ESTAGIO_ONS_PVRV_2025\GitHub\dashboard-website-template\streamlit_projects_template\Caderno_OCR_Vendas_Estoque\assets\paper_venda_viviane.jpg"

def preprocess(path):
    img = cv2.imread(path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)
    return gray

def main():
    print("🔍 Carregando modelo docTR (handwritten-friendly)...")

    model = ocr_predictor(
        det_arch="db_resnet50",
        reco_arch="crnn_vgg16_bn",
        pretrained=True
    )

    doc = DocumentFile.from_images(IMAGE_PATH)

    result = model(doc)

    print("\n📄 TEXTO OCR EXTRAÍDO (ORDENADO):\n")

    for page in result.pages:
        for block in page.blocks:
            for line in block.lines:
                text = " ".join([word.value for word in line.words])
                print(text)

if __name__ == "__main__":
    main()
