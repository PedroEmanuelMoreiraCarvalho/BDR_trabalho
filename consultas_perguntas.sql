-- Consultas para responder perguntas: 1,2,3,4,5,6,7,10,12,13
-- Ajuste filtros opcionais (ex.: :ano, :uf, :partido, :deputado_id, :tema)

-- 1) Deputados ordenados por gastos
SELECT
    d.id_deputado,
    d.ultimo_status_nome_eleitoral AS deputado,
    d.ultimo_status_sigla_partido AS partido,
    d.ultimo_status_sigla_uf AS uf,
    SUM(COALESCE(des.valor_liquido, 0)) AS total_gasto
FROM despesas des
JOIN deputados d ON d.id_deputado = des.id_deputado
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
    SUM(COALESCE(des.valor_liquido, 0)) / NULLIF(COUNT(DISTINCT d.id_deputado), 0) AS gasto_medio
FROM despesas des
JOIN deputados d ON d.id_deputado = des.id_deputado
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
            WHEN p.sigla_tipo_proposicao IN ('PEC', 'PLP', 'PL', 'MPV', 'PLV')
                THEN 'Legislativo estrutural'

            WHEN p.sigla_tipo_proposicao IN (
                'PDL', 'PRC', 'PLN', 'EMC', 'EMP', 'EMR', 'EMS', 'EMA',
                'EML', 'EMO', 'ESB', 'SBE', 'SBE-A', 'SBT', 'SBT-A',
                'SBR', 'SSP', 'ERD'
            )
                THEN 'Legislativo complementar'

            WHEN p.sigla_tipo_proposicao IN ('PFC', 'RIC', 'RCP', 'SIT')
                THEN 'Fiscalização e controle'

            WHEN p.sigla_tipo_proposicao = 'INC'
                THEN 'Indução administrativa'

            WHEN p.sigla_tipo_proposicao IN (
                'REQ', 'REC', 'RPD', 'RPDR', 'DTQ', 'PPP', 'PIN', 'PRR', 'RRC'
            )
                THEN 'Procedimental'

            ELSE 'Outros'
        END
    ) AS categoria,

    COUNT(DISTINCT pa.id_proposicao) AS total_proposicoes_cat,

    SUM(

        /* ==========================
           PESO DO TIPO
           ========================== */

        (
            CASE

                /* Muito relevantes / PEC/PLP/MPV/PLV/RCP/PL/PDL/PFC/PLN/PRC */
                WHEN p.sigla_tipo_proposicao = 'PEC'
                    THEN 30.0

                WHEN p.sigla_tipo_proposicao = 'PLP'
                    THEN 25.0

                WHEN p.sigla_tipo_proposicao IN ('MPV', 'PLV', 'RCP')
                    THEN 20.0

                WHEN p.sigla_tipo_proposicao = 'PL'
                    THEN 15.0

                WHEN p.sigla_tipo_proposicao IN ('PDL', 'PFC', 'PLN')
                    THEN 10.0

                WHEN p.sigla_tipo_proposicao = 'PRC'
                    THEN 8.0

                WHEN p.sigla_tipo_proposicao = 'SIT'
                    THEN 5.0

                WHEN p.sigla_tipo_proposicao = 'RIC'
                    THEN 2.0

                WHEN p.sigla_tipo_proposicao = 'INC'
                    THEN 0.5

                /* Emendas */
                WHEN p.sigla_tipo_proposicao IN (
                    'EMC',
                    'EMP',
                    'EMR',
                    'EMS',
                    'EMA',
                    'EML',
                    'EMO',
                    'ESB',
                    'SBE',
                    'SBE-A',
                    'SBT',
                    'SBT-A',
                    'SBR',
                    'SSP',
                    'ERD'
                )
                    THEN 3.0

                /* Processuais */
                WHEN p.sigla_tipo_proposicao IN (
                    'REQ',
                    'REC',
                    'RPD',
                    'RPDR',
                    'DTQ',
                    'PPP',
                    'PIN',
                    'PRR',
                    'RRC'
                )
                    THEN 0.2

                /* Restante */
                ELSE 0.1

            END
        )

        *

        /* ==========================
           SITUAÇÃO
           ========================== */

        (
            CASE

                /* APROVADA */
                WHEN p.ultimo_status_id_situacao IN (
                    1140
                )
                    THEN 1.0

                /* AVANÇADA */
                WHEN p.ultimo_status_id_situacao IN (
                    900,
                    926,
                    1150,
                    1293,
                    939
                )
                    THEN 0.8

                /* REJEITADA */
                WHEN p.ultimo_status_id_situacao IN (
                    923,
                    941,
                    950,
                    1120,
                    1222,
                    1292
                )
                    THEN 0.1

                /* EM TRAMITAÇÃO */
                ELSE 0.3

            END
        )

        *

        /* ==========================
           AUTORIA
           ========================== */

        (
            CASE

                /* Autor único */
                WHEN a.qtd_autores = 1
                    THEN 1.0

                /* Autor principal */
                WHEN pa.ordem_assinatura = 1
                    THEN 0.5

                /* Coautores dividem os 50% restantes */
                ELSE
                    0.5 / NULLIF(a.qtd_autores - 1,0)

            END
        )

    ) AS score_categoria

FROM proposicoes_autores pa

JOIN proposicoes p
    ON p.id_proposicao = pa.id_proposicao

JOIN autoria a
    ON a.id_proposicao = pa.id_proposicao

GROUP BY pa.id_deputado, categoria

),

proposicoes_score AS (

SELECT
    id_deputado,
    SUM(total_proposicoes_cat) AS total_proposicoes,
    SUM(score_categoria ^ 0.75) AS score_proposicoes
FROM proposicoes_por_categoria
GROUP BY id_deputado

),

presencas AS (

SELECT

    p.id_dep AS id_deputado,

    SUM(plenario_presencas)
        AS plenario_presencas,

    SUM(plenario_ausencias_justificadas)
        AS plenario_ausencias_justificadas,

    SUM(plenario_ausencias_nao_justificadas)
        AS plenario_ausencias_nao_justificadas,

    SUM(comissoes_presencas)
        AS comissoes_presencas,

    SUM(comissoes_ausencias_justificadas)
        AS comissoes_ausencias_justificadas,

    SUM(comissoes_ausencias_nao_justificadas)
        AS comissoes_ausencias_nao_justificadas

FROM presenca_deputados p

GROUP BY p.id_dep

),

presencas_score AS (

SELECT
    id_deputado,
    GREATEST(
        0,
        (
            plenario_presencas
            -
            (
                3 *
                plenario_ausencias_nao_justificadas
            )
        )
        *
        (
            plenario_presencas::numeric
            /
            NULLIF(
                (
                    plenario_presencas
                    +
                    plenario_ausencias_justificadas
                    +
                    plenario_ausencias_nao_justificadas
                ),
                0
            )
        )
    ) AS score_plenario,

    GREATEST(
        0,
        (
            comissoes_presencas
            -
            (
                3 *
                comissoes_ausencias_nao_justificadas
            )
        )
        *
        (
            comissoes_presencas::numeric
            /
            NULLIF(
                (
                    comissoes_presencas
                    +
                    comissoes_ausencias_justificadas
                    +
                    comissoes_ausencias_nao_justificadas
                ),
                0
            )
        )
    ) AS score_comissoes
FROM presencas
),

beneficios AS (
SELECT
    d.id_deputado,
    d.ultimo_status_nome_eleitoral AS deputado,
    d.ultimo_status_sigla_partido AS partido,
    d.ultimo_status_sigla_uf AS uf,

    COALESCE(g.total_gasto,0) AS total_gasto,

    COALESCE(psc.total_proposicoes,0)
        AS total_proposicoes,

    COALESCE(psc.score_proposicoes,0)
        AS score_proposicoes,

    COALESCE(pr.score_plenario,0)
        AS score_plenario,

    COALESCE(pr.score_comissoes,0)
        AS score_comissoes,
    (
        (
            ps.peso_proposicao
            *
            COALESCE(psc.score_proposicoes,0)
        )
        +
        (
            ps.peso_plenario
            *
            COALESCE(pr.score_plenario,0)
        )
        +
        (
            ps.peso_comissoes
            *
            COALESCE(pr.score_comissoes,0)
        )
    ) AS beneficio_score

FROM deputados d
LEFT JOIN gastos g
    ON g.id_deputado = d.id_deputado
LEFT JOIN proposicoes_score psc
    ON psc.id_deputado = d.id_deputado
LEFT JOIN presencas_score pr
    ON pr.id_deputado = d.id_deputado
CROSS JOIN pesos ps
),

p25 AS (
SELECT
    PERCENTILE_CONT(0.25)
    WITHIN GROUP (
        ORDER BY beneficio_score
    ) AS p25_beneficio
FROM beneficios
)

SELECT
b.id_deputado,
b.deputado,
b.partido,
b.uf,

ROUND(b.total_gasto,2)
    AS total_gasto,
b.total_proposicoes,

ROUND(b.score_proposicoes,2)
    AS score_proposicoes,

ROUND(b.score_plenario,2)
    AS score_plenario,

ROUND(b.score_comissoes,2)
    AS score_comissoes,

ROUND(b.beneficio_score,2)
    AS beneficio_score,

ROUND(
    (
        b.beneficio_score
        /
        (
            b.beneficio_score
            +
            p.p25_beneficio
        )
    )::numeric,
    4
) AS fator_atividade,

ROUND(
    (
        b.beneficio_score
        *
        (
            b.beneficio_score
            /
            (
                b.beneficio_score
                +
                p.p25_beneficio
            )
        )
        /
        (
            (
                1
                +
                (
                    b.total_gasto
                    / 1000.0
                )
            ) ^ 0.75
        )
    )::numeric,
    4
) AS indice_eficiencia
FROM beneficios b
CROSS JOIN p25 p
ORDER BY indice_eficiencia DESC;

-- 10) Ordenar partidos conforme alinhamento interno
-- Alinhamento = % de votos iguais à orientação do partido (quando orientação é Sim/Não/Obstrução)
SELECT
    vo.sigla_bancada AS partido,
    -- Consideramos apenas as orientações que exigem uma postura clara do deputado
    COUNT(*) FILTER (WHERE vo.orientacao IN ('Sim', 'Não', 'Obstrução')) AS total_considerado,
    
    -- O deputado está alinhado se o seu voto for exatamente igual à orientação
    COUNT(*) FILTER (WHERE vo.orientacao IN ('Sim', 'Não', 'Obstrução') AND vv.voto = vo.orientacao) AS total_alinhado,
    
    ROUND(
        CASE
            WHEN COUNT(*) FILTER (WHERE vo.orientacao IN ('Sim', 'Não', 'Obstrução')) = 0 THEN 0
            ELSE 100.0 * COUNT(*) FILTER (WHERE vo.orientacao IN ('Sim', 'Não', 'Obstrução') AND vv.voto = vo.orientacao)
                 / COUNT(*) FILTER (WHERE vo.orientacao IN ('Sim', 'Não', 'Obstrução'))
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
JOIN deputados d ON d.id_deputado = des.id_deputado
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
JOIN deputados d ON d.id_deputado = des.id_deputado
-- WHERE d.id_deputado = :deputado_id
GROUP BY d.id_deputado, d.ultimo_status_nome_eleitoral, des.desc_subcota
ORDER BY total_gasto DESC;
