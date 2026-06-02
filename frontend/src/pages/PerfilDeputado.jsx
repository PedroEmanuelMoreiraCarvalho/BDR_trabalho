import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User as UserIcon, MapPin, BookOpen } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const PerfilDeputado = () => {
  const { id } = useParams();

  // ==========================================
  // ESTADOS DOS DADOS
  // ==========================================
  const [perfil, setPerfil] = useState(null);
  const [nuvemPalavras, setNuvemPalavras] = useState([]);
  const [gastosTipo, setGastosTipo] = useState([]);

  // ==========================================
  // SIMULAÇÃO DE CHAMADA À API (useEffect)
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        /*
         * FUTURO: Integração com o Backend
         * const resPerfil = await axios.get(`/api/deputados/${id}`);
         * setPerfil(resPerfil.data);
         * 
         * const resNuvem = await axios.get(`/api/deputados/${id}/temas`);
         * setNuvemPalavras(resNuvem.data);
         * 
         * const resGastos = await axios.get(`/api/deputados/${id}/gastos-por-tipo`);
         * setGastosTipo(resGastos.data);
         */

        // MOCK: Perfil Básico
        setPerfil({
          id_deputado: id,
          nome: id === '12345' ? 'Nikolas Ferreira' : 'Guilherme Boulos', // Brincadeira simples com os IDs mockados
          partido: id === '12345' ? 'PL' : 'PSOL',
          uf: id === '12345' ? 'MG' : 'SP',
          escolaridade: 'Superior Completo'
        });

        // MOCK: Pergunta 2 - Eixo de Atuação (Nuvem de Palavras)
        // O formato esperado pelo react-wordcloud é [{ text: string, value: number }]
        setNuvemPalavras([
          { text: 'Educação', value: 85 },
          { text: 'Saúde Pública', value: 65 },
          { text: 'Economia', value: 45 },
          { text: 'Segurança', value: 40 },
          { text: 'Tributário', value: 35 },
          { text: 'Meio Ambiente', value: 25 },
          { text: 'Infraestrutura', value: 20 },
          { text: 'Tecnologia', value: 15 },
          { text: 'Cultura', value: 10 },
        ]);

        // MOCK: Pergunta 13 - Com o que o deputado mais gasta?
        setGastosTipo([
          { tipo_gasto: 'Divulgação Parlamentar', total_gasto: 154000 },
          { tipo_gasto: 'Passagens Aéreas', total_gasto: 86000 },
          { tipo_gasto: 'Manutenção de Escritório', total_gasto: 45000 },
          { tipo_gasto: 'Combustíveis', total_gasto: 25000 },
          { tipo_gasto: 'Consultorias', total_gasto: 18000 },
        ]);

      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
      }
    };

    fetchData();
  }, [id]);

  const COLORS_PIE = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  const renderMockWordCloud = () => {
    if (nuvemPalavras.length === 0) return null;
    const maxVal = Math.max(...nuvemPalavras.map(w => w.value));
    const minVal = Math.min(...nuvemPalavras.map(w => w.value));
    
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
        {nuvemPalavras.map((word, i) => {
          const size = 14 + ((word.value - minVal) / (maxVal - minVal)) * 36; // Fontes entre 14px e 50px
          return (
            <span 
              key={i} 
              style={{ 
                fontSize: `${size}px`, 
                fontWeight: 'bold', 
                color: COLORS_PIE[i % COLORS_PIE.length],
                transition: 'transform 0.2s',
                cursor: 'default',
                opacity: 0.9
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.opacity = '1'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '0.9'; }}
              title={`Relevância do Tema: ${word.value}`}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    );
  };

  if (!perfil) return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Carregando perfil...</div>;

  return (
    <div className="dashboard-container">
      {/* Botão Voltar e Cabeçalho do Perfil */}
      <Link to="/parlamentares" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '24px', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
        <ArrowLeft size={18} />
        <span>Voltar para Busca</span>
      </Link>

      <div className="glass-card" style={{ padding: '32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UserIcon size={48} style={{ color: 'var(--text-secondary)' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{perfil.nome}</h1>
          <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '12px', fontWeight: '500' }}>
                {perfil.partido}
              </span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} /> {perfil.uf}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={16} /> {perfil.escolaridade}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', opacity: 0.6 }}>
              ID: {perfil.id_deputado}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Pergunta 2: Eixo de Atuação (Nuvem de Palavras) */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Eixo de Atuação (Temas)</h2>
          <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
            Baseado na quantidade de proposições que o deputado foi autor. Palavras maiores indicam maior frequência do tema.
          </p>
          <div style={{ flex: 1, minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', height: '100%' }}>
              {renderMockWordCloud()}
            </div>
          </div>
        </div>

        {/* Pergunta 13: Com o que o deputado mais gasta? */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Distribuição de Gastos</h2>
          <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
            Valor líquido total gasto pelo parlamentar dividido por categoria (subcota).
          </p>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gastosTipo}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="total_gasto"
                  nameKey="tipo_gasto"
                >
                  {gastosTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Gasto']}
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f9fafb' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PerfilDeputado;
