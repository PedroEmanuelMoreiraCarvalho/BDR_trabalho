import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const MathEquation = ({ equation, displayMode = true }) => {
  const html = katex.renderToString(equation, {
    throwOnError: false,
    displayMode,
  });
  if (displayMode) {
    return (
      <div 
        style={{ 
          overflowX: 'auto', 
          overflowY: 'hidden', 
          maxWidth: '100%', 
          padding: '12px 0', 
          margin: '12px 0',
          scrollbarWidth: 'thin'
        }}
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    );
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const Score = () => {
  return (
    <div className="metodologia-content">
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Formulação Matemática e Fundamentação Científica (Índice de Eficiência)</h2>
      <p style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        Este documento apresenta a modelagem matemática do <strong>Índice de Eficiência</strong> dos deputados federais. A notação foi estruturada seguindo o padrão de artigos acadêmicos.
      </p>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />

      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>1. Notações e Conjuntos</h3>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        <li>Letra <MathEquation equation="d" displayMode={false} />: Representa um parlamentar (deputado).</li>
        <li>Letra <MathEquation equation="p" displayMode={false} />: Representa uma proposição legislativa.</li>
        <li>Letra <MathEquation equation="c" displayMode={false} />: Representa uma categoria temática ou processual de proposição.</li>
        <li>Conjunto <MathEquation equation="P_d" displayMode={false} />: O conjunto de todas as proposições das quais o deputado <MathEquation equation="d" displayMode={false} /> é autor ou coautor.</li>
        <li>Conjunto <MathEquation equation="C" displayMode={false} />: O conjunto de categorias de proposição:
          <MathEquation equation="C = \{ \text{Legislativo estrutural}, \text{Legislativo complementar}, \text{Fiscalização e controle}, \text{Indução administrativa}, \text{Procedimental}, \text{Outros} \}" />
        </li>
        <li>Conjunto <MathEquation equation="P_{d,c}" displayMode={false} />: Subconjunto de proposições do deputado <MathEquation equation="d" displayMode={false} /> que pertencem à categoria <MathEquation equation="c" displayMode={false} />.</li>
      </ul>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />

      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>2. Pontuação de Proposição Individual</h3>
      <p style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        Para cada proposição <MathEquation equation="p \in P_d" displayMode={false} />, a pontuação individual <MathEquation equation="S_{\text{indiv}}(p)" displayMode={false} /> é calculada como o produto de sua relevância por tipo, modificador de situação e fator de autoria compartilhada:
      </p>
      <MathEquation equation="S_{\text{indiv}}(p) = w(p) \cdot s(p) \cdot a(p)" />
      
      <p style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>Onde:</p>

      <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>A. Peso do Tipo de Proposição: <MathEquation equation="w(p)" displayMode={false} /></h4>
      <p style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>Mapeia a complexidade jurídica intrínseca da proposta:</p>
      <MathEquation equation="w(p) = \begin{cases} 30.0, & \text{se } p \in \{\text{PEC}\} \\ 25.0, & \text{se } p \in \{\text{PLP}\} \\ 20.0, & \text{se } p \in \{\text{MPV}, \text{PLV}, \text{RCP}\} \\ 15.0, & \text{se } p \in \{\text{PL}\} \\ 10.0, & \text{se } p \in \{\text{PDL}, \text{PFC}, \text{PLN}\} \\ 8.0, & \text{se } p \in \{\text{PRC}\} \\ 5.0, & \text{se } p \in \{\text{SIT}\} \\ 3.0, & \text{se } p \in \{\text{EMC, EMP, EMR, EMS, EMA, EML, EMO, ESB, SBE, SBE-A, SBT, SBT-A, SBR, SSP, ERD}\} \text{ (Emendas)} \\ 2.0, & \text{se } p \in \{\text{RIC}\} \\ 0.5, & \text{se } p \in \{\text{INC}\} \\ 0.2, & \text{se } p \in \{\text{REQ, REC, RPD, RPDR, DTQ, PPP, PIN, PRR, RRC}\} \text{ (Requerimentos/Procedimentais)} \\ 0.1, & \text{caso contrário} \end{cases}" />

      <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', marginTop: '1.5rem', color: 'var(--text-primary)' }}>B. Coeficiente de Situação da Tramitação: <MathEquation equation="s(p)" displayMode={false} /></h4>
      <p style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>Mede o progresso final da matéria legislativa na Câmara dos Deputados:</p>
      <MathEquation equation="s(p) = \begin{cases} 1.0, & \text{se aprovada (Situação 1140)} \\ 0.8, & \text{se em estágio avançado ou pronta para pauta (Situações 900, 926, 1150, 1293, 939)} \\ 0.1, & \text{se arquivada ou rejeitada (Situações 923, 941, 950, 1120, 1222, 1292)} \\ 0.3, & \text{se em tramitação regular (outros códigos)} \end{cases}" />

      <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', marginTop: '1.5rem', color: 'var(--text-primary)' }}>C. Fator de Autoria: <MathEquation equation="a(p)" displayMode={false} /></h4>
      <p style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>Aplica a divisão de crédito proporcional para desencorajar assinaturas simbólicas em projetos coletivos:</p>
      <MathEquation equation="a(p) = \begin{cases} 1.0, & \text{se } N_{\text{autores}}(p) = 1 \\ 0.5, & \text{se } N_{\text{autores}}(p) > 1 \text{ e } \text{OrdemAssinatura}(p) = 1 \\ \frac{0.5}{N_{\text{autores}}(p) - 1}, & \text{se } N_{\text{autores}}(p) > 1 \text{ e } \text{OrdemAssinatura}(p) > 1 \end{cases}" />
      <p style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        Onde <MathEquation equation="N_{\text{autores}}(p)" displayMode={false} /> é a quantidade total de signatários da proposição <MathEquation equation="p" displayMode={false} />.
      </p>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />

      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>3. Pontuação Consolidada de Proposições</h3>
      <p style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        O score total de produção legislativa do deputado <MathEquation equation="S_{\text{prop}}(d)" displayMode={false} /> é a soma sub-linear dos scores agregados por categoria temática, aplicando-se o redutor anti-spam:
      </p>
      <MathEquation equation="S_{\text{prop}}(d) = \sum_{c \in C} \left( \sum_{p \in P_{d,c}} S_{\text{indiv}}(p) \right)^{0.75}" />

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />

      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>4. Scores de Presença Mandatorial</h3>
      <p style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        A assiduidade do deputado em Plenário e Comissões é calculada aplicando penalização de peso 3 às ausências não justificadas.
      </p>
      <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>A. Presença em Plenário: <MathEquation equation="S_{\text{plen}}(d)" displayMode={false} /></h4>
      <MathEquation equation="S_{\text{plen}}(d) = \max \left( 0, \ (P_{\text{plen}} - 3 \cdot A_{\text{plen, injust}}) \cdot \left( \frac{P_{\text{plen}}}{P_{\text{plen}} + A_{\text{plen, just}} + A_{\text{plen, injust}}} \right) \right)" />
      
      <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', marginTop: '1.5rem', color: 'var(--text-primary)' }}>B. Presença em Comissões: <MathEquation equation="S_{\text{com}}(d)" displayMode={false} /></h4>
      <MathEquation equation="S_{\text{com}}(d) = \max \left( 0, \ (P_{\text{com}} - 3 \cdot A_{\text{com, injust}}) \cdot \left( \frac{P_{\text{com}}}{P_{\text{com}} + A_{\text{com, just}} + A_{\text{com, injust}}} \right) \right)" />
      
      <p style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>Onde:</p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        <li><MathEquation equation="P" displayMode={false} />: Frequência ativa de presença.</li>
        <li><MathEquation equation="A_{\text{just}}" displayMode={false} />: Ausências justificadas.</li>
        <li><MathEquation equation="A_{\text{injust}}" displayMode={false} />: Ausências não justificadas.</li>
      </ul>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />

      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>5. Função de Benefício Consolidado: <MathEquation equation="B(d)" displayMode={false} /></h3>
      <MathEquation equation="B(d) = 7.0 \cdot S_{\text{prop}}(d) + 1.5 \cdot S_{\text{plen}}(d) + 1.0 \cdot S_{\text{com}}(d)" />

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />

      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>6. Normalização da Atividade e Escala de Custos</h3>
      <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>A. Fator de Atividade Parlamentar: <MathEquation equation="A(d)" displayMode={false} /></h4>
      <MathEquation equation="A(d) = \frac{B(d)}{B(d) + \Phi_{25}}" />
      
      <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', marginTop: '1.5rem', color: 'var(--text-primary)' }}>B. Custo Financeiro Normalizado: <MathEquation equation="C(d)" displayMode={false} /></h4>
      <MathEquation equation="C(d) = \frac{G(d)}{1000}" />

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />

      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>7. Índice de Eficiência Final: <MathEquation equation="E(d)" displayMode={false} /></h3>
      <MathEquation equation="E(d) = \frac{B(d) \cdot A(d)}{(1 + C(d))^{0.75}}" />
      <p style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>Ao expandirmos os termos, a equação unificada que governa o modelo é definida por:</p>
      <MathEquation equation="E(d) = \frac{B(d)^2}{(B(d) + \Phi_{25}) \cdot \left(1 + \frac{G(d)}{1000}\right)^{0.75}}" />
    </div>
  );
};

export default Score;
