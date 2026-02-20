# Guia da API Frontend do Tauri para Interação com Backend Rust

Este guia explica como interagir com o seu backend Rust a partir do seu frontend (HTML/JavaScript) em uma aplicação Tauri, traçando paralelos com a forma como você lidaria com chamadas de API em aplicações Node.js (Express) ou Python (Flask).

## Como Usar `tauri dev` para Conectar o Frontend ao Backend

`tauri dev` é o comando principal que você executa no terminal, na raiz do seu projeto Tauri (por exemplo, `/home/pedrov12/Documentos/GitHub/dashboard-website-template/dashboard-must-tauri-app`), para desenvolver sua aplicação.

Quando você executa `tauri dev`, ele realiza várias ações:
1.  **Compila seu Backend Rust:** Ele compila seu código Rust em `src-tauri` em um executável.
2.  **Inicia seu Servidor de Desenvolvimento Frontend:** Se o seu `tauri.conf.json` estiver configurado para usar um servidor de desenvolvimento frontend (por exemplo, Vite, Webpack, etc.), `tauri dev` iniciará esse servidor. Este servidor hospeda seu HTML, CSS e JavaScript.
3.  **Inicia a Janela Tauri:** Ele abre uma janela de desktop que carrega seu frontend. Crucialmente, esta janela de desktop fornece uma ponte segura (IPC - Comunicação Interprocessos) entre seu frontend baseado em web e seu backend Rust.

**Como a Conexão Funciona:**

*   **Frontend (JavaScript):** Seu código JavaScript (por exemplo, em `src/main.js`) usa a função `invoke` do `@tauri-apps/api/tauri` para chamar comandos Rust. Por exemplo: `import { invoke } from '@tauri-apps/api/tauri'; await invoke('meu_comando');`
*   **Backend (Rust):** Suas funções Rust anotadas com `#[tauri::command]` (como `my_command` em `src-tauri/src/main.rs`) são expostas ao frontend através dessa ponte.

Portanto, para conectar seu backend Rust com seu frontend, você só precisa:
1.  **Garantir que seu `src-tauri/src/main.rs` registre seus comandos** (o que já fizemos para `my_command`).
2.  **Garantir que seu frontend use `invoke`** para chamar esses comandos.
3.  **Executar `tauri dev`** a partir da raiz do seu projeto.

---

## 1. Invocando Comandos Rust a partir do JavaScript

No Tauri, funções anotadas com `#[tauri::command]` no seu backend Rust tornam-se chamáveis a partir do seu JavaScript frontend. Isso é semelhante a definir endpoints de API em Node.js ou Flask, mas em vez de requisições HTTP, o Tauri oferece um mecanismo direto e seguro de IPC (Comunicação Interprocessos).

### Backend Rust (`src-tauri/src/main.rs` ou outros arquivos Rust)

```rust
// Exemplo: Um comando simples que retorna uma saudação
#[tauri::command]
fn greet(name: String) -> String {
    format!("Olá, {}! Você foi cumprimentado do Rust!", name)
}

// Exemplo: Um comando que simula uma consulta de banco de dados (como buscar dados de um endpoint Flask/Express)
#[tauri::command]
fn fetch_user_data(user_id: u32) -> Result<String, String> {
    // Em uma aplicação real, você interagiria com um banco de dados aqui.
    // Isso é análogo a um endpoint GET /users/<id> em Flask.
    if user_id == 1 {
        Ok(format!("{{\"id\": {}, \"nome\": \"Alice\", \"email\": \"alice@example.com\"}}", user_id))
    } else if user_id == 2 {
        Ok(format!("{{\"id\": {}, \"nome\": \"Bob\", \"email\": \"bob@example.com\"}}", user_id))
    } else {
        Err("Usuário não encontrado".into())
    }
}

// Você precisa registrar seus comandos na função `main`:
fn main() {
    tauri::Builder::default()
        // ... outras configurações ...
        .invoke_handler(tauri::generate_handler![greet, fetch_user_data])
        .run(tauri::generate_context!())
        .expect("erro ao executar a aplicação tauri");
}
```

### Frontend JavaScript (por exemplo, `src/main.js` ou script de uma página específica)

Para chamar esses comandos Rust, você usa a função `invoke` fornecida por `@tauri-apps/api/tauri`.

```javascript
import { invoke } from "@tauri-apps/api/tauri";

// Análogo a chamar um endpoint GET /greet?name=World em Node.js
async function callGreet() {
    try {
        const response = await invoke("greet", { name: "Mundo" });
        console.log("Saudação do Rust:", response); // Saída: "Olá, Mundo! Você foi cumprimentado do Rust!"
    } catch (error) {
        console.error("Erro ao chamar greet:", error);
    }
}

// Análogo a chamar um endpoint GET /users/1 em Flask
async function callFetchUserData() {
    try {
        const userDataString = await invoke("fetch_user_data", { userId: 1 });
        const userData = JSON.parse(userDataString); // Parseia a resposta JSON
        console.log("Dados do Usuário do Rust:", userData); // Saída: { id: 1, nome: "Alice", email: "alice@example.com" }
    } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error); // Saída: "Usuário não encontrado" se userId não for 1 ou 2
    }
}

// Chama as funções
callGreet();
callFetchUserData();
```

---

## 2. Emitindo e Escutando Eventos

O Tauri oferece um sistema de eventos, semelhante a eventos personalizados em Node.js ou Flask (por exemplo, usando WebSockets ou SSE para atualizações em tempo real). Isso permite que seu backend Rust envie informações para o frontend sem que o frontend as solicite explicitamente.

### Backend Rust

```rust
use tauri::Manager; // Necessário para acessar o gerenciador de eventos

// Exemplo: Um comando que emite um evento após algum trabalho (como a conclusão de uma tarefa em segundo plano)
#[tauri::command]
fn start_long_task(app_handle: tauri::AppHandle) {
    // Simula algum trabalho de longa duração
    std::thread::spawn(move || {
        println!("Iniciando tarefa demorada...");
        std::thread::sleep(std::time::Duration::from_secs(3));
        let message = "Tarefa demorada concluída!";
        app_handle.emit_all("task_status", message).unwrap(); // Emite evento para todas as janelas
        println!("Tarefa demorada finalizada e evento emitido!");
    });
}

// Registre `start_long_task` na função `main` junto com outros comandos.
```

### Frontend JavaScript

```javascript
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";

// Escuta o evento personalizado do backend Rust
const unlisten = await listen("task_status", (event) => {
    console.log("Evento recebido do Rust:", event.payload); // Saída: "Tarefa demorada concluída!"
});

// Chama o comando Rust para iniciar a tarefa
async function triggerLongTask() {
    await invoke("start_long_task");
    console.log("Tarefa demorada acionada pelo frontend.");
}

triggerLongTask();

// Para parar de escutar o evento mais tarde:
// unlisten();
```

---

## 3. Acessando o Sistema de Arquivos (de Forma Segura)

Ao contrário de Node.js ou Flask, onde você acessa diretamente o sistema de arquivos do servidor, as aplicações Tauri são executadas na máquina do usuário, então o acesso direto e irrestrito ao sistema de arquivos é um risco de segurança. O Tauri fornece APIs seguras para isso, exigindo permissões do usuário.

### Backend Rust

Normalmente, você não exporia operações brutas do sistema de arquivos diretamente como `#[tauri::command]`s sem validação e escopo cuidadosos. Em vez disso, você usaria as APIs ou plugins de sistema de arquivos integrados do Tauri.

Exemplo (conceitual, requer que o módulo/plugin `fs` do Tauri esteja habilitado e configurado em `tauri.conf.json`):

```rust
// Isso geralmente usa tauri::api::fs ou um plugin
// #[tauri::command]
// async fn read_my_document(path: String) -> Result<String, String> {
//     // Lê o arquivo de forma segura, após permissão do usuário via diálogo, se necessário
//     // Isso é mais complexo do que um simples fs::read_to_string
//     // devido ao sandboxing de segurança.
//     Ok(format!("Conteúdo de {}: ...", path))
// }
```

### Frontend JavaScript

Você usaria o módulo `fs` de `@tauri-apps/api` (se habilitado em `tauri.conf.json`).

```javascript
import { readTextFile, BaseDirectory } from "@tauri-apps/api/fs";

async function readFile() {
    try {
        // Lê um arquivo do diretório de documentos do usuário (requer permissão)
        const contents = await readTextFile("meu-documento.txt", { dir: BaseDirectory.Document });
        console.log("Conteúdo do arquivo:", contents);
    } catch (error) {
        console.error("Erro ao ler arquivo:", error);
    }
}

readFile();
```

---

## Checklist para Conectar Frontend ao Backend Rust (Analogias Node.js/Flask/Python)

Aqui está um checklist para tarefas comuns e como elas se mapeiam para o Tauri, com analogias aos conceitos de Node.js (Express) ou Python (Flask):

-   [x] **Definindo Lógica de Backend (Endpoints de API):**
    -   **Node.js/Flask/Python:** Crie rotas (`app.get('/api/data', ...)`, `@app.route('/api/data')`).
    -   **Tauri Rust:** Use `#[tauri::command]` em funções Rust.
        -   **Ação:** Anote suas funções Rust com `#[tauri::command]`.
        -   **Ação:** Registre essas funções em `tauri::Builder::invoke_handler!`.

-   [x] **Chamando Lógica de Backend do Frontend (Fazendo Requisições de API):**
    -   **Node.js/Flask/Python:** Use `fetch('/api/data')` ou `requests.get('/api/data')`.
    -   **Tauri JavaScript:** Use `import { invoke } from "@tauri-apps/api/tauri";` e `await invoke("nome_comando", { arg1: valor1 });`.
        -   **Ação:** Importe `invoke`.
        -   **Ação:** Chame `invoke` com o nome do comando e os argumentos como um objeto JavaScript.

-   [x] **Passando Dados para o Backend (Corpo da Requisição/Parâmetros de Consulta):**
    -   **Node.js/Flask/Python:** Passe dados no corpo de `fetch` (POST/PUT) ou `requests` (dados JSON/form) ou em parâmetros de consulta (GET).
    -   **Tauri Rust/JS:** Passe argumentos como um objeto JavaScript para `invoke`. Os parâmetros da função Rust mapeiam diretamente para estes.
        -   **Ação:** Certifique-se de que os parâmetros da função Rust correspondam às chaves no objeto JavaScript passado para `invoke`. Tipos Rust (por exemplo, `String`, `u32`, `bool`, `serde_json::Value`) devem corresponder aos tipos JSON esperados.

-   [x] **Recebendo Dados do Backend (Resposta da API):**
    -   **Node.js/Flask/Python:** `response.json()`, `response.text()`, `response.json()` (Python `requests`).
    -   **Tauri JavaScript:** A chamada `invoke` retorna diretamente o valor de retorno da função Rust. Se o Rust retornar `Result<T, E>`, `invoke` resolve com `T` ou rejeita com `E`. Para dados complexos, o Rust pode retornar `String` (JSON) que o JS então `JSON.parse()`.
        -   **Ação:** Defina os tipos de retorno da função Rust.
        -   **Ação:** Lide com tipos `Result` em Rust (para tratamento de erros).
        -   **Ação:** Use `JSON.parse()` em JavaScript se o Rust retornar JSON como uma `String`.

-   [x] **Lidando com Operações Assíncronas:**
    -   **Node.js/Flask/Python:** `async`/`await`, Promises (JS), `async def`/`await` (Python).
    -   **Tauri Rust/JS:** `invoke` retorna uma Promise, então use `async`/`await` em JavaScript. Comandos Rust também podem ser `async`.
        -   **Ação:** Use `async`/`await` no seu frontend JavaScript para chamadas `invoke`.

-   [x] **Backend Enviando Dados para o Frontend (WebSockets/SSE):**
    -   **Node.js/Flask/Python:** Implemente WebSockets (Socket.IO) ou Server-Sent Events.
    -   **Tauri Rust/JS:** Use o sistema de eventos do Tauri. Backend `app_handle.emit_all("nome_evento", payload).unwrap();`, Frontend `listen("nome_evento", (event) => ...)`.
        -   **Ação:** Em Rust, obtenha `AppHandle` e use `emit_all`.
        -   **Ação:** Em JavaScript, `import { listen } from "@tauri-apps/api/event";` e chame `listen`.

-   [ ] **Interação com Banco de Dados:**
    -   **Node.js/Flask/Python:** Use ORMs (Sequelize, SQLAlchemy) ou drivers brutos (pg, mysql2, psycopg2).
    -   **Tauri Rust:** Use crates de banco de dados Rust (por exemplo, `sqlx`, `diesel`, `rusqlite`). Suas funções `#[tauri::command]` encapsularão a lógica do banco de dados.
        -   **Ação:** Escolha um crate de banco de dados Rust.
        -   **Ação:** Implemente a lógica do banco de dados dentro das funções `#[tauri::command]`.
        -   **Ação:** Certifique-se de que as conexões do banco de dados sejam gerenciadas corretamente (por exemplo, pools de conexão).

-   [ ] **Autenticação/Autorização:**
    -   **Node.js/Flask/Python:** Sessões, JWT, OAuth.
    -   **Tauri Rust:** Implemente lógica personalizada dentro das funções `#[tauri::command]` para validar usuários/tokens, gerenciar o estado do usuário de forma segura (por exemplo, usando plugins de armazenamento seguro) ou integrar-se a provedores OAuth externos.
        -   **Ação:** Defina a estratégia de autenticação.
        -   **Ação:** Implemente comandos de login/logout.
        -   **Ação:** Armazene credenciais/tokens do usuário de forma segura.

-   [ ] **Acesso ao Sistema de Arquivos (Servidor vs. Cliente):**
    -   **Node.js/Flask/Python:** `fs.readFile`, `os.path.join`. Acesso total ao servidor.
    -   **Tauri Rust/JS:** Use `@tauri-apps/api/fs` em JavaScript (para acesso controlado pelo usuário) ou crates Rust especializados/plugins Tauri para operações de arquivo específicas do backend *dentro do ambiente em sandbox*. Requer configuração cuidadosa em `tauri.conf.json` e permissão do usuário.
        -   **Ação:** Defina as capacidades necessárias do sistema de arquivos em `tauri.conf.json`.
        -   **Ação:** Use `readTextFile`, `writeTextFile` de `@tauri-apps/api/fs` no frontend.
        -   **Ação:** Crie comandos Rust para operações específicas e validadas do sistema de arquivos, se realmente necessário.

-   [ ] **Variáveis de Ambiente:**
    -   **Node.js/Flask/Python:** `process.env`, `os.environ`.
    -   **Tauri Rust:** Pode acessar variáveis de ambiente do sistema (`std::env::var`). Para o frontend, considere passar um subconjunto via `invoke` ou usar a configuração do Tauri.
        -   **Ação:** Acesse `std::env::var` em Rust.
        -   **Ação:** Decida se e como expor variáveis de ambiente necessárias ao frontend.

Este guia oferece uma base sólida para conectar seu frontend Tauri ao seu backend Rust. Lembre-se de sempre priorizar a segurança, especialmente ao lidar com acesso ao sistema de arquivos ou dados confidenciais.
