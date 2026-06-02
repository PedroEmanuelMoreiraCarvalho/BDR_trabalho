# Planejamento: Mapeamento de Consultas SQL para Interface (React)

Com base nas análises levantadas no arquivo `consultas_perguntas.sql`, estruturamos como cada pergunta será respondida visualmente dentro da nossa plataforma. O objetivo é manter o *Dark Mode premium* e focar em gráficos interativos.

Abaixo, dividimos a interface em suas respectivas abas/rotas e descrevemos os componentes necessários:

---

### 1. Visão Nacional (`/`)
*Foco: Métricas amplas e rankings gerais do país.*

- **Pergunta 1: Deputados ordenados por gastos**
  - **Componente Atual:** Gráfico de Barras verticais (Top 10) + Lista expansível (*Já implementado*).
- **Pergunta 4: Agrupamento por Escolaridade**
  - **Componente:** Gráfico de Rosca (*Donut Chart* via `recharts`) ou *Treemap*, mostrando a distribuição percentual da escolaridade na Câmara.
- **Pergunta 5: Maiores fornecedores (Contratos)**
  - **Componente:** Tabela estilizada (Estilo *Glassmorphism*) com scroll vertical e barra de progresso embutida na coluna de valor.

---

### 2. Visão Partidária (`/partidos`)
*Foco: Comportamento das bancadas e legendas.*

- **Pergunta 10: Alinhamento interno dos Partidos**
  - **Componente:** Gráfico de Barras Horizontais ordenado pelo `% de alinhamento`.
  - **Efeito Visual:** Barras com gradiente (ex: Verde para >90% de alinhamento, Amarelo/Vermelho para menor coesão). Pode incluir um *Tooltip* detalhando a quantidade absoluta de votos rebeldes vs alinhados.

---

### 3. Perfil do Deputado (`/parlamentares/:id`)
*Foco: Raio-X individual de um parlamentar após clicar nele na página de busca.*

- **Pergunta 2: Eixo de atuação (Nuvem de Palavras)**
  - **Componente:** *Word Cloud* (Nuvem de Palavras) interativa usando `react-wordcloud`. As palavras/temas mais frequentes nos projetos do deputado aparecerão maiores.
- **Pergunta 13: Com o que o deputado mais gasta?**
  - **Componente:** Gráfico de Rosca (*Donut Chart*) mostrando as fatias de gastos (ex: Passagens, Divulgação, Combustível).
- **Pergunta 12: Principais Fornecedores do Deputado**
  - **Componente:** Lista/Ranking top 5 empresas recebedoras (Nome da Empresa + Valor).
- **Pergunta 3: Como o deputado votou em um tema específico**
  - **Componente:** *Timeline* (Linha do tempo) vertical ou uma Tabela de Filtro Dinâmico. O usuário seleciona um Tema (ex: "Tributário") e vê uma lista de votações com "Sim", "Não", "Abstenção", com *tags* coloridas.

---

### 4. Análises Avançadas (`/analise`)
*Foco: Cruzamento de dados e estatísticas mais densas (Correlações e Custo-Benefício).*

- **Pergunta 6: Correlacionar Escolaridade x (Gastos, Fidelidade, Presença, etc.)**
  - **Componente:** Gráfico de Radar (*Radar Chart*) ou Gráficos de Barras Agrupadas. Permitirá ao usuário selecionar no menu o que ele quer comparar contra a escolaridade (ex: Dropdown para escolher "Gastos" ou "Fidelidade" e o gráfico se adapta).
- **Pergunta 7: Custo x Benefício do Deputado**
  - **Componente:** Gráfico de Dispersão (*Scatter Plot*).
  - **Visualização:** Eixo X = Gasto Total; Eixo Y = Score de Benefício (Presenças + Proposições). 
  - **Interatividade:** O usuário poderá passar o mouse sobre os pontos do gráfico para ver qual deputado está naquele quadrante (ex: quadrante "Alto Custo, Baixo Benefício").
