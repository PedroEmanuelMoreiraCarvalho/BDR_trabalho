import React from 'react';

const VisaoGeral = () => {
  return (
    <div className="metodologia-content">
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Introdução</h2>

      {/* Bloco de Disclaimer / Caráter Acadêmico */}
      <div className="glass-card" style={{
        background: 'rgba(59, 130, 246, 0.05)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          Aviso Importante &amp; Caráter Acadêmico
        </h3>
        <p style={{ margin: 0, fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Este portal é um <strong>trabalho acadêmico estritamente pedagógico</strong>, sem qualquer associação política, partidária, ideológica ou fins lucrativos. A ferramenta foi desenvolvida para fins de estudo no âmbito da disciplina de Bancos de Dados Relacionais.
        </p>
        <p style={{ margin: 0, fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Todas as informações exibidas são provenientes de <strong>dados públicos oficiais</strong>. Devido a eventuais inconformidades, desatualizações ou discrepâncias nos sistemas de dados abertos da Câmara dos Deputados, algumas métricas ou informações individuais podem aparecer incorretas. Para consultar os dados diretamente na fonte ou obter mais esclarecimentos sobre a API legislativa, acesse:
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', margin: '4px 0' }}>
          <a href="https://dadosabertos.camara.leg.br/swagger/api.html?tab=staticfile" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline', fontSize: '0.875rem' }}>
            Portal de Dados Abertos da Câmara
          </a>
          <a href="https://www.camara.leg.br/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline', fontSize: '0.875rem' }}>
            Site Oficial da Câmara dos Deputados
          </a>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px' }}>
          * Os autores desta aplicação não se responsabilizam pela exatidão, integridade ou atualização dos dados replicados aqui, uma vez que eles são fornecidos de forma livre e pública pelas fontes oficiais competentes.
        </p>
      </div>

      <p style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        Este projeto foi desenvolvido como atividade da disciplina de Bancos de Dados Relacionais. O objetivo central da aplicação é extrair, processar e analisar dados legislativos para responder a perguntas complexas sobre a atuação dos parlamentares brasileiros.
      </p>
      <p style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        Praticamente todos os dados utilizados neste projeto foram extraídos do portal de Dados Abertos da Câmara dos Deputados, abrangendo o período de 2023 até o primeiro semestre de 2026 (não contemplando o ano completo de 2026). Os dados passaram por um rigoroso processo de extração, limpeza e carga estruturada. Para responder a perguntas específicas e contornar limitações dos arquivos oficiais em CSV, desenvolvemos <em>scripts</em> customizados de integração com a API e de <em>web scraping</em> focados em extrair informações diretamente das páginas da Câmara.
      </p>
      <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        A nossa aplicação expõe os resultados analíticos divididos em três seções de interface: <strong>Visão Geral</strong>, <strong>Visão Partidária</strong> e <strong>Tela Deputados</strong>.
      </p>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Arquitetura da Interface e Mapeamento de Requisitos</h2>
      <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        A aplicação foi estruturada para responder aos requisitos do roteiro, distribuindo as informações nas seguintes abas da página:
      </p>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>1. Visão Geral</h3>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        <li style={{ marginBottom: '0.75rem' }}>
          <strong>Deputados ordenados por gastos:</strong><br />
          <em>Como foi feito:</em> Cruzamento das tabelas <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.85em', fontFamily: 'monospace' }}>despesas</code> e <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.85em', fontFamily: 'monospace' }}>deputados</code>. Agrupamos pelo ID do deputado e aplicamos a soma (SUM) da coluna valor_liquido, ordenando os valores de forma decrescente.
        </li>
        <li style={{ marginBottom: '0.75rem' }}>
          <strong>Índice de Custo x Benefício (Eficiência):</strong><br />
          <em>Como foi feito:</em> Desenvolvemos um <em>score</em> que contrapõe os Gastos (Custo) ao Desempenho Legislativo e Presenças (Benefício). A pontuação respeita pesos distintos, onde propor leis vale mais que assiduidade, e leis aprovadas possuem bonificação acentuada.
        </li>
        <li style={{ marginBottom: '0.75rem' }}>
          <strong>Agrupar deputados por escolaridade:</strong><br />
          <em>Como foi feito:</em> Contagem de volume base (COUNT) com agrupamento simples na coluna escolaridade.
        </li>
        <li style={{ marginBottom: '0.75rem' }}>
          <strong>Ordenar fornecedores por valores de contrato:</strong><br />
          <em>Como foi feito:</em> Agrupamento dos gastos na tabela de despesas pelo CNPJ/CPF e exibição do nome do beneficiário.
        </li>
        <li style={{ marginBottom: '0.75rem' }}>
          <strong>Correlacionar escolaridade:</strong><br />
          <em>Como foi feito:</em> Relacionamos a escolaridade com Gastos (Soma dos valores na tabela de despesas), Fidelidade Partidária, Nº de proposições e Presenças (cálculos sobre os dados extraídos pelo scraper).
        </li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>2. Visão Partidária</h3>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        <li style={{ marginBottom: '0.75rem' }}>
          <strong>Alinhamento interno partidário:</strong><br />
          <em>Como foi feito:</em> Permite medir qual partido possui maior controle sobre os filiados. Calculamos percentualmente quantas vezes o voto de cada membro de uma legenda foi fiel à "Orientação" emitida pelo líder daquela mesma sigla.
        </li>
        <li style={{ marginBottom: '0.75rem' }}>
          <strong>Ordenação de partidos:</strong><br />
          <em>Como foi feito:</em> Agrupamento global dos dados dos membros de um partido para classificar o bloco político inteiro por Frequência, Produtividade, Despesas Totais e Temas.
        </li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>3. Tela Deputados</h3>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        <li style={{ marginBottom: '0.75rem' }}>
          <strong>Com o que o deputado mais gasta?</strong><br />
          <em>Como foi feito:</em> Filtragem pelo ID do parlamentar e agrupamento das suas notas fiscais pela subcota.
        </li>
        <li style={{ marginBottom: '0.75rem' }}>
          <strong>Eixo de atuação (Nuvem de Palavras):</strong><br />
          <em>Como foi feito:</em> Utiliza os registros nominais conectados às autorias do deputado, indexando as ocorrências dos campos de texto da base de projetos de lei.
        </li>
        <li style={{ marginBottom: '0.75rem' }}>
          <strong>Como o deputado votou em um tema específico:</strong><br />
          <em>Como foi feito:</em> Filtramos as chaves do deputado e da sessão e buscamos na string do tema (ex: ILIKE '%saúde%') para revelar a postura do parlamentar.
        </li>
      </ul>
    </div>
  );
};

export default VisaoGeral;
