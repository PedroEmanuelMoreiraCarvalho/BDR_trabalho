import React from 'react';

const Limpeza = () => {
  return (
    <div className="metodologia-content">
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Limpeza e Expansão das Orientações</h2>
      <p style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        A base de dados oficial da Câmara contendo as orientações de votação possuía ruídos estruturais severos. As orientações nem sempre são emitidas diretamente pelo partido do deputado, podendo vir do <strong>Bloco Partidário</strong> ou da <strong>Federação</strong> a qual o partido pertence, além de existirem orientações "fantasmas" emitidas por entidades não partidárias.
      </p>
      <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        Para garantir a integridade da medição de Fidelidade Partidária, aplicamos um rigoroso pipeline de limpeza e resolução de hierarquia detalhado abaixo:
      </p>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />

      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>1. Remoção de Entradas Não Partidárias</h3>
      <p style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        Foram removidas do arquivo todas as orientações emitidas por agentes que não possuem filiados políticos, garantindo que apenas partidos reais componham o índice. Os emissores removidos foram:
      </p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {['GOVERNO', 'OPOSIÇÃO', 'MAIORIA', 'MINORIA', 'MISSÃO', 'BLOCO PARLAMENTAR'].map((sigla) => (
          <span key={sigla} style={{ background: 'rgba(255,100,100,0.1)', color: '#ff6b6b', padding: '6px 12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 'bold' }}>
            {sigla}
          </span>
        ))}
      </div>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>2. Normalização de Siglas</h3>
      <p style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        Identificamos inconsistências nos nomes dos partidos registrados. Realizamos a padronização para as nomenclaturas oficiais do TSE:
      </p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        <li><code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>PODEMOS</code> convertido para <strong style={{ color: 'var(--text-primary)' }}>PODE</strong></li>
        <li><code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>REPUBLICAN</code> convertido para <strong style={{ color: 'var(--text-primary)' }}>REPUBLICANOS</strong></li>
        <li><code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>SOLIDARIED</code> convertido para <strong style={{ color: 'var(--text-primary)' }}>SOLIDARIEDADE</strong></li>
        <li><code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>PCDOB</code> convertido para <strong style={{ color: 'var(--text-primary)' }}>PCdoB</strong></li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>3. Expansão de Federações e Blocos</h3>
      <p style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        Muitas orientações não traziam a sigla do partido, mas sim do "Bloco" do qual ele faz parte. Expandimos essas orientações para todos os partidos constituintes do grupo, de forma que o deputado seja avaliado pela ordem de seu líder.
      </p>
      <div style={{ overflowX: 'auto', marginBottom: '2rem', width: '100%' }}>
        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}>
          <thead>
            <tr>
              <th style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', border: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-primary)' }}>Tipo</th>
              <th style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', border: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-primary)' }}>Nome do Grupo Registrado</th>
              <th style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', border: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-primary)' }}>Partidos Constituintes (Expansão)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '12px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Federação</td>
              <td style={{ padding: '12px', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>FDR PT-PCDOB-PV</td>
              <td style={{ padding: '12px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>PT, PCdoB, PV</td>
            </tr>
            <tr>
              <td style={{ padding: '12px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Federação</td>
              <td style={{ padding: '12px', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>FDR PSDB-CIDADANIA</td>
              <td style={{ padding: '12px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>PSDB, CIDADANIA</td>
            </tr>
            <tr>
              <td style={{ padding: '12px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Bloco Maior</td>
              <td style={{ padding: '12px', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>BL UNIPPPSD...</td>
              <td style={{ padding: '12px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>UNIÃO, PP, PSD, REPUBLICANOS, MDB, PSDB, CIDADANIA, PODE</td>
            </tr>
            <tr>
              <td style={{ padding: '12px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Bloco</td>
              <td style={{ padding: '12px', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>BL PLFDRPTUNIPP...</td>
              <td style={{ padding: '12px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>PL, PT, PCdoB, PV, UNIÃO, PP</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>4. Resolução de Hierarquia e Conflitos</h3>
      <p style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        Ao expandir os grupos, é comum que ocorram sobreposições (exemplo: O partido <strong>PT</strong> possui uma orientação direta para votar "Sim", mas o seu Bloco orientou votar "Não").
      </p>
      <p style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        Para eliminar ambiguidades e refletir a ordem de comando real do parlamentar, implementamos uma <strong>hierarquia de prioridade legal de liderança</strong> para a filtragem final das orientações:
      </p>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '12px', 
        marginBottom: '2rem', 
        padding: '16px', 
        background: 'rgba(59, 130, 246, 0.05)', 
        border: '1px solid rgba(59, 130, 246, 0.2)', 
        borderRadius: '8px' 
      }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Prioridade 1</strong>
          <span style={{ color: 'var(--text-secondary)' }}>Partido</span>
        </div>
        <div style={{ color: 'var(--text-muted)' }}>&gt;</div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Prioridade 2</strong>
          <span style={{ color: 'var(--text-secondary)' }}>Federação</span>
        </div>
        <div style={{ color: 'var(--text-muted)' }}>&gt;</div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Prioridade 3</strong>
          <span style={{ color: 'var(--text-secondary)' }}>Bloco</span>
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        <em>Resultado:</em> Orientações conflitantes que possuem o mesmo nível de prioridade (ex: dois blocos diferentes emitindo ordens cruzadas para o mesmo partido) foram descartadas e classificadas como <strong>Conflitos Críticos</strong> para não penalizar indevidamente a fidelidade do parlamentar.
      </p>

    </div>
  );
};

export default Limpeza;
