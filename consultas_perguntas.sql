-- Consultas para responder perguntas: 1,2,3,4,5,10,12,13
-- Ajuste filtros opcionais (ex.: :ano, :uf, :partido, :deputado_id, :tema)

-- 1) Deputados ordenados por gastos
SELECT
    d.id_deputado,
    d.ultimo_status_nome_eleitoral AS deputado,
    d.ultimo_status_sigla_partido AS partido,
    d.ultimo_status_sigla_uf AS uf,
    SUM(COALESCE(des.valor_liquido, 0)) AS total_gasto
FROM despesas des
JOIN deputados d ON d.id_deputado = des.id_cadastro_deputado
-- WHERE des.ano = :ano
GROUP BY d.id_deputado, d.ultimo_status_nome_eleitoral, d.ultimo_status_sigla_partido, d.ultimo_status_sigla_uf
ORDER BY total_gasto DESC;

-- 2) Agrupar deputados por eixo de atuação (Nuvem de Palavras)
-- 2a) Usando temas (proposicoes_temas)
SELECT
    d.id_deputado,
    d.ultimo_status_nome_eleitoral AS deputado,
    pt.tema,
    COUNT(*) AS total_proposicoes
FROM proposicoes_autores pa
JOIN proposicoes_temas pt ON pt.id_proposicao = pa.id_proposicao
LEFT JOIN deputados d ON d.id_deputado = pa.id_deputado
GROUP BY d.id_deputado, d.ultimo_status_nome_eleitoral, pt.tema
ORDER BY total_proposicoes DESC;

-- 2b) Usando palavras-chave/ementa (para base de texto)
SELECT
    d.id_deputado,
    d.ultimo_status_nome_eleitoral AS deputado,
    p.keywords,
    p.ementa
FROM proposicoes_autores pa
JOIN proposicoes p ON p.id_proposicao = pa.id_proposicao
LEFT JOIN deputados d ON d.id_deputado = pa.id_deputado
WHERE p.keywords IS NOT NULL OR p.ementa IS NOT NULL;

-- 3) Como um deputado votou em um tema/eixo específico
-- Filtre por tema (proposicoes_temas.tema) ou por texto na ementa.
SELECT
    d.id_deputado,
    d.ultimo_status_nome_eleitoral AS deputado,
    v.id_votacao,
    v.data_votacao,
    v.descricao_votacao,
    vv.voto,
    p.id_proposicao,
    p.sigla_tipo_proposicao,
    p.numero_proposicao,
    p.ano_proposicao,
    pt.tema
FROM votacoes_votos vv
JOIN deputados d ON d.id_deputado = vv.id_deputado
JOIN votacao v ON v.id_votacao = vv.id_votacao
LEFT JOIN proposicoes p ON p.id_proposicao = v.id_proposicao
LEFT JOIN proposicoes_temas pt ON pt.id_proposicao = p.id_proposicao
WHERE d.id_deputado = :deputado_id
  AND (
        pt.tema ILIKE '%' || :tema || '%'
        OR p.ementa ILIKE '%' || :tema || '%'
      )
ORDER BY v.data_votacao DESC;

-- 4) Agrupar deputados por escolaridade
SELECT
    COALESCE(d.escolaridade_deputado, 'Sem informação') AS escolaridade,
    COUNT(*) AS total_deputados
FROM deputados d
GROUP BY COALESCE(d.escolaridade_deputado, 'Sem informação')
ORDER BY total_deputados DESC;

-- 5) Ordenar fornecedores (despesas) por valores de contrato
SELECT
    des.fornecedor_nome,
    des.fornecedor_cnpj_cpf,
    SUM(COALESCE(des.valor_liquido, 0)) AS total_contrato
FROM despesas des
-- WHERE des.ano = :ano
GROUP BY des.fornecedor_nome, des.fornecedor_cnpj_cpf
ORDER BY total_contrato DESC;

-- 6) Correlacionar escolaridade com:
-- 6a) Gastos
SELECT
    COALESCE(d.escolaridade_deputado, 'Sem informação') AS escolaridade,
    SUM(COALESCE(des.valor_liquido, 0)) AS total_gasto,
    AVG(COALESCE(des.valor_liquido, 0)) AS gasto_medio
FROM despesas des
JOIN deputados d ON d.id_deputado = des.id_cadastro_deputado
-- WHERE des.ano = :ano
GROUP BY COALESCE(d.escolaridade_deputado, 'Sem informação')
ORDER BY total_gasto DESC;

-- 6b) Fidelidade partidária (alinhamento com orientação)
SELECT
    COALESCE(d.escolaridade_deputado, 'Sem informação') AS escolaridade,
    COUNT(*) FILTER (WHERE vo.orientacao IN ('Sim', 'Não') AND vv.voto IN ('Sim', 'Não')) AS total_considerado,
    COUNT(*) FILTER (WHERE vo.orientacao = vv.voto AND vo.orientacao IN ('Sim', 'Não')) AS total_alinhado,
    ROUND(
        CASE
            WHEN COUNT(*) FILTER (WHERE vo.orientacao IN ('Sim', 'Não') AND vv.voto IN ('Sim', 'Não')) = 0 THEN 0
            ELSE 100.0 * COUNT(*) FILTER (WHERE vo.orientacao = vv.voto AND vo.orientacao IN ('Sim', 'Não'))
                 / COUNT(*) FILTER (WHERE vo.orientacao IN ('Sim', 'Não') AND vv.voto IN ('Sim', 'Não'))
        END,
        2
    ) AS perc_alinhamento
FROM votacoes_orientacoes vo
JOIN votacoes_votos vv ON vv.id_votacao = vo.id_votacao AND vv.deputado_sigla_partido = vo.sigla_bancada
JOIN deputados d ON d.id_deputado = vv.id_deputado
GROUP BY COALESCE(d.escolaridade_deputado, 'Sem informação')
ORDER BY perc_alinhamento DESC;

-- 6c) Nº de proposições (autoria)
SELECT
    COALESCE(d.escolaridade_deputado, 'Sem informação') AS escolaridade,
    COUNT(DISTINCT pa.id_proposicao) AS total_proposicoes
FROM proposicoes_autores pa
LEFT JOIN deputados d ON d.id_deputado = pa.id_deputado
GROUP BY COALESCE(d.escolaridade_deputado, 'Sem informação')
ORDER BY total_proposicoes DESC;

-- 6d) Presença em comissões (tabela presenca_deputados anual por deputado)
SELECT
    COALESCE(d.escolaridade_deputado, 'Sem informação') AS escolaridade,
    SUM(COALESCE(p.comissoes_presencas, 0)) AS total_presencas_comissoes,
    AVG(COALESCE(p.comissoes_presencas, 0)) AS media_presencas_comissoes
FROM presenca_deputados p
JOIN deputados d ON d.id_deputado = p.id_dep
-- WHERE p.ano_presenca = :ano
GROUP BY COALESCE(d.escolaridade_deputado, 'Sem informação')
ORDER BY total_presencas_comissoes DESC;

-- 6e) Presença no plenário (tabela presenca_deputados anual por deputado)
SELECT
    COALESCE(d.escolaridade_deputado, 'Sem informação') AS escolaridade,
    SUM(COALESCE(p.plenario_presencas, 0)) AS total_presencas_plenario,
    AVG(COALESCE(p.plenario_presencas, 0)) AS media_presencas_plenario
FROM presenca_deputados p
JOIN deputados d ON d.id_deputado = p.id_dep
-- WHERE p.ano_presenca = :ano
GROUP BY COALESCE(d.escolaridade_deputado, 'Sem informação')
ORDER BY total_presencas_plenario DESC;

-- 7) Custo x Benefício do deputado (com score de proposições)
-- Foco: diferenciar proposições aprovadas e não aprovadas.
-- Fórmula sugerida:
-- benefício = (peso_proposicao * score_proposicoes)
--           + (peso_plenario * total_presencas_plenario)
--           + (peso_comissoes * total_presencas_comissoes)
-- custo_beneficio = total_gasto / GREATEST(benefício, 1)
--
-- Observações (limitações dos dados atuais):
-- 1) O status final vem de proposicoes.ultimo_status_id_situacao.
--    Usamos faixas (aprovada / aprov. na Câmara / avanço / fracasso) baseadas em códigos
--    conhecidos em `situacoes_proposicao.json`. Se aparecerem novos códigos, ajuste o CASE.
-- 2) Não temos histórico de tramitação completo por proposição; apenas o último status e
--    o último tipo de tramitação. O bônus de tramitacao=240 indica aprovação em algum estágio,
--    mas não garante aprovação final.
-- 3) Não temos vínculo explícito de proposições apensadas com a principal, então não é possível
--    aplicar o “crédito parcial por apensação” sem outra tabela.
-- 4) Peso por tipo foi aplicado via `cod_tipo_proposicao` (ver CASE em `proposicoes_score`).
--    Tipos não mapeados recebem peso padrão 0.5. Revise os códigos no seu dataset.
WITH
pesos AS (
    SELECT
    3.0::numeric AS peso_proposicao,
        1.0::numeric AS peso_plenario,
        1.0::numeric AS peso_comissoes
),
gastos AS (
    SELECT
        des.id_cadastro_deputado AS id_deputado,
        SUM(COALESCE(des.valor_liquido, 0)) AS total_gasto
    FROM despesas des
    -- WHERE des.ano = :ano
    GROUP BY des.id_cadastro_deputado
),
proposicoes_score AS (
    SELECT
        pa.id_deputado,
        COUNT(DISTINCT pa.id_proposicao) AS total_proposicoes,
        SUM(
            CASE
                -- Grupo A — Produção Legislativa Estrutural
                WHEN p.cod_tipo_proposicao = 123 THEN 10.0 -- PEC: Proposta de Emenda Constitucional
                WHEN p.cod_tipo_proposicao = 136 THEN 8.0  -- PLP: Projeto de Lei Complementar
                WHEN p.cod_tipo_proposicao = 139 THEN 6.0  -- PL: Projeto de Lei
                WHEN p.cod_tipo_proposicao = 291 THEN 6.0  -- MPV: Medida Provisória
                WHEN p.cod_tipo_proposicao = 341 THEN 5.0  -- PDC: Projeto de Decreto Legislativo
                WHEN p.cod_tipo_proposicao = 347 THEN 5.0  -- PRC: Projeto de Resolução
                WHEN p.cod_tipo_proposicao = 348 THEN 5.0  -- PRN: Projeto de Resolução (CN)
                -- Grupo B — Fiscalização e Controle
                WHEN p.cod_tipo_proposicao = 182 THEN 4.0  -- PFC: Proposta de Fiscalização e Controle
                WHEN p.cod_tipo_proposicao = 294 THEN 4.0  -- RCP: Requerimento de CPI
                WHEN p.cod_tipo_proposicao = 292 THEN 3.0  -- RIC: Requerimento de Informação
                -- (SIT) não mapeado aqui: confirme o código exato no seu dataset
                -- Grupo C — Atuação Processual
                WHEN p.cod_tipo_proposicao = 322 THEN 2.0  -- REC: Recurso
                WHEN p.cod_tipo_proposicao = 285 THEN 2.0  -- EMC: Emenda de Comissão
                WHEN p.cod_tipo_proposicao = 280 THEN 2.0  -- EMP: Emenda de Plenário
                WHEN p.cod_tipo_proposicao = 288 THEN 2.0  -- EMS: Emenda/Substitutivo
                WHEN p.cod_tipo_proposicao = 340 THEN 3.0  -- SBT: Substitutivo
                -- Grupo D — Requerimentos (peso base; urgência pode ser tratada via status/ementa)
                WHEN p.cod_tipo_proposicao IN (296, 392) THEN 0.5 -- REQ: Requerimento / Requerimento de Urgência (Art. 155)
                -- Grupo E — Baixíssimo impacto
                WHEN p.cod_tipo_proposicao = 171 THEN 0.5  -- IND: Indicação
                WHEN p.cod_tipo_proposicao = 134 THEN 0.0  -- MSC: Mensagem
                WHEN p.cod_tipo_proposicao = 610 THEN 0.0  -- OF/DOC: Documento/Ofício (confira a descrição na sua base)
                WHEN p.cod_tipo_proposicao = 276 THEN 0.2  -- PET: Petição
                WHEN p.cod_tipo_proposicao = 227 THEN 0.2  -- CON: Consulta
                -- Padrão para tipos não mapeados
                ELSE 0.5
            END
            *
            CASE
                -- Aprovação plena
                WHEN p.ultimo_status_id_situacao IN (1140, 1150) THEN 1.0
                -- Aprovação na Câmara (tramitando no Senado)
                WHEN p.ultimo_status_id_situacao IN (926, 1303) THEN 0.8
                -- Avanço relevante (pronta para pauta)
                WHEN p.ultimo_status_id_situacao IN (924) THEN 0.5
                -- Fracasso
                WHEN p.ultimo_status_id_situacao IN (923, 930, 931, 1120, 941, 950) THEN 0.0
                -- Demais situações: peso neutro baixo
                ELSE 0.2
            END
            + CASE
                -- Bônus por aprovação em algum estágio
                WHEN p.ultimo_status_id_tipo_tramitacao = 240 THEN 0.1
                ELSE 0.0
              END
        ) AS score_proposicoes
    FROM proposicoes_autores pa
    JOIN proposicoes p ON p.id_proposicao = pa.id_proposicao
    GROUP BY pa.id_deputado
),
presencas AS (
    SELECT
        p.id_dep AS id_deputado,
        SUM(COALESCE(p.plenario_presencas, 0)) AS total_presencas_plenario,
        SUM(COALESCE(p.comissoes_presencas, 0)) AS total_presencas_comissoes
    FROM presenca_deputados p
    -- WHERE p.ano_presenca = :ano
    GROUP BY p.id_dep
)
SELECT
    d.id_deputado,
    d.ultimo_status_nome_eleitoral AS deputado,
    d.ultimo_status_sigla_partido AS partido,
    d.ultimo_status_sigla_uf AS uf,
    COALESCE(g.total_gasto, 0) AS total_gasto,
    COALESCE(psc.total_proposicoes, 0) AS total_proposicoes,
    COALESCE(psc.score_proposicoes, 0) AS score_proposicoes,
    COALESCE(pe.total_presencas_plenario, 0) AS total_presencas_plenario,
    COALESCE(pe.total_presencas_comissoes, 0) AS total_presencas_comissoes,
    (
        (ps.peso_proposicao * COALESCE(psc.score_proposicoes, 0))
        + (ps.peso_plenario * COALESCE(pe.total_presencas_plenario, 0))
        + (ps.peso_comissoes * COALESCE(pe.total_presencas_comissoes, 0))
    ) AS beneficio_score,
    ROUND(
        COALESCE(g.total_gasto, 0)
        / GREATEST(
            (
                (ps.peso_proposicao * COALESCE(psc.score_proposicoes, 0))
                + (ps.peso_plenario * COALESCE(pe.total_presencas_plenario, 0))
                + (ps.peso_comissoes * COALESCE(pe.total_presencas_comissoes, 0))
            ),
            1
        ),
        2
    ) AS custo_beneficio
FROM deputados d
LEFT JOIN gastos g ON g.id_deputado = d.id_deputado
LEFT JOIN proposicoes_score psc ON psc.id_deputado = d.id_deputado
LEFT JOIN presencas pe ON pe.id_deputado = d.id_deputado
CROSS JOIN pesos ps
ORDER BY custo_beneficio ASC;

-- 10) Ordenar partidos conforme alinhamento interno
-- Alinhamento = % de votos iguais à orientação do partido (quando orientação é Sim/Não)
SELECT
    vo.sigla_bancada AS partido,
    COUNT(*) FILTER (WHERE vo.orientacao IN ('Sim', 'Não') AND vv.voto IN ('Sim', 'Não')) AS total_considerado,
    COUNT(*) FILTER (WHERE vo.orientacao = vv.voto AND vo.orientacao IN ('Sim', 'Não')) AS total_alinhado,
    ROUND(
        CASE
            WHEN COUNT(*) FILTER (WHERE vo.orientacao IN ('Sim', 'Não') AND vv.voto IN ('Sim', 'Não')) = 0 THEN 0
            ELSE 100.0 * COUNT(*) FILTER (WHERE vo.orientacao = vv.voto AND vo.orientacao IN ('Sim', 'Não'))
                 / COUNT(*) FILTER (WHERE vo.orientacao IN ('Sim', 'Não') AND vv.voto IN ('Sim', 'Não'))
        END,
        2
    ) AS perc_alinhamento
FROM votacoes_orientacoes vo
JOIN votacoes_votos vv
  ON vv.id_votacao = vo.id_votacao
 AND vv.deputado_sigla_partido = vo.sigla_bancada
GROUP BY vo.sigla_bancada
ORDER BY perc_alinhamento DESC;

-- 12) Correlacionar deputado com fornecedor
SELECT
    d.id_deputado,
    d.ultimo_status_nome_eleitoral AS deputado,
    des.fornecedor_nome,
    SUM(COALESCE(des.valor_liquido, 0)) AS total_gasto
FROM despesas des
JOIN deputados d ON d.id_deputado = des.id_cadastro_deputado
-- WHERE d.id_deputado = :deputado_id
GROUP BY d.id_deputado, d.ultimo_status_nome_eleitoral, des.fornecedor_nome
ORDER BY total_gasto DESC;

-- 13) Com o que o deputado mais gasta?
SELECT
    d.id_deputado,
    d.ultimo_status_nome_eleitoral AS deputado,
    des.desc_subcota AS tipo_gasto,
    SUM(COALESCE(des.valor_liquido, 0)) AS total_gasto
FROM despesas des
JOIN deputados d ON d.id_deputado = des.id_cadastro_deputado
-- WHERE d.id_deputado = :deputado_id
GROUP BY d.id_deputado, d.ultimo_status_nome_eleitoral, des.desc_subcota
ORDER BY total_gasto DESC;
