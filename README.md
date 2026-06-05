# 🏛️ Portal de Dados da Câmara dos Deputados

Este projeto consiste em um sistema completo de ingestão, armazenamento, processamento e visualização de dados referentes aos deputados federais da Câmara dos Deputados do Brasil. O projeto engloba o banco de dados relacional PostgreSQL (rodando em contêiner Docker), scripts de carga de dados em Python, uma API Backend robusta em Node.js (Express) e uma interface rica em React + Vite.

---

## 🛠️ Tecnologias Utilizadas

*   **Banco de Dados:** PostgreSQL 15 & pgAdmin 4 (via Docker Compose)
*   **Pipeline de Carga:** Python 3 (com `psycopg2-binary` e biblioteca `csv`)
*   **Backend (API):** Node.js, Express, `pg` (Database Client), CORS
*   **Frontend:** React (v19), Vite, React Router, Recharts (gráficos), React Wordcloud, Lucide React (ícones)

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:
1.  **Docker** e **Docker Compose**
2.  **Python 3.x** e gerenciador de pacotes `pip`
3.  **Node.js** (versão 18 ou superior) e `npm`

---

## 🚀 Passo a Passo para Execução do Projeto

Siga as etapas abaixo na ordem indicada para configurar e rodar todo o ambiente.

### 1. Subir o Banco de Dados (PostgreSQL & pgAdmin)

O banco de dados e a interface gráfica do pgAdmin são gerenciados via Docker Compose.
A partir da raiz do projeto (`BDR_trabalho`), execute no terminal:

```bash
docker compose up -d
```

#### Credenciais e Portas Padrão (definidas no [docker-compose.yaml](file:///c:/Users/jvict/victors/estudos/aulas/bdr/BDR_trabalho/docker-compose.yaml)):
*   **PostgreSQL:**
    *   **Porta:** `5432`
    *   **Host:** `localhost`
    *   **Usuário:** `admin`
    *   **Senha:** `admin123`
    *   **Banco inicial:** `meu_banco` (o script de ingestão criará e usará o banco `backend`)
*   **pgAdmin:**
    *   **URL:** http://localhost:5050
    *   **E-mail:** `admin@admin.com`
    *   **Senha:** `admin123`

---

### 2. Inicialização do Banco e Carga de Dados (2 Caminhos Disponíveis)

A carga de dados processa arquivos CSV da pasta `dados_finais/` e insere-os no banco de dados. Você pode escolher entre **dois caminhos de execução** para criar a estrutura do banco:

#### 📋 Passo Comum Inicial: Instalar as Dependências do Python
Antes de qualquer um dos caminhos, instale o driver do PostgreSQL para Python executando:
```bash
pip install psycopg2-binary
```

---

#### 🟢 Caminho A (Início Rápido): Ingestão Automática com Criação Dinâmica
Neste caminho, o script Python cria automaticamente o banco de dados e as tabelas básicas à medida que os dados são carregados. Excelente para testar o fluxo rapidamente.

1. Executar o script de carga diretamente:
   ```bash
   python carga_de_dados.py
   ```
2. *(Opcional)* Após a carga dos dados, execute o script SQL para adicionar os índices de performance e comentários descritivos das colunas:
   * **No Windows (PowerShell):**
     ```powershell
     Get-Content .\criar_tabelas_sql.sql | docker exec -i postgres_db psql -U admin -d backend
     ```
   * **No Linux / macOS (Bash):**
     ```bash
     docker exec -i postgres_db psql -U admin -d backend < criar_tabelas_sql.sql
     ```

---

#### 🔵 Caminho B (Recomendado): Criação da Estrutura SQL Prévia + Ingestão
Neste caminho, criamos primeiro o banco de dados e as tabelas otimizadas com todas as chaves, índices e comentários rodando o script SQL, e só então rodamos o Python para popular a base de dados.

1. Criar o banco de dados `backend` manualmente no PostgreSQL:
   ```bash
   docker exec -i postgres_db psql -U admin -c "CREATE DATABASE backend;"
   ```
2. Executar o script SQL para criar a estrutura completa (tabelas, índices e comentários):
   * **No Windows (PowerShell):**
     ```powershell
     Get-Content .\criar_tabelas_sql.sql | docker exec -i postgres_db psql -U admin -d backend
     ```
   * **No Linux / macOS (Bash):**
     ```bash
     docker exec -i postgres_db psql -U admin -d backend < criar_tabelas_sql.sql
     ```
3. Executar o script de carga em Python (como as tabelas já foram criadas na etapa anterior, a cláusula `IF NOT EXISTS` do script Python impedirá a recriação e apenas inserirá os dados):
   ```bash
   python carga_de_dados.py
   ```

> ⚠️ **Importante (Comentários de Carga):** No final do arquivo [carga_de_dados.py](file:///c:/Users/jvict/victors/estudos/aulas/bdr/BDR_trabalho/carga_de_dados.py), dentro do bloco `if __name__ == "__main__":`, você pode optar por comentar ou descomentar as chamadas de funções específicas para importar outros conjuntos de dados (ex.: deputados, votações, despesas, frentes, proposições, etc.).
> 
> Exemplo de bloco configurável em [carga_de_dados.py](file:///c:/Users/jvict/victors/estudos/aulas/bdr/BDR_trabalho/carga_de_dados.py):
> ```python
> if __name__ == "__main__":
>     # arquivo_deputados_csv = r'dados_finais\deputados.csv'
>     # carregar_deputados(arquivo_deputados_csv)
>     # ...
>     arquivo_despesas_csv = r'dados_finais\despesas.csv'
>     carregar_despesas(arquivo_despesas_csv)
> ```

#### Logs e Tratamento de Erros:
* Os **metadados** consolidados da execução são gravados como JSON na pasta `logs/`.
* Linhas de dados com inconsistência ou erros de importação são isoladas e salvas na pasta `logs/erros/` em arquivos `.txt` contendo a causa detalhada do erro.

---

### 4. Iniciar a API Backend (Node.js)

O backend expõe endpoints para consultas de gastos, votações, perfis dos deputados e índices de lealdade/eficiência.

1.  Acesse o diretório do backend:
    ```bash
    cd backend
    ```
2.  Instale as dependências necessárias:
    ```bash
    npm install
    ```
3.  Inicie o servidor localmente:
    ```bash
    npm start
    ```

A API estará ativa em http://localhost:3000.
*   **Rota de Teste de Conexão:** Acesse http://localhost:3000/api/teste-conexao no seu navegador para validar a comunicação com o banco PostgreSQL.

---

### 5. Iniciar a Interface Frontend (React + Vite)

O frontend oferece um painel interativo contendo gráficos, busca inteligente de parlamentares (inclusive por CPF), visualização partidária e rankings de benefício.

1.  Acesse o diretório do frontend:
    ```bash
    cd frontend
    ```
2.  Instale as dependências necessárias:
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

Acesse o endereço fornecido no terminal (geralmente http://localhost:5173) no seu navegador para interagir com a aplicação.

---

## 📂 Arquivos de Análise e Consultas Extra

*   **[consultas_perguntas.sql](file:///c:/Users/jvict/victors/estudos/aulas/bdr/BDR_trabalho/consultas_perguntas.sql):** Script contendo todas as queries SQL utilizadas no projeto para responder às perguntas analíticas (gastos de deputados, atuação legislativa, alinhamento partidário, correlação de escolaridade e cálculo de índices complexos de eficiência).
*   **[analise_dados.ipynb](file:///c:/Users/jvict/victors/estudos/aulas/bdr/BDR_trabalho/analise_dados.ipynb):** Jupyter Notebook utilizado no processo de limpeza, exploração inicial dos dados e prototipagem analítica.
