import React from 'react';

const TableWrapper = ({ children }) => (
  <div style={{ overflowX: 'auto', marginBottom: '2rem', width: '100%' }}>
    <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}>
      {children}
    </table>
  </div>
);

const Th = ({ children }) => (
  <th style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', border: '1px solid var(--border-color)', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)' }}>
    {children}
  </th>
);

const Td = ({ children }) => (
  <td style={{ padding: '12px', border: '1px solid var(--border-color)', verticalAlign: 'top', color: 'var(--text-secondary)' }}>
    {children}
  </td>
);

const Dicionario = () => {
  return (
    <div className="metodologia-content">
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Dicionário de Dados</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        Este documento contém a documentação das tabelas criadas no banco de dados, incluindo seus campos, tipos de dados, restrições e descrições.
      </p>

      {/* Tabela: deputados */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>1. Tabela: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.9em' }}>deputados</code></h3>
      <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}><strong>Descrição:</strong> Armazena as informações principais e o último status dos deputados.</p>
      <TableWrapper>
        <thead>
          <tr><Th>Coluna</Th><Th>Tipo de Dado</Th><Th>Restrições</Th><Th>Descrição</Th></tr>
        </thead>
        <tbody>
          <tr><Td><code>id_deputado</code></Td><Td>INTEGER</Td><Td>PRIMARY KEY</Td><Td>Identificador único do deputado.</Td></tr>
          <tr><Td><code>uri_deputado</code></Td><Td>VARCHAR(255)</Td><Td>NOT NULL</Td><Td>URI de acesso aos detalhes do deputado.</Td></tr>
          <tr><Td><code>nome_civil_deputado</code></Td><Td>VARCHAR(255)</Td><Td>NOT NULL</Td><Td>Nome civil completo do deputado.</Td></tr>
          <tr><Td><code>cpf_deputado</code></Td><Td>VARCHAR(11)</Td><Td>NOT NULL</Td><Td>CPF do deputado.</Td></tr>
          <tr><Td><code>sexo_deputado</code></Td><Td>VARCHAR(1)</Td><Td>NOT NULL</Td><Td>Sexo do deputado.</Td></tr>
          <tr><Td><code>rede_social_deputado</code></Td><Td>TEXT</Td><Td></Td><Td>Links para as redes sociais do deputado.</Td></tr>
          <tr><Td><code>data_nascimento_deputado</code></Td><Td>DATE</Td><Td></Td><Td>Data de nascimento do deputado.</Td></tr>
          <tr><Td><code>escolaridade_deputado</code></Td><Td>VARCHAR(100)</Td><Td></Td><Td>Nível de escolaridade.</Td></tr>
          <tr><Td><code>ultimo_status_sigla_partido</code></Td><Td>VARCHAR(20)</Td><Td></Td><Td>Sigla do partido no último status.</Td></tr>
          <tr><Td><code>ultimo_status_sigla_uf</code></Td><Td>VARCHAR(2)</Td><Td></Td><Td>Sigla da UF no último status.</Td></tr>
          <tr><Td><code>ultimo_status_url_foto</code></Td><Td>VARCHAR(255)</Td><Td></Td><Td>URL para a foto do deputado.</Td></tr>
          <tr><Td><code>ultimo_status_nome_eleitoral</code></Td><Td>VARCHAR(255)</Td><Td>NOT NULL</Td><Td>Nome utilizado na campanha eleitoral.</Td></tr>
          <tr><Td><code>ultimo_status_situacao</code></Td><Td>VARCHAR(50)</Td><Td></Td><Td>Situação atual do mandato.</Td></tr>
          <tr><Td><code>ultimo_status_condicao_eleitoral</code></Td><Td>VARCHAR(50)</Td><Td></Td><Td>Condição eleitoral atual.</Td></tr>
        </tbody>
      </TableWrapper>

      {/* Tabela: votacao */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>2. Tabela: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.9em' }}>votacao</code></h3>
      <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}><strong>Descrição:</strong> Tabela de votações da Câmara dos Deputados.</p>
      <TableWrapper>
        <thead>
          <tr><Th>Coluna</Th><Th>Tipo de Dado</Th><Th>Restrições</Th><Th>Descrição</Th></tr>
        </thead>
        <tbody>
          <tr><Td><code>id_votacao</code></Td><Td>VARCHAR(50)</Td><Td>PRIMARY KEY</Td><Td>Identificador único da votação.</Td></tr>
          <tr><Td><code>data_votacao</code></Td><Td>DATE</Td><Td>NOT NULL</Td><Td>Data em que a votação ocorreu.</Td></tr>
          <tr><Td><code>data_hora_registro_votacao</code></Td><Td>TIMESTAMP</Td><Td></Td><Td>Data e hora exata do registro da votação.</Td></tr>
          <tr><Td><code>id_evento</code></Td><Td>INTEGER</Td><Td>NOT NULL</Td><Td>ID do evento/sessão onde ocorreu a votação.</Td></tr>
          <tr><Td><code>aprovacao</code></Td><Td>BOOLEAN</Td><Td></Td><Td>Indica se a matéria foi aprovada (true) ou não (false).</Td></tr>
          <tr><Td><code>votos_sim</code></Td><Td>INTEGER</Td><Td>NOT NULL</Td><Td>Total de votos favoráveis.</Td></tr>
          <tr><Td><code>votos_nao</code></Td><Td>INTEGER</Td><Td>NOT NULL</Td><Td>Total de votos contrários.</Td></tr>
          <tr><Td><code>votos_outros</code></Td><Td>INTEGER</Td><Td>NOT NULL</Td><Td>Total de abstenções ou outros tipos de voto.</Td></tr>
          <tr><Td><code>descricao_votacao</code></Td><Td>TEXT</Td><Td></Td><Td>Descrição detalhada do objeto da votação.</Td></tr>
          <tr><Td><code>id_proposicao</code></Td><Td>INTEGER</Td><Td></Td><Td>ID da proposição principal sendo votada.</Td></tr>
        </tbody>
      </TableWrapper>

      {/* Tabela: votacoes_orientacoes */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>3. Tabela: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.9em' }}>votacoes_orientacoes</code></h3>
      <TableWrapper>
        <thead>
          <tr><Th>Coluna</Th><Th>Tipo de Dado</Th><Th>Restrições</Th><Th>Descrição</Th></tr>
        </thead>
        <tbody>
          <tr><Td><code>id_votacao</code></Td><Td>VARCHAR(50)</Td><Td>PK, NOT NULL</Td><Td>Identificador único da votação.</Td></tr>
          <tr><Td><code>sigla_bancada</code></Td><Td>VARCHAR(50)</Td><Td>PK, NOT NULL</Td><Td>Sigla da bancada ou partido que orientou o voto.</Td></tr>
          <tr><Td><code>orientacao</code></Td><Td>VARCHAR(50)</Td><Td></Td><Td>O voto orientado pela bancada (ex: Sim, Não, Obstrução).</Td></tr>
          <tr><Td><code>tipo</code></Td><Td>VARCHAR(50)</Td><Td></Td><Td>Tipo da orientação de voto.</Td></tr>
          <tr><Td><code>prioridade</code></Td><Td>INTEGER</Td><Td></Td><Td>Prioridade da orientação.</Td></tr>
        </tbody>
      </TableWrapper>

      {/* Tabela: votacoes_votos */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>4. Tabela: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.9em' }}>votacoes_votos</code></h3>
      <TableWrapper>
        <thead>
          <tr><Th>Coluna</Th><Th>Tipo de Dado</Th><Th>Restrições</Th><Th>Descrição</Th></tr>
        </thead>
        <tbody>
          <tr><Td><code>id_votacao</code></Td><Td>VARCHAR(50)</Td><Td>PK, NOT NULL</Td><Td>Identificador único da votação.</Td></tr>
          <tr><Td><code>id_deputado</code></Td><Td>INTEGER</Td><Td>PK, NOT NULL</Td><Td>Identificador do deputado que votou.</Td></tr>
          <tr><Td><code>voto</code></Td><Td>VARCHAR(50)</Td><Td>NOT NULL</Td><Td>Voto registrado do deputado.</Td></tr>
          <tr><Td><code>deputado_sigla_partido</code></Td><Td>VARCHAR(255)</Td><Td></Td><Td>Sigla do partido do deputado no momento do voto.</Td></tr>
        </tbody>
      </TableWrapper>

      {/* Tabela: despesas */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>5. Tabela: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.9em' }}>despesas</code></h3>
      <TableWrapper>
        <thead>
          <tr><Th>Coluna</Th><Th>Tipo de Dado</Th><Th>Restrições</Th><Th>Descrição</Th></tr>
        </thead>
        <tbody>
          <tr><Td><code>id_deputado</code></Td><Td>INTEGER</Td><Td></Td><Td>Identificador do deputado para cruzar com outras tabelas.</Td></tr>
          <tr><Td><code>desc_subcota</code></Td><Td>VARCHAR(255)</Td><Td></Td><Td>Descrição do tipo de despesa (subcota).</Td></tr>
          <tr><Td><code>fornecedor_nome</code></Td><Td>VARCHAR(255)</Td><Td></Td><Td>Nome do fornecedor.</Td></tr>
          <tr><Td><code>fornecedor_cnpj_cpf</code></Td><Td>VARCHAR(14)</Td><Td></Td><Td>CNPJ/CPF do fornecedor.</Td></tr>
          <tr><Td><code>valor_liquido</code></Td><Td>DECIMAL(15,2)</Td><Td></Td><Td>Valor líquido efetivamente pago.</Td></tr>
        </tbody>
      </TableWrapper>

      {/* Tabela: eventos */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>6. Tabela: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.9em' }}>eventos</code></h3>
      <TableWrapper>
        <thead>
          <tr><Th>Coluna</Th><Th>Tipo de Dado</Th><Th>Restrições</Th><Th>Descrição</Th></tr>
        </thead>
        <tbody>
          <tr><Td><code>id_evento</code></Td><Td>INTEGER</Td><Td>PRIMARY KEY</Td><Td>Identificador único do evento/sessão.</Td></tr>
          <tr><Td><code>data_evento</code></Td><Td>DATE</Td><Td></Td><Td>Data do evento.</Td></tr>
          <tr><Td><code>situacao_evento</code></Td><Td>VARCHAR(50)</Td><Td></Td><Td>Situação do evento (ex: Realizada, Cancelada).</Td></tr>
          <tr><Td><code>tipo_evento</code></Td><Td>VARCHAR(100)</Td><Td></Td><Td>Tipo do evento (ex: Sessão Deliberativa).</Td></tr>
          <tr><Td><code>descricao_evento</code></Td><Td>TEXT</Td><Td></Td><Td>Descrição/resumo do evento.</Td></tr>
        </tbody>
      </TableWrapper>

      {/* Tabela: presenca_deputados */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>7. Tabela: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.9em' }}>presenca_deputados</code></h3>
      <TableWrapper>
        <thead>
          <tr><Th>Coluna</Th><Th>Tipo de Dado</Th><Th>Restrições</Th><Th>Descrição</Th></tr>
        </thead>
        <tbody>
          <tr><Td><code>id_dep</code></Td><Td>INTEGER</Td><Td>PK, NOT NULL</Td><Td>Identificador do deputado.</Td></tr>
          <tr><Td><code>ano_presenca</code></Td><Td>INTEGER</Td><Td>PK</Td><Td>Ano de referência da presença.</Td></tr>
          <tr><Td><code>plenario_presencas</code></Td><Td>INTEGER</Td><Td></Td><Td>Quantidade de presenças no plenário.</Td></tr>
          <tr><Td><code>plenario_ausencias_justificadas</code></Td><Td>INTEGER</Td><Td></Td><Td>Quantidade de ausências justificadas no plenário.</Td></tr>
          <tr><Td><code>plenario_ausencias_nao_justificadas</code></Td><Td>INTEGER</Td><Td></Td><Td>Quantidade de ausências não justificadas no plenário.</Td></tr>
          <tr><Td><code>comissoes_presencas</code></Td><Td>INTEGER</Td><Td></Td><Td>Quantidade de presenças em comissões.</Td></tr>
          <tr><Td><code>comissoes_ausencias_justificadas</code></Td><Td>INTEGER</Td><Td></Td><Td>Quantidade de ausências justificadas em comissões.</Td></tr>
          <tr><Td><code>comissoes_ausencias_nao_justificadas</code></Td><Td>INTEGER</Td><Td></Td><Td>Quantidade de ausências não justificadas em comissões.</Td></tr>
        </tbody>
      </TableWrapper>

      {/* Tabela: proposicoes */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>8. Tabela: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.9em' }}>proposicoes</code></h3>
      <TableWrapper>
        <thead>
          <tr><Th>Coluna</Th><Th>Tipo de Dado</Th><Th>Restrições</Th><Th>Descrição</Th></tr>
        </thead>
        <tbody>
          <tr><Td><code>id_proposicao</code></Td><Td>INTEGER</Td><Td>PRIMARY KEY</Td><Td>Identificador único da proposição.</Td></tr>
          <tr><Td><code>sigla_tipo_proposicao</code></Td><Td>VARCHAR(10)</Td><Td></Td><Td>Sigla do tipo da proposição (ex: PL, PEC).</Td></tr>
          <tr><Td><code>numero_proposicao</code></Td><Td>INTEGER</Td><Td></Td><Td>Número oficial da proposição.</Td></tr>
          <tr><Td><code>ano_proposicao</code></Td><Td>INTEGER</Td><Td></Td><Td>Ano de apresentação da proposição.</Td></tr>
          <tr><Td><code>ementa</code></Td><Td>TEXT</Td><Td></Td><Td>Ementa da proposição.</Td></tr>
          <tr><Td><code>keywords</code></Td><Td>TEXT</Td><Td></Td><Td>Palavras-chave associadas à proposição.</Td></tr>
          <tr><Td><code>ultimo_status_id_situacao</code></Td><Td>INTEGER</Td><Td></Td><Td>Identificador da situação mais recente.</Td></tr>
        </tbody>
      </TableWrapper>

      {/* View: mv_deputados_consolidado */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>9. View Materializada: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.9em' }}>mv_deputados_consolidado</code></h3>
      <TableWrapper>
        <thead>
          <tr><Th>Coluna</Th><Th>Tipo de Dado</Th><Th>Descrição</Th></tr>
        </thead>
        <tbody>
          <tr><Td><code>id_deputado</code></Td><Td>INTEGER</Td><Td>Identificador único do deputado.</Td></tr>
          <tr><Td><code>total_gasto</code></Td><Td>DECIMAL</Td><Td>Soma total de despesas realizadas.</Td></tr>
          <tr><Td><code>total_proposicoes</code></Td><Td>INTEGER</Td><Td>Quantidade total de proposições em que atuou como autor.</Td></tr>
          <tr><Td><code>score_proposicoes</code></Td><Td>NUMERIC</Td><Td>Pontuação calculada com base na relevância e protagonismo em proposições.</Td></tr>
          <tr><Td><code>beneficio_score</code></Td><Td>NUMERIC</Td><Td>Soma ponderada dos scores (proposições, plenário e comissões).</Td></tr>
          <tr><Td><code>fator_atividade</code></Td><Td>NUMERIC</Td><Td>Fator ajustado da atividade em relação a um patamar mínimo.</Td></tr>
          <tr><Td><code>indice_eficiencia</code></Td><Td>NUMERIC</Td><Td>Índice final de eficiência (custo-benefício).</Td></tr>
          <tr><Td><code>posicao_ranking</code></Td><Td>INTEGER</Td><Td>Posição do deputado no ranking geral de eficiência.</Td></tr>
        </tbody>
      </TableWrapper>

    </div>
  );
};

export default Dicionario;
