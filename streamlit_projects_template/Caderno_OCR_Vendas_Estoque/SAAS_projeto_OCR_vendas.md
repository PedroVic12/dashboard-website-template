# SAAS Caderno de Vendas OCR
---

1️⃣ **Ler a imagem como um humano + OCR**
2️⃣ **Mapear exatamente o padrão do caderno**
3️⃣ **Traduzir isso para regras que vamos colocar no código (parser)**


---

## 🧠 O QUE TEM NA FOTO DO CADERNO DE VENDAS

### 📌 TOPO

* Nome do cliente escrito à mão:

  ```
  Viviane
  ```

👉 **Regra:**
👉 Cliente = **primeira palavra isolada centralizada no topo**

---

### 📌 FORMATO DAS LINHAS

Cada linha segue **exatamente este padrão visual**:

```
QTD   DESCRIÇÃO DO PRODUTO              TOTAL
```

Exemplos reais da imagem:

```
52  coca cervejinha          3.276,00
06  fardo Heineken             912,00
01  cabaré ice                  80,00
02  cx brahma                  300,00
10 coquinha                   290,00
```

💡 Importante:

* **Não existe valor unitário escrito**
* O valor à direita é **TOTAL da linha**
* Quantidade pode ser:

  * unidade (01, 02…)
  * fardo
  * cx (caixa)
* Produto é **texto livre**, sujo, manuscrito

---

### 📌 FINAL DA PÁGINA

* Total geral do cliente:

```
7.684,00
```

👉 Isso **não é item**, é **TOTAL GERAL**
👉 O parser **NÃO pode tratar isso como produto**

---

## ⚠️ PROBLEMAS QUE O OCR VAI TER (E JÁ PREVEMOS)

1️⃣ Vai confundir:

* `cx` ↔ `c x` ↔ `ex`
* `00` ↔ `O0`
* vírgula ↔ ponto

2️⃣ Às vezes vai ler:

```
52 coca cervejinha 327600
```

(em vez de 3.276,00)

👉 Precisamos **normalizar números**

---

## 🧠 REGRA DE OURO PARA O PARSER

O parser NÃO deve tentar ser “inteligente demais”.
Ele deve seguir **heurísticas fixas**:

### ✅ Uma linha é PRODUTO se:

* Começa com **número (quantidade)**
* Termina com **número grande (>= 10 reais)**

### ❌ Ignorar linha se:

* Só tem número grande sozinho (total final)
* Não começa com número

---

## 🧩 MODELO DE DADOS FINAL (PERFEITO PRA EXCEL)

| Cliente | Quantidade | Produto         | Total   | Valor Unitário |
| ------- | ---------- | --------------- | ------- | -------------- |
| Viviane | 52         | Coca Cervejinha | 3276.00 | 63.00          |
| Viviane | 6          | Fardo Heineken  | 912.00  | 152.00         |

👉 **Valor unitário = Total / Quantidade**

---

## 🔧 COMO ISSO ENTRA NO CÓDIGO (VISÃO DE ENGENHARIA)

Vamos ajustar **somente o ParserModel**, sem mexer no Streamlit nem no OCR.

### 🔑 Regex correta para ESSE caderno:

```regex
^(\d{1,3})\s+(.+?)\s+([\d.,]{4,})
```

Tradução:

* `(\d{1,3})` → quantidade
* `(.+?)` → produto (texto sujo mesmo)
* `([\d.,]{4,})` → total (mín. 4 chars → evita pegar 10, 15 etc errados)

---

## 🚀 PRÓXIMO PASSO (AGORA É COMIGO)

👉 **No próximo retorno eu vou te entregar:**

✅ Código **streamlit_app.py ATUALIZADO**
✅ Parser ajustado **exclusivamente para esse padrão**
✅ Tratamento de erro de OCR
✅ Normalização de valores (3.276,00 → 3276.00)
✅ Ignorar total final
✅ Resultado limpo igual planilha de mercado

---

