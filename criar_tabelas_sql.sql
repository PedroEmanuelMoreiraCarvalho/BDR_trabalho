-----------------------------------
-- Criação da tabela de Deputados--
-----------------------------------
CREATE TABLE deputados (
    id_deputado INTEGER PRIMARY KEY,
    uri_deputado VARCHAR(255) NOT NULL,
    nome_civil_deputado VARCHAR(255) NOT NULL,
    cpf_deputado VARCHAR(11) NOT NULL,
    sexo_deputado VARCHAR(1) NOT NULL,
    rede_social_deputado TEXT,
    data_nascimento_deputado DATE,
    escolaridade_deputado VARCHAR(100),
    ultimo_status_sigla_partido VARCHAR(20),
    ultimo_status_sigla_uf VARCHAR(2),
    ultimo_status_url_foto VARCHAR(255),
    ultimo_status_nome_eleitoral VARCHAR(255) NOT NULL,
    ultimo_status_situacao VARCHAR(50),
    ultimo_status_condicao_eleitoral VARCHAR(50)
);

---------------------------------
-- Criação da tabela de Votação--
---------------------------------

CREATE TABLE votacao (
    id_votacao VARCHAR(50) PRIMARY KEY,
    data_votacao DATE NOT NULL,
    data_hora_registro_votacao TIMESTAMP,
    id_evento INTEGER NOT NULL,
    aprovacao BOOLEAN,
    votos_sim INTEGER NOT NULL,
    votos_nao INTEGER NOT NULL,
    votos_outros INTEGER NOT NULL,
    descricao_votacao TEXT,
    ultima_abertura_votacao_data_hora_registro TIMESTAMP,
    ultima_abertura_votacao_descricao TEXT,
    ultima_apresentacao_proposicao_data_hora_registro TIMESTAMP,
    ultima_apresentacao_proposicao_descricao TEXT,
    id_proposicao INTEGER
);

-- Índices para melhorar performance de consultas
CREATE INDEX idx_votacao_data_votacao ON votacao(data_votacao);
CREATE INDEX idx_votacao_id_evento ON votacao(id_evento);
CREATE INDEX idx_votacao_id_proposicao ON votacao(id_proposicao);
CREATE INDEX idx_votacao_aprovacao ON votacao(aprovacao);
CREATE INDEX idx_votacao_data_hora_registro ON votacao(data_hora_registro_votacao);

-- Índice composto para consultas comuns
CREATE INDEX idx_votacao_evento_data ON votacao(id_evento, data_votacao);

-- Comentários nas colunas para documentação
COMMENT ON TABLE votacao IS 'Tabela de votações da Câmara dos Deputados';
COMMENT ON COLUMN votacao.id_votacao IS 'Identificador único da votação. Chave primária.';
COMMENT ON COLUMN votacao.data_votacao IS 'Data em que a votação ocorreu. Formato AAAA-MM-DD.';
COMMENT ON COLUMN votacao.data_hora_registro_votacao IS 'Data e hora exata do registro da votação.';
COMMENT ON COLUMN votacao.id_evento IS 'ID do evento/sessão onde ocorreu a votação.';
COMMENT ON COLUMN votacao.aprovacao IS 'Indica se a matéria foi aprovada (true) ou não (false).';
COMMENT ON COLUMN votacao.votos_sim IS 'Total de votos favoráveis.';
COMMENT ON COLUMN votacao.votos_nao IS 'Total de votos contrários.';
COMMENT ON COLUMN votacao.votos_outros IS 'Total de abstenções ou outros tipos de voto.';
COMMENT ON COLUMN votacao.descricao_votacao IS 'Descrição detalhada do objeto da votação.';
COMMENT ON COLUMN votacao.ultima_abertura_votacao_data_hora_registro IS 'Data e hora da última abertura da votação.';
COMMENT ON COLUMN votacao.ultima_abertura_votacao_descricao IS 'Descrição da última abertura da votação.';
COMMENT ON COLUMN votacao.ultima_apresentacao_proposicao_data_hora_registro IS 'Data e hora da última apresentação da proposição.';
COMMENT ON COLUMN votacao.ultima_apresentacao_proposicao_descricao IS 'Descrição da última apresentação da proposição.';
COMMENT ON COLUMN votacao.id_proposicao IS 'ID da proposição principal sendo votada.';

----------------------------------------------
-- Criação da tabela de Votações Orientações--
----------------------------------------------

CREATE TABLE votacoes_orientacoes (
    id_votacao VARCHAR(50) NOT NULL,
    sigla_bancada VARCHAR(50) NOT NULL,
    orientacao VARCHAR(50),
    tipo VARCHAR(50),
    prioridade INTEGER,
    PRIMARY KEY (id_votacao, sigla_bancada)
);

-- Índices para melhorar performance de consultas
CREATE INDEX idx_votacoes_orientacoes_id_votacao ON votacoes_orientacoes(id_votacao);
CREATE INDEX idx_votacoes_orientacoes_sigla_bancada ON votacoes_orientacoes(sigla_bancada);
CREATE INDEX idx_votacoes_orientacoes_orientacao ON votacoes_orientacoes(orientacao);
CREATE INDEX idx_votacoes_orientacoes_votacao_bancada ON votacoes_orientacoes(id_votacao, sigla_bancada);

-- Comentários
COMMENT ON TABLE votacoes_orientacoes IS 'Tabela de orientações de voto por bancada/partido nas votações';
COMMENT ON COLUMN votacoes_orientacoes.id_votacao IS 'Identificador único da votação.';
COMMENT ON COLUMN votacoes_orientacoes.sigla_bancada IS 'Sigla da bancada ou partido que orientou o voto.';
COMMENT ON COLUMN votacoes_orientacoes.orientacao IS 'O voto orientado pela bancada (ex: Sim, Não, Obstrução).';

-----------------------------------------
-- Criação da tabela de Votações Votos --
-----------------------------------------

CREATE TABLE votacoes_votos (
    id_votacao VARCHAR(50) NOT NULL,
    id_deputado INTEGER NOT NULL,
    voto VARCHAR(50) NOT NULL,
    deputado_sigla_partido VARCHAR(255),
    
    PRIMARY KEY (id_votacao, id_deputado)
);

-- Índices para performance
CREATE INDEX idx_votacoes_votos_id_votacao ON votacoes_votos(id_votacao);
CREATE INDEX idx_votacoes_votos_id_deputado ON votacoes_votos(id_deputado);

-- Comentários
COMMENT ON TABLE votacoes_votos IS 'Registro dos votos dos deputados nas votações';
COMMENT ON COLUMN votacoes_votos.id_votacao IS 'Identificador único da votação.';
COMMENT ON COLUMN votacoes_votos.id_deputado IS 'Identificador do deputado que votou.';
COMMENT ON COLUMN votacoes_votos.voto IS 'Voto registrado do deputado.';

----------------------------------
-- Criação da tabela de Despesas--
----------------------------------

CREATE TABLE despesas (
    id_deputado INTEGER,
    id_deputado_despesas INTEGER,
    nome_parlamentar VARCHAR(255),
    cpf VARCHAR(11),
    sigla_partido VARCHAR(20),
    sigla_uf VARCHAR(2),
    nu_legislatura INTEGER,
    cod_legislatura INTEGER,
    cod_subcota INTEGER,
    desc_subcota VARCHAR(255),
    cod_especificacao_subcota INTEGER,
    desc_especificacao_subcota VARCHAR(255),
    fornecedor_nome VARCHAR(255),
    fornecedor_cnpj_cpf VARCHAR(14),
    data_emissao DATE,
    mes INTEGER,
    ano INTEGER,
    valor_documento DECIMAL(15,2),
    valor_glosa DECIMAL(15,2),
    valor_liquido DECIMAL(15,2),
    id_documento INTEGER,
    url_documento TEXT
);

-- Índices para performance
CREATE INDEX idx_despesas_id_deputado ON despesas(id_deputado);
CREATE INDEX idx_despesas_id_deputado_despesas ON despesas(id_deputado_despesas);
CREATE INDEX idx_despesas_data_emissao ON despesas(data_emissao);
CREATE INDEX idx_despesas_ano_mes ON despesas(ano, mes);
CREATE INDEX idx_despesas_partido ON despesas(sigla_partido);
CREATE INDEX idx_despesas_uf ON despesas(sigla_uf);

-- Comentários
COMMENT ON TABLE despesas IS 'Tabela de despesas dos deputados (CEAP - Cota para o Exercício da Atividade Parlamentar)';
COMMENT ON COLUMN despesas.id_deputado_despesas IS 'Identificador de cadastro do parlamentar na base de despesas (CEAP).';
COMMENT ON COLUMN despesas.id_deputado IS 'Identificador do deputado para cruzar com outras tabelas.';
COMMENT ON COLUMN despesas.nome_parlamentar IS 'Nome parlamentar do deputado na base de despesas.';
COMMENT ON COLUMN despesas.sigla_partido IS 'Sigla do partido (na data do gasto).';
COMMENT ON COLUMN despesas.sigla_uf IS 'UF do parlamentar (na data do gasto).';
COMMENT ON COLUMN despesas.nu_legislatura IS 'Número da legislatura.';
COMMENT ON COLUMN despesas.cod_legislatura IS 'Código da legislatura.';
COMMENT ON COLUMN despesas.cod_subcota IS 'Código do tipo de despesa (subcota).';
COMMENT ON COLUMN despesas.desc_subcota IS 'Descrição do tipo de despesa (subcota).';
COMMENT ON COLUMN despesas.cod_especificacao_subcota IS 'Código da especificação da subcota.';
COMMENT ON COLUMN despesas.desc_especificacao_subcota IS 'Descrição da especificação da subcota.';
COMMENT ON COLUMN despesas.fornecedor_nome IS 'Nome do fornecedor.';
COMMENT ON COLUMN despesas.fornecedor_cnpj_cpf IS 'CNPJ/CPF do fornecedor.';
COMMENT ON COLUMN despesas.data_emissao IS 'Data de emissão do documento.';
COMMENT ON COLUMN despesas.mes IS 'Mês de referência da despesa.';
COMMENT ON COLUMN despesas.ano IS 'Ano de referência da despesa.';
COMMENT ON COLUMN despesas.valor_documento IS 'Valor bruto do documento.';
COMMENT ON COLUMN despesas.valor_glosa IS 'Valor de glosa aplicado.';
COMMENT ON COLUMN despesas.valor_liquido IS 'Valor líquido efetivamente pago.';
COMMENT ON COLUMN despesas.id_documento IS 'Identificador do documento na base.';
COMMENT ON COLUMN despesas.url_documento IS 'URL do documento (quando disponível).';

----------------------------------
-- Criação da tabela de Eventos --
----------------------------------

CREATE TABLE eventos (
    id_evento INTEGER PRIMARY KEY,
    data_evento DATE,
    situacao_evento VARCHAR(50),
    tipo_evento VARCHAR(100),
    data_hora_inicio_evento TIMESTAMP,
    data_hora_fim_evento TIMESTAMP,
    descricao_evento TEXT,
    url_documento_pauta TEXT
);

-- Índices para performance
CREATE INDEX idx_eventos_data_evento ON eventos(data_evento);
CREATE INDEX idx_eventos_tipo_evento ON eventos(tipo_evento);
CREATE INDEX idx_eventos_situacao ON eventos(situacao_evento);
CREATE INDEX idx_eventos_data_hora_inicio ON eventos(data_hora_inicio_evento);

-- Comentários
COMMENT ON TABLE eventos IS 'Tabela de eventos e sessões da Câmara dos Deputados';
COMMENT ON COLUMN eventos.id_evento IS 'Identificador único do evento/sessão. Chave primária.';
COMMENT ON COLUMN eventos.data_evento IS 'Data do evento (derivada de data_hora_inicio_evento).';
COMMENT ON COLUMN eventos.situacao_evento IS 'Situação do evento (ex: Realizada, Cancelada).';
COMMENT ON COLUMN eventos.tipo_evento IS 'Tipo do evento (ex: Sessão Deliberativa).';
COMMENT ON COLUMN eventos.data_hora_inicio_evento IS 'Data e hora de início do evento.';
COMMENT ON COLUMN eventos.data_hora_fim_evento IS 'Data e hora de fim do evento.';
COMMENT ON COLUMN eventos.descricao_evento IS 'Descrição/resumo do evento.';
COMMENT ON COLUMN eventos.url_documento_pauta IS 'URL do documento de pauta do evento.';
--------------------------------------------
-- Criação da tabela de Presença Deputados--
--------------------------------------------

CREATE TABLE presenca_deputados (
    id_dep INTEGER NOT NULL,
    ano_presenca INTEGER,
    plenario_presencas INTEGER,
    plenario_ausencias_justificadas INTEGER,
    plenario_ausencias_nao_justificadas INTEGER,
    comissoes_presencas INTEGER,
    comissoes_ausencias_justificadas INTEGER,
    comissoes_ausencias_nao_justificadas INTEGER,
    PRIMARY KEY (id_dep, ano_presenca)
);

-- Índices para performance
CREATE INDEX idx_presenca_deputados_id_dep ON presenca_deputados(id_dep);
CREATE INDEX idx_presenca_deputados_ano ON presenca_deputados(ano_presenca);

-- Comentários
COMMENT ON TABLE presenca_deputados IS 'Registro de presença dos deputados por ano';
COMMENT ON COLUMN presenca_deputados.id_dep IS 'Identificador do deputado.';
COMMENT ON COLUMN presenca_deputados.ano_presenca IS 'Ano de referência da presença.';
COMMENT ON COLUMN presenca_deputados.plenario_presencas IS 'Quantidade de presenças no plenário.';
COMMENT ON COLUMN presenca_deputados.plenario_ausencias_justificadas IS 'Quantidade de ausências justificadas no plenário.';
COMMENT ON COLUMN presenca_deputados.plenario_ausencias_nao_justificadas IS 'Quantidade de ausências não justificadas no plenário.';
COMMENT ON COLUMN presenca_deputados.comissoes_presencas IS 'Quantidade de presenças em comissões.';
COMMENT ON COLUMN presenca_deputados.comissoes_ausencias_justificadas IS 'Quantidade de ausências justificadas em comissões.';
COMMENT ON COLUMN presenca_deputados.comissoes_ausencias_nao_justificadas IS 'Quantidade de ausências não justificadas em comissões.';
--------------------------------------------
-- Criação da tabela de Frentes Deputados --
--------------------------------------------

CREATE TABLE frentes_deputados (
    id_frente INTEGER NOT NULL,
    titulo_frente TEXT,
    id_deputado INTEGER NOT NULL,
    data_inicio DATE,
    data_fim DATE,
    
    PRIMARY KEY (id_frente, id_deputado)
);

-- Índices para performance
CREATE INDEX idx_frentes_deputados_id_frente ON frentes_deputados(id_frente);
CREATE INDEX idx_frentes_deputados_id_deputado ON frentes_deputados(id_deputado);
CREATE INDEX idx_frentes_deputados_datas ON frentes_deputados(data_inicio, data_fim);

-- Comentários
COMMENT ON TABLE frentes_deputados IS 'Relacionamento entre deputados e frentes parlamentares';
COMMENT ON COLUMN frentes_deputados.id_frente IS 'Identificador da frente parlamentar.';
COMMENT ON COLUMN frentes_deputados.titulo_frente IS 'Título/nome da frente (redundante, para leitura).';
COMMENT ON COLUMN frentes_deputados.id_deputado IS 'Identificador do deputado participante da frente.';
COMMENT ON COLUMN frentes_deputados.data_inicio IS 'Data de início da participação.';
COMMENT ON COLUMN frentes_deputados.data_fim IS 'Data de fim da participação.';

--------------------------------------
-- Criação da tabela de Proposições --
--------------------------------------

CREATE TABLE proposicoes (
    id_proposicao INTEGER PRIMARY KEY,
    sigla_tipo_proposicao VARCHAR(10),
    numero_proposicao INTEGER,
    ano_proposicao INTEGER,
    cod_tipo_proposicao INTEGER,
    descricao_tipo_proposicao TEXT,
    ementa TEXT,
    ementa_detalhada TEXT,
    keywords TEXT,
    data_apresentacao DATE,
    url_inteiro_teor TEXT,
    ultimo_status_data_hora TIMESTAMP,
    ultimo_status_descricao_tramitacao TEXT,
    ultimo_status_id_tipo_tramitacao INTEGER,
    ultimo_status_descricao_situacao TEXT,
    ultimo_status_id_situacao INTEGER,
    ultimo_status_regime TEXT,
    ultimo_status_apreciacao TEXT,
    ultimo_status_despacho TEXT
);

-- Índices para performance
CREATE INDEX idx_proposicoes_sigla_tipo ON proposicoes(sigla_tipo_proposicao);
CREATE INDEX idx_proposicoes_numero ON proposicoes(numero_proposicao);
CREATE INDEX idx_proposicoes_ano ON proposicoes(ano_proposicao);
CREATE INDEX idx_proposicoes_data_apresentacao ON proposicoes(data_apresentacao);
CREATE INDEX idx_proposicoes_ultimo_status_situacao ON proposicoes(ultimo_status_descricao_situacao);
CREATE INDEX idx_proposicoes_sigla_tipo_numero_ano ON proposicoes(sigla_tipo_proposicao, numero_proposicao, ano_proposicao);

-- Comentários
COMMENT ON TABLE proposicoes IS 'Tabela de proposições legislativas (projetos de lei, PECs, etc.)';
COMMENT ON COLUMN proposicoes.id_proposicao IS 'Identificador único da proposição. Chave primária.';
COMMENT ON COLUMN proposicoes.sigla_tipo_proposicao IS 'Sigla do tipo da proposição (ex: PL, PEC).';
COMMENT ON COLUMN proposicoes.numero_proposicao IS 'Número oficial da proposição.';
COMMENT ON COLUMN proposicoes.ano_proposicao IS 'Ano de apresentação da proposição.';
COMMENT ON COLUMN proposicoes.cod_tipo_proposicao IS 'Código numérico do tipo.';
COMMENT ON COLUMN proposicoes.descricao_tipo_proposicao IS 'Descrição do tipo de proposição.';
COMMENT ON COLUMN proposicoes.ementa IS 'Ementa da proposição.';
COMMENT ON COLUMN proposicoes.ementa_detalhada IS 'Ementa detalhada.';
COMMENT ON COLUMN proposicoes.keywords IS 'Palavras-chave associadas.';
COMMENT ON COLUMN proposicoes.data_apresentacao IS 'Data de apresentação da proposição.';
COMMENT ON COLUMN proposicoes.url_inteiro_teor IS 'URL do inteiro teor.';
COMMENT ON COLUMN proposicoes.ultimo_status_data_hora IS 'Data/hora do último status.';
COMMENT ON COLUMN proposicoes.ultimo_status_descricao_tramitacao IS 'Descrição da tramitação.';
COMMENT ON COLUMN proposicoes.ultimo_status_descricao_situacao IS 'Descrição da situação.';
COMMENT ON COLUMN proposicoes.ultimo_status_id_situacao IS 'Identificador da situação.';
COMMENT ON COLUMN proposicoes.ultimo_status_regime IS 'Regime de tramitação.';
COMMENT ON COLUMN proposicoes.ultimo_status_apreciacao IS 'Forma de apreciação.';

---------------------------------------------
-- Criação da tabela de Proposições Autores--
---------------------------------------------

CREATE TABLE proposicoes_autores (
    id_proposicao INTEGER NOT NULL,
    id_deputado INTEGER,
    cod_tipo_autor INTEGER,
    tipo_autor VARCHAR(50),
    ordem_assinatura INTEGER,
    proponente BOOLEAN
);

-- Índices para performance
CREATE INDEX idx_proposicoes_autores_id_proposicao ON proposicoes_autores(id_proposicao);
CREATE INDEX idx_proposicoes_autores_id_deputado ON proposicoes_autores(id_deputado);
CREATE INDEX idx_proposicoes_autores_tipo_autor ON proposicoes_autores(tipo_autor);

-- Comentários
COMMENT ON TABLE proposicoes_autores IS 'Relacionamento entre proposições e seus autores';
COMMENT ON COLUMN proposicoes_autores.id_proposicao IS 'Identificador da proposição.';
COMMENT ON COLUMN proposicoes_autores.id_deputado IS 'Identificador do deputado autor.';
COMMENT ON COLUMN proposicoes_autores.cod_tipo_autor IS 'Código do tipo do autor.';
COMMENT ON COLUMN proposicoes_autores.tipo_autor IS 'Tipo do autor (ex: Deputado, Comissão).';
COMMENT ON COLUMN proposicoes_autores.ordem_assinatura IS 'Ordem de assinatura do autor.';
COMMENT ON COLUMN proposicoes_autores.proponente IS 'Indica se é proponente.';

-------------------------------------------
-- Criação da tabela de Proposições Temas--
-------------------------------------------

CREATE TABLE proposicoes_temas (
    id_proposicao INTEGER NOT NULL,
    cod_tema INTEGER,
    tema TEXT,
    
    PRIMARY KEY (id_proposicao, cod_tema)
);

-- Índices para performance
CREATE INDEX idx_proposicoes_temas_cod_tema ON proposicoes_temas(cod_tema);
CREATE INDEX idx_proposicoes_temas_tema ON proposicoes_temas(tema);

-- Comentários
COMMENT ON TABLE proposicoes_temas IS 'Relacionamento entre proposições e seus temas';
COMMENT ON COLUMN proposicoes_temas.id_proposicao IS 'Identificador único da proposição.';
COMMENT ON COLUMN proposicoes_temas.cod_tema IS 'Código do tema.';
COMMENT ON COLUMN proposicoes_temas.tema IS 'Tema associado à proposição.';

-------------------------------------------------------------
-- Criação da View Materializada para Consolidação de Rankings --
-- -------------------------------------------------------------

DROP MATERIALIZED VIEW IF EXISTS mv_deputados_consolidado CASCADE;

CREATE MATERIALIZED VIEW mv_deputados_consolidado AS
WITH
pesos AS (
    SELECT
        7.0::numeric AS peso_proposicao,
        1.5::numeric AS peso_plenario,
        1.0::numeric AS peso_comissoes
),
gastos AS (
    SELECT
        d.id_deputado,
        SUM(COALESCE(d.valor_liquido,0)) AS total_gasto
    FROM despesas d
    GROUP BY d.id_deputado
),
autoria AS (
    SELECT
        id_proposicao,
        COUNT(*) AS qtd_autores
    FROM proposicoes_autores
    GROUP BY id_proposicao
),
proposicoes_por_categoria AS (
    SELECT
        pa.id_deputado,
        (
            CASE
                WHEN p.sigla_tipo_proposicao IN ('PEC', 'PLP', 'PL', 'MPV', 'PLV') THEN 'Legislativo estrutural'
                WHEN p.sigla_tipo_proposicao IN (
                    'PDL', 'PRC', 'PLN', 'EMC', 'EMP', 'EMR', 'EMS', 'EMA',
                    'EML', 'EMO', 'ESB', 'SBE', 'SBE-A', 'SBT', 'SBT-A',
                    'SBR', 'SSP', 'ERD'
                ) THEN 'Legislativo complementar'
                WHEN p.sigla_tipo_proposicao IN ('PFC', 'RIC', 'RCP', 'SIT') THEN 'Fiscalização e controle'
                WHEN p.sigla_tipo_proposicao = 'INC' THEN 'Indução administrativa'
                WHEN p.sigla_tipo_proposicao IN (
                    'REQ', 'REC', 'RPD', 'RPDR', 'DTQ', 'PPP', 'PIN', 'PRR', 'RRC'
                ) THEN 'Procedimental'
                ELSE 'Outros'
            END
        ) AS categoria,
        COUNT(DISTINCT pa.id_proposicao) AS total_proposicoes_cat,
        COUNT(DISTINCT CASE WHEN p.ultimo_status_id_situacao = 1140 THEN pa.id_proposicao END) AS aprovadas_cat,
        COUNT(DISTINCT CASE WHEN p.ultimo_status_id_situacao IN (900, 926, 1150, 1293, 939) THEN pa.id_proposicao END) AS avancadas_cat,
        SUM(
            (
                CASE
                    WHEN p.sigla_tipo_proposicao = 'PEC' THEN 30.0
                    WHEN p.sigla_tipo_proposicao = 'PLP' THEN 25.0
                    WHEN p.sigla_tipo_proposicao IN ('MPV', 'PLV', 'RCP') THEN 20.0
                    WHEN p.sigla_tipo_proposicao = 'PL' THEN 15.0
                    WHEN p.sigla_tipo_proposicao IN ('PDL', 'PFC', 'PLN') THEN 10.0
                    WHEN p.sigla_tipo_proposicao = 'PRC' THEN 8.0
                    WHEN p.sigla_tipo_proposicao = 'SIT' THEN 5.0
                    WHEN p.sigla_tipo_proposicao = 'RIC' THEN 2.0
                    WHEN p.sigla_tipo_proposicao = 'INC' THEN 0.5
                    WHEN p.sigla_tipo_proposicao IN ('EMC', 'EMP', 'EMR', 'EMS', 'EMA', 'EML', 'EMO', 'ESB', 'SBE', 'SBE-A', 'SBT', 'SBT-A', 'SBR', 'SSP', 'ERD') THEN 3.0
                    WHEN p.sigla_tipo_proposicao IN ('REQ', 'REC', 'RPD', 'RPDR', 'DTQ', 'PPP', 'PIN', 'PRR', 'RRC') THEN 0.2
                    ELSE 0.1
                END
            )
            *
            (
                CASE
                    WHEN p.ultimo_status_id_situacao IN (1140) THEN 1.0
                    WHEN p.ultimo_status_id_situacao IN (900, 926, 1150, 1293, 939) THEN 0.8
                    WHEN p.ultimo_status_id_situacao IN (923, 941, 950, 1120, 1222, 1292) THEN 0.1
                    ELSE 0.3
                END
            )
            *
            (
                CASE
                    WHEN a.qtd_autores = 1 THEN 1.0
                    WHEN pa.ordem_assinatura = 1 THEN 0.5
                    ELSE 0.5 / NULLIF(a.qtd_autores - 1, 0)
                END
            )
        ) AS score_categoria
    FROM proposicoes_autores pa
    JOIN proposicoes p ON p.id_proposicao = pa.id_proposicao
    JOIN autoria a ON a.id_proposicao = pa.id_proposicao
    GROUP BY pa.id_deputado, categoria
),
proposicoes_score AS (
    SELECT
        id_deputado,
        SUM(total_proposicoes_cat) AS total_proposicoes,
        SUM(aprovadas_cat) AS proposicoes_aprovadas,
        SUM(avancadas_cat) AS proposicoes_avancadas,
        SUM(score_categoria ^ 0.75) AS score_proposicoes
    FROM proposicoes_por_categoria
    GROUP BY id_deputado
),
presencas AS (
    SELECT
        p.id_dep AS id_deputado,
        SUM(plenario_presencas) AS plenario_presencas,
        SUM(plenario_ausencias_justificadas) AS plenario_ausencias_justificadas,
        SUM(plenario_ausencias_nao_justificadas) AS plenario_ausencias_nao_justificadas,
        SUM(comissoes_presencas) AS comissoes_presencas,
        SUM(comissoes_ausencias_justificadas) AS comissoes_ausencias_justificadas,
        SUM(comissoes_ausencias_nao_justificadas) AS comissoes_ausencias_nao_justificadas
    FROM presenca_deputados p
    GROUP BY p.id_dep
),
presencas_score AS (
    SELECT
        id_deputado,
        GREATEST(
            0,
            (plenario_presencas - (3 * plenario_ausencias_nao_justificadas)) * 
            (plenario_presencas::numeric / NULLIF((plenario_presencas + plenario_ausencias_justificadas + plenario_ausencias_nao_justificadas), 0))
        ) AS score_plenario,
        GREATEST(
            0,
            (comissoes_presencas - (3 * comissoes_ausencias_nao_justificadas)) * 
            (comissoes_presencas::numeric / NULLIF((comissoes_presencas + comissoes_ausencias_justificadas + comissoes_ausencias_nao_justificadas), 0))
        ) AS score_comissoes
    FROM presencas
),
tipos_sucesso AS (
    SELECT
        pa.id_deputado,
        p.sigla_tipo_proposicao,
        CASE WHEN p.ultimo_status_id_situacao = 1140 THEN 'aprovada' ELSE 'avancada' END as status_sucesso,
        COUNT(DISTINCT p.id_proposicao) as qtd
    FROM proposicoes_autores pa
    JOIN proposicoes p ON p.id_proposicao = pa.id_proposicao
    WHERE p.ultimo_status_id_situacao IN (1140, 900, 926, 1150, 1293, 939)
    GROUP BY pa.id_deputado, p.sigla_tipo_proposicao, status_sucesso
),
tipos_agg AS (
    SELECT
        id_deputado,
        json_agg(json_build_object('tipo', sigla_tipo_proposicao, 'qtd', qtd)) FILTER (WHERE status_sucesso = 'aprovada') AS tipos_aprovadas,
        json_agg(json_build_object('tipo', sigla_tipo_proposicao, 'qtd', qtd)) FILTER (WHERE status_sucesso = 'avancada') AS tipos_avancadas
    FROM tipos_sucesso
    GROUP BY id_deputado
),
beneficios AS (
    SELECT
        d.id_deputado,
        d.ultimo_status_nome_eleitoral AS deputado,
        d.ultimo_status_sigla_partido AS partido,
        d.ultimo_status_sigla_uf AS uf,
        COALESCE(g.total_gasto, 0) AS total_gasto,
        COALESCE(psc.total_proposicoes, 0) AS total_proposicoes,
        COALESCE(psc.proposicoes_aprovadas, 0) AS proposicoes_aprovadas,
        COALESCE(psc.proposicoes_avancadas, 0) AS proposicoes_avancadas,
        COALESCE(ta.tipos_aprovadas, '[]'::json) AS tipos_aprovadas_lista,
        COALESCE(ta.tipos_avancadas, '[]'::json) AS tipos_avancadas_lista,
        COALESCE(psc.score_proposicoes, 0) AS score_proposicoes,
        COALESCE(pr.score_plenario, 0) AS score_plenario,
        COALESCE(pr.score_comissoes, 0) AS score_comissoes,
        (
            (ps.peso_proposicao * COALESCE(psc.score_proposicoes, 0)) +
            (ps.peso_plenario * COALESCE(pr.score_plenario, 0)) +
            (ps.peso_comissoes * COALESCE(pr.score_comissoes, 0))
        ) AS beneficio_score
    FROM deputados d
    LEFT JOIN gastos g ON g.id_deputado = d.id_deputado
    LEFT JOIN proposicoes_score psc ON psc.id_deputado = d.id_deputado
    LEFT JOIN presencas_score pr ON pr.id_deputado = d.id_deputado
    LEFT JOIN tipos_agg ta ON ta.id_deputado = d.id_deputado
    CROSS JOIN pesos ps
),
p25 AS (
    SELECT
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY beneficio_score) AS p25_beneficio
    FROM beneficios
),
pre_consolidado AS (
    SELECT
        b.id_deputado,
        b.deputado,
        b.partido,
        b.uf,
        b.total_gasto,
        b.total_proposicoes,
        b.proposicoes_aprovadas,
        b.proposicoes_avancadas,
        b.tipos_aprovadas_lista,
        b.tipos_avancadas_lista,
        b.score_proposicoes,
        b.score_plenario,
        b.score_comissoes,
        b.beneficio_score,
        (b.beneficio_score / (b.beneficio_score + p.p25_beneficio))::numeric AS fator_atividade,
        (b.beneficio_score * (b.beneficio_score / (b.beneficio_score + p.p25_beneficio)) / ((1 + (b.total_gasto / 1000.0)) ^ 0.75))::numeric AS indice_eficiencia,
        COALESCE(pr.plenario_presencas, 0) AS plenario_presencas,
        COALESCE(pr.plenario_ausencias_justificadas, 0) AS plenario_ausencias_justificadas,
        COALESCE(pr.plenario_ausencias_nao_justificadas, 0) AS plenario_ausencias_nao_justificadas,
        COALESCE(pr.comissoes_presencas, 0) AS comissoes_presencas,
        COALESCE(pr.comissoes_ausencias_justificadas, 0) AS comissoes_ausencias_justificadas,
        COALESCE(pr.comissoes_ausencias_nao_justificadas, 0) AS comissoes_ausencias_nao_justificadas
    FROM beneficios b
    CROSS JOIN p25 p
    LEFT JOIN presencas pr ON pr.id_deputado = b.id_deputado
)
SELECT
    *,
    ROW_NUMBER() OVER (ORDER BY indice_eficiencia DESC)::integer AS posicao_ranking,
    ROW_NUMBER() OVER (ORDER BY total_gasto DESC)::integer AS posicao_ranking_gastos,
    COUNT(*) OVER ()::integer AS total_deputados
FROM pre_consolidado;

-- Criação do índice único para busca instantânea e permitir REFRESH CONCURRENTLY se desejado
CREATE UNIQUE INDEX idx_mv_deputados_consolidado_id ON mv_deputados_consolidado(id_deputado);