from flask import Flask, render_template, send_from_directory
import os


#gunicorn --bind 0.0.0.0:8080 app:app

class PikachuServer:
    """
    Uma classe de servidor web Flask para servir um dashboard de análise.
    Esta classe encapsula a configuração e execução do servidor.
    """

    def __init__(self):
        """
        Inicializador da classe PikachuServer.
        Chama os métodos para configurar o site e as rotas.
        """
        self.app = None
        self.setup_website()
        self.setup_routes()

    def setup_website(self):
        """
        Configura a instância principal da aplicação Flask.
        Define as pastas de templates e arquivos estáticos como o diretório atual
        para que o Flask possa encontrar 'index.html' e outros arquivos como
        'must_tables_PDF_notes_merged.json'.
        """
        # O '.' indica que a pasta raiz do projeto é o diretório atual.
        self.app = Flask(__name__, template_folder='.', static_folder='.')

    def setup_routes(self):
        """
        Define todas as rotas da aplicação web.
        """

        @self.app.route('/')
        def index():
            """
            Rota principal que renderiza a página do dashboard.
            Retorna:
                O conteúdo renderizado de index.html.
            """
            # Renderiza o arquivo HTML principal do seu dashboard.
            return self.app.send_static_file('index.html')

        @self.app.route('/<path:filename>')
        def serve_static_files(filename):
            """
            Rota para servir arquivos estáticos necessários para o frontend,
            como o arquivo JSON de dados que seu script tenta carregar.
            Args:
                filename (str): O nome do arquivo a ser servido.
            Retorna:
                O arquivo solicitado do diretório raiz.
            """
            # Envia arquivos como 'must_tables_PDF_notes_merged.json' para o cliente.
            return send_from_directory('.', filename)

    def run_server(self, host='0.0.0.0', port=8080):
        """
        Inicia o servidor de desenvolvimento do Flask.
        Args:
            host (str): O host no qual o servidor irá rodar. '0.0.0.0' o torna
                        acessível na sua rede local.
            port (int): A porta que o servidor irá escutar.
        """
        print(f" * Servidor Pikachu rodando em http://{host}:{port}")
        print(f"\n* Acesse http://127.0.0.1:{port} no seu navegador para acessar o frontend")
        self.app.run(host=host, port=port, debug=True)

# Ponto de entrada da aplicação
if __name__ == '__main__':
    # --- INSTRUÇÕES PARA RODAR O SERVIDOR ---
    # 1. Instale o Flask:
    #    pip install Flask
    #
    # 2. Coloque este arquivo (app.py) no mesmo diretório que os seus arquivos:
    #    - index.html
    #    - must_tables_PDF_notes_merged.json (IMPORTANTE: este arquivo de dados é necessário)
    #
    # 3. Execute este script no seu terminal:
    #    python app.py
    #
    # 4. Abra o seu navegador e acesse o endereço: http://127.0.0.1:8080

    # Cria uma instância do servidor e o inicia.
    server = PikachuServer()
    server.run_server()



