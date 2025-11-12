## O Modelo de Dados

Abandonamos a ideia de uma única tabela gigante em favor de um modelo mais robusto e normalizado:

__DocumentosPDF__

DocumentoID (Chave Primária): Identificador único para cada PDF.

NomeArquivo: O nome do arquivo PDF original (ex: CUST-2002...pdf).

DataExtracao: Quando os dados foram processados.

__TabelasExtraidas__

TabelaID (Chave Primária): Identificador único para cada tabela.

DocumentoID (Chave Estrangeira): Liga a tabela ao seu PDF de origem na tabela DocumentosPDF.

NomeTabelaOriginal: O nome do arquivo Excel/CSV gerado.

DadosTabelaJSON: O conteúdo completo da tabela, armazenado como um texto JSON. Isso nos dá flexibilidade total.

__AnotacoesExtraidas__

AnotacaoID (Chave Primária): Identificador único para cada anotação.

DocumentoID (Chave Estrangeira): Liga a anotação ao seu PDF de origem.

ConteudoTexto: O texto extraído.