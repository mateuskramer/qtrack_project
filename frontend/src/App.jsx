import { useState, useEffect } from 'react'
import './App.css'

import Sidebar from './components/Sidebar'
import MetricCard from './components/MetricCard'
import Heatmap from './components/Heatmap'
import ExperimentTable from './components/ExperimentTable'
import FidelityChart from './components/FidelityChart'
import ReadoutChart from './components/ReadoutChart'

// Importações do Recharts para os gráficos dos relatórios
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';

function App() {
  const [telaAtual, setTelaAtual] = useState('dashboard')
  const [listaQpus, setListaQpus] = useState([])

  // Estados para armazenar os dados dos relatórios (Abas acadêmicas)
  const [dadosT1, setDadosT1] = useState([])
  const [dadosFidelidade, setDadosFidelidade] = useState([])
  const [dadosTemperatura, setDadosTemperatura] = useState([])

  // Estados do formulário de QPU (CRUD)
  const [nomeQpu, setNomeQpu] = useState('')
  const [fabricanteQpu, setFabricanteQpu] = useState('')
  const [modeloQpu, setModeloQpu] = useState('')
  const [tecnologiaQpu, setTecnologiaQpu] = useState('')
  const [dataInstalacaoQpu, setDataInstalacaoQpu] = useState('')
  const [statusQpu, setStatusQpu] = useState('Ativo')
  const [idCriostato, setIdCriostato] = useState('')
  const [idEditando, setIdEditando] = useState(null)

  // Estado para filtrar a QPU visualizada no Relatório 1
  const [qpuFiltrada, setQpuFiltrada] = useState('todas');

  // ============== NOVOS ESTADOS DO DASHBOARD DINÂMICO ==============
  const [qpuSelecionada, setQpuSelecionada] = useState('')
  const [dadosDashQubits, setDadosDashQubits] = useState({ mapa: [], metricas: [], fidelidades: [] })
  const [dadosDashAmbiente, setDadosDashAmbiente] = useState({ temperatura: 0, pressao: 0, vibracao: 0 })

  const limparFormulario = () => {
    setNomeQpu(''); setFabricanteQpu(''); setModeloQpu('');
    setTecnologiaQpu(''); setDataInstalacaoQpu(''); setStatusQpu('Ativo'); 
    setIdCriostato(''); setIdEditando(null);
  }

  const preencherFormulario = (qpu) => {
    setIdEditando(qpu.id_qpu);
    setNomeQpu(qpu.nome);
    setFabricanteQpu(qpu.fabricante);
    setModeloQpu(qpu.modelo);
    setTecnologiaQpu(qpu.tecnologia || '');
    setDataInstalacaoQpu(qpu.data_instalacao ? qpu.data_instalacao.split('T')[0] : '');
    setStatusQpu(qpu.status_operacional);
    setIdCriostato(qpu.id_criostato || '');
  }

  const handleSalvarQpu = async () => {
    if (!nomeQpu || !fabricanteQpu || !modeloQpu || !tecnologiaQpu || !dataInstalacaoQpu || !idCriostato) {
      return alert("Preencha todos os campos!");
    }

    const url = idEditando ? `http://localhost:8000/api/qpus/${idEditando}` : 'http://localhost:8000/api/qpus';
    const metodo = idEditando ? 'PUT' : 'POST';

    try {
      const resposta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nome: nomeQpu, fabricante: fabricanteQpu, modelo: modeloQpu,
          tecnologia: tecnologiaQpu, data_instalacao: dataInstalacaoQpu,
          status_operacional: statusQpu, id_criostato: idCriostato
        })
      });

      if (resposta.ok) {
        alert(idEditando ? "QPU updated!" : "QPU saved!");
        limparFormulario();
        const dadosAtualizados = await fetch('http://localhost:8000/api/qpus').then(res => res.json());
        setListaQpus(dadosAtualizados);
      } else {
        alert("Erro ao salvar no banco.");
      }
    } catch (erro) {
      console.error("Erro ao salvar:", erro);
    }
  }

  const handleExcluirQpu = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta QPU?")) return;

    try {
      const resposta = await fetch(`http://localhost:8000/api/qpus/${id}`, { method: 'DELETE' });
      if (resposta.ok) {
        setListaQpus(listaQpus.filter(qpu => qpu.id_qpu !== id));
      } else {
        alert("Erro ao excluir.");
      }
    } catch (erro) {
      console.error("Erro ao excluir:", erro);
    }
  }

  // ============== REQUISITOS DE BUSCA (EFFECTS) ==============
  
  // 1. Carrega as QPUs na inicialização
  useEffect(() => {
    fetch('http://localhost:8000/api/qpus')
      .then(res => res.json())
      .then(dados => {
        setListaQpus(dados);
        if (dados.length > 0) setQpuSelecionada(dados[0].id_qpu);
      })
      .catch(err => console.error(err));
  }, []);

  // 2. Monitora mudanças de aba ou seleção de hardware
  useEffect(() => {
    if (telaAtual === 'dashboard' && qpuSelecionada) {
      fetch(`http://localhost:8000/api/dashboard/qubits/${qpuSelecionada}`)
        .then(res => res.json())
        .then(dados => setDadosDashQubits(dados))
        .catch(err => console.error(err));

      fetch(`http://localhost:8000/api/dashboard/ambiente/${qpuSelecionada}`)
        .then(res => res.json())
        .then(dados => setDadosDashAmbiente(dados))
        .catch(err => console.error(err));
    }

    if (telaAtual === 'relatorios') {
      fetch('http://localhost:8000/api/relatorios/t1').then(res => res.json()).then(dados => setDadosT1(dados)).catch(err => console.error(err));
      fetch('http://localhost:8000/api/relatorios/fidelidade').then(res => res.json()).then(dados => setDadosFidelidade(dados)).catch(err => console.error(err));
      fetch('http://localhost:8000/api/relatorios/temperatura').then(res => res.json()).then(dados => setDadosTemperatura(dados)).catch(err => console.error(err));
    }
    
    if (telaAtual === 'qpus') {
      fetch('http://localhost:8000/api/qpus').then(res => res.json()).then(dados => setListaQpus(dados)).catch(err => console.error(err));
    }
  }, [telaAtual, qpuSelecionada]);

  // Auxiliar para ler as métricas calculadas no banco para os Cards
  const encontrarMetrica = (nome) => {
    const metrica = dadosDashQubits.metricas.find(m => m.nome_metrica === nome);
    return metrica ? Number(metrica.media) : null;
  };

  return (
    <div className="layout">
      <Sidebar telaAtual={telaAtual} setTelaAtual={setTelaAtual} />

      <main className="main">
        {/* ================= TELA: DASHBOARD ================= */}
        {telaAtual === 'dashboard' && (
          <>
            <div className="topbar">
              <div>
                <h1>Dashboard</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Visão geral do estado da QPU e dos qubits</p>
              </div>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                {/* SELECT DINÂMICO CONECTADO AO BANCO */}
                <select 
                  value={qpuSelecionada}
                  onChange={(e) => setQpuSelecionada(e.target.value)}
                  style={{ padding: '8px 12px', background: 'var(--bg-panel)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                >
                  {listaQpus.map(qpu => (
                    <option key={qpu.id_qpu} value={qpu.id_qpu}>QPU: {qpu.nome} ({qpu.modelo})</option>
                  ))}
                </select>
                <div style={{ padding: '8px 12px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)' }}>
                  01/05/2026 - 08/05/2026
                </div>
              </div>
            </div>

            {/* CARDS DINÂMICOS CORRIGIDOS */}
            <div className="cards">
              <MetricCard 
                title="Qubits Ativos" 
                value={`${dadosDashQubits.mapa.filter(q => q.status_operacional !== 'Inativo').length} / ${dadosDashQubits.mapa.length || 0}`} 
              />
              <MetricCard 
                title="Fidelidade Média (1Q)" 
                value={dadosDashQubits.fidelidades?.find(f => f.numero_qubits_alvo === 1) 
                  ? `${(Number(dadosDashQubits.fidelidades.find(f => f.numero_qubits_alvo === 1).media) * 100).toFixed(2)}%` 
                  : '---'} 
              />
              <MetricCard 
                title="Fidelidade Média (2Q)" 
                value={dadosDashQubits.fidelidades?.find(f => f.numero_qubits_alvo === 2) 
                  ? `${(Number(dadosDashQubits.fidelidades.find(f => f.numero_qubits_alvo === 2).media) * 100).toFixed(2)}%` 
                  : '---'} 
              />
              <MetricCard 
                title="Tempo de Coerência T1 (médio)" 
                value={encontrarMetrica('T1') ? `${encontrarMetrica('T1').toFixed(1)} μs` : '---'} 
              />
              <MetricCard 
                title="Taxa de Erro de Leitura" 
                value={encontrarMetrica('TaxaErro') ? `${(encontrarMetrica('TaxaErro') * 100).toFixed(2)}%` : '---'} 
              />
            </div>

            <div className="middle">
              {/* MAPA DE QUBITS CORRIGIDO PASSANDO PROPS */}
              <div className="panel">
                <h3 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Mapa de Qubits</h3>
                <Heatmap qubits={dadosDashQubits.mapa} />
              </div>
              <div className="panel"><h3 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Fidelidade de Portas</h3><div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px' }}><FidelityChart /></div></div>
              <div className="panel"><h3 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Erro de Leitura</h3><div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px' }}><ReadoutChart /></div></div>
            </div>
          
            <div className="bottom">
              <div className="panel" style={{ overflowX: 'auto' }}>
                <h3 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Experimentos Recentes</h3>
                <ExperimentTable />
              </div>

              <div className="panel">
                 <h3 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Alertas Ativos</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ padding: '12px', borderLeft: '3px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '0 8px 8px 0' }}>
                       <strong style={{ color: '#ef4444' }}>Qubit 13</strong>
                       <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Taxa de erro de leitura acima do limite</p>
                    </div>
                    <div style={{ padding: '12px', borderLeft: '3px solid #eab308', background: 'rgba(234, 179, 8, 0.05)', borderRadius: '0 8px 8px 0' }}>
                       <strong style={{ color: '#eab308' }}>Qubit 17</strong>
                       <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Fidelidade de porta 2Q abaixo do esperado</p>
                    </div>
                 </div>
              </div>

              {/* CONDIÇÕES DO CRIOSTATO DINÂMICAS */}
              <div className="panel">
                <h3 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Condições do Ambiente</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '15px', color: 'var(--text-muted)' }}>
                   <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                     <span>Temperatura</span> 
                     <strong style={{ color: 'var(--text-main)' }}>{Number(dadosDashAmbiente.temperatura).toFixed(1)} K</strong>
                   </li>
                   <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                     <span>Pressão</span> 
                     <strong style={{ color: 'var(--text-main)' }}>{Number(dadosDashAmbiente.pressao).toFixed(2)} mTorr</strong>
                   </li>
                   <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <span>Vibração (RMS)</span> 
                     <strong style={{ color: 'var(--text-main)' }}>{Number(dadosDashAmbiente.vibracao).toFixed(2)} μm/s</strong>
                   </li>
                </ul>
              </div>
            </div>
          </>
        )}

        {/* ================= TELA: RELATÓRIOS ACADÊMICOS ================= */}
        {telaAtual === 'relatorios' && (
          <div style={{ padding: '20px', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div>
              <h1 style={{ color: 'var(--text-main)' }}>Consultas Acadêmicas</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Resultados estruturados e representações gráficas das consultas do Item 6.</p>
            </div>

            {/* CONSULTA 1 */}
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ color: 'var(--text-main)' }}>Consulta 1: Evolução Diária do Tempo de Coerência (T1)</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                    <strong style={{ color: 'var(--text-main)' }}>Objetivo:</strong> Monitorar a degradação física do hardware comparando o T1 médio por processador e mapeando o qubit mais instável do dia. Envolve as tabelas <em>MedeQubit</em>, <em>Qubit</em> e <em>QPU</em>.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filtrar Hardware:</span>
                  <select 
                    value={qpuFiltrada} 
                    onChange={(e) => setQpuFiltrada(e.target.value)}
                    style={{ padding: '6px 12px', background: 'var(--bg-main)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                  >
                    <option value="todas">Visualizar Todas (Comparativo)</option>
                    {[...new Set(dadosT1.map(d => d.qpu_nome))].map(nome => (
                      <option key={nome} value={nome}>{nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
                <div style={{ flex: '1 1 45%', height: '280px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-panel)', zIndex: 1 }}>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <th style={{ padding: '10px' }}>Data</th>
                        <th style={{ padding: '10px' }}>QPU</th>
                        <th style={{ padding: '10px' }}>Média T1</th>
                        <th style={{ padding: '10px', color: '#f87171' }}>Qubit Crítico (Pior T1)</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {dadosT1
                        .filter(row => qpuFiltrada === 'todas' || row.qpu_nome === qpuFiltrada)
                        .map((row, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '10px' }}>{new Date(row.data).toLocaleDateString('pt-BR')}</td>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.qpu_nome}</td>
                            <td style={{ padding: '10px' }}>{Number(row.media_t1).toFixed(1)} μs</td>
                            <td style={{ padding: '10px', color: '#f87171' }}>
                              ID #{row.pior_qubit_id} ({Number(row.pior_valor_t1).toFixed(1)} μs)
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ flex: '1 1 50%', height: '280px', background: 'var(--bg-main)', padding: '15px 10px 5px 10px', borderRadius: '8px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={
                        qpuFiltrada !== 'todas' 
                          ? dadosT1.filter(d => d.qpu_nome === qpuFiltrada)
                          : Object.values(dadosT1.reduce((acc, item) => {
                              const dataStr = item.data;
                              if (!acc[dataStr]) acc[dataStr] = { data: dataStr };
                              acc[dataStr][item.qpu_nome] = Number(item.media_t1).toFixed(2);
                              return acc;
                            }, {}))
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.2} />
                      <XAxis dataKey="data" stroke="var(--text-muted)" minTickGap={60} tickFormatter={(tick) => new Date(tick).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} />
                      <YAxis stroke="var(--text-muted)" domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')} />
                      <Legend />
                      {qpuFiltrada === 'todas' ? (
                        [...new Set(dadosT1.map(d => d.qpu_nome))].map((nome, idx) => (
                          <Line key={nome} type="monotone" dataKey={nome} name={nome} stroke={idx % 2 === 0 ? "var(--accent-purple)" : "#38bdf8"} strokeWidth={2} dot={false} />
                        ))
                      ) : (
                        <Line type="monotone" dataKey="media_t1" name={`Média T1 (${qpuFiltrada})`} stroke="var(--accent-purple)" strokeWidth={2} dot={false} />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* CONSULTA 2 */}
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ color: 'var(--text-main)' }}>Consulta 2: Fidelidade Média por Porta Quântica</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                    <strong style={{ color: 'var(--text-main)' }}>Objetivo:</strong> Calcular a média geral de fidelidade por operation física para avaliar se as portas de acoplamento mais complexas (2 Qubits) estão sofrendo taxas de erro maiores. Envolve as tabelas <em>MedePorta</em>, <em>PortaQuantica</em> e <em>Experimento</em>.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', background: 'var(--bg-main)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#38bdf8', borderRadius: '3px' }}></span>
                    <span style={{ color: 'var(--text-main)' }}>2 Qubits</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'var(--accent-purple)', borderRadius: '3px' }}></span>
                    <span style={{ color: 'var(--text-main)' }}>1 Qubit</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
                <div style={{ flex: '1 1 40%', height: '250px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-panel)', zIndex: 1 }}>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px' }}>Porta</th>
                        <th style={{ padding: '10px' }}>Categoria</th>
                        <th style={{ padding: '10px' }}>Fidelidade Média</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: 'var(--text-main)' }}>
                      {dadosFidelidade.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.nome_porta}</td>
                          <td style={{ padding: '10px' }}>{row.categoria}</td>
                          <td style={{ padding: '10px' }}>{(Number(row.fidelidade_media) * 100).toFixed(3)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ flex: '1 1 50%', height: '250px', background: 'var(--bg-main)', padding: '15px 10px 5px 10px', borderRadius: '8px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosFidelidade}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.2} />
                      <XAxis dataKey="nome_porta" stroke="var(--text-muted)" interval={0} style={{ fontSize: '0.75rem' }} />
                      <YAxis stroke="var(--text-muted)" domain={[0.9, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                      <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(3)}%`} />
                      <Legend />
                      <Bar dataKey="fidelidade_media" name="Fidelidade da Operação" radius={[4, 4, 0, 0]}>
                        {dadosFidelidade.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.categoria.includes('1') ? 'var(--accent-purple)' : '#38bdf8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* CONSULTA 3 */}
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h2 style={{ color: 'var(--text-main)' }}>Consulta 3: Impacto da Temperatura do Criostato na Taxa de Erro</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <strong style={{ color: 'var(--text-main)' }}>Objetivo:</strong> Avaliar se flutuações na temperatura do ambiente criogênico estão correlacionadas com o aumento da taxa média de erro de leitura dos qubits. Envolve as tabelas <em>RegistroAmbiente</em>, <em>Experimento</em> e <em>MedeQubit</em>.
              </p>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
                <div style={{ flex: '1 1 40%', height: '250px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-panel)', zIndex: 1 }}>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px' }}>Temperatura</th>
                        <th style={{ padding: '10px' }}>Taxa de Erro Média</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: 'var(--text-main)' }}>
                      {dadosTemperatura.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '10px' }}>{row.temperatura} K</td>
                          <td style={{ padding: '10px' }}>{(Number(row.taxa_erro_media) * 100).toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ flex: '1 1 50%', height: '250px', background: 'var(--bg-main)', padding: '15px 10px 5px 10px', borderRadius: '8px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosTemperatura}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.2} />
                      <XAxis dataKey="temperatura" stroke="var(--text-muted)" unit="K" />
                      <YAxis stroke="var(--text-muted)'" />
                      <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(2)}%`} />
                      <Legend />
                      <Bar dataKey="taxa_erro_media" name="Taxa de Erro Leitura" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TELA: CRUD DE QPUs ================= */}
        {telaAtual === 'qpus' && (
          <div style={{ padding: '20px', color: 'var(--text-main)' }}>
            <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Gerenciamento de QPUs</h2>
            
            <div className="panel" style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>{idEditando ? `Editando QPU #${idEditando}` : 'Cadastrar Nova QPU'}</h3>
                {idEditando && <button onClick={limparFormulario} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline' }}>Cancelar Edição</button>}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input value={nomeQpu} onChange={(e) => setNomeQpu(e.target.value)} type="text" placeholder="Nome" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <input value={fabricanteQpu} onChange={(e) => setFabricanteQpu(e.target.value)} type="text" placeholder="Fabricante" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <input value={modeloQpu} onChange={(e) => setModeloQpu(e.target.value)} type="text" placeholder="Modelo" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <input value={tecnologiaQpu} onChange={(e) => setTecnologiaQpu(e.target.value)} type="text" placeholder="Tecnologia" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <input value={dataInstalacaoQpu} onChange={(e) => setDataInstalacaoQpu(e.target.value)} type="date" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <input value={idCriostato} onChange={(e) => setIdCriostato(e.target.value)} type="number" placeholder="ID do Criostato" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                
                <select value={statusQpu} onChange={(e) => setStatusQpu(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }}>
                  <option value="Ativo">Ativo</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Inativo">Inativo</option>
                </select>

                <button onClick={handleSalvarQpu} style={{ width: '100%', padding: '10px', background: idEditando ? '#eab308' : 'var(--accent-purple)', color: idEditando ? 'black' : 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                  {idEditando ? 'Atualizar QPU' : 'Salvar'}
                </button>
              </div>
            </div>

            <div className="panel" style={{ marginTop: '20px', overflowX: 'auto' }}>
              <h3 style={{ marginBottom: '15px' }}>QPUs Cadastradas</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px' }}>ID</th>
                    <th style={{ padding: '12px' }}>Nome</th>
                    <th style={{ padding: '12px' }}>Fabricante/Modelo</th>
                    <th style={{ padding: '12px' }}>Tecnologia</th>
                    <th style={{ padding: '12px' }}>Data Inst.</th>
                    <th style={{ padding: '12px' }}>Criostato</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {listaQpus.map((qpu) => (
                    <tr key={qpu.id_qpu} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px' }}>{qpu.id_qpu}</td>
                      <td style={{ padding: '12px' }}>{qpu.nome}</td>
                      <td style={{ padding: '12px' }}>{qpu.fabricante} {qpu.modelo}</td>
                      <td style={{ padding: '12px' }}>{qpu.tecnologia}</td>
                      <td style={{ padding: '12px' }}>{qpu.data_instalacao ? new Date(qpu.data_instalacao).toLocaleDateString('pt-BR') : ''}</td>
                      <td style={{ padding: '12px' }}>{qpu.id_criostato}</td>
                      <td style={{ padding: '12px' }}>{qpu.status_operacional}</td>
                      <td>
                        <button onClick={() => preencherFormulario(qpu)} style={{ marginRight: '8px', background: 'transparent', border: '1px solid #eab308', color: '#eab308', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                        <button onClick={() => handleExcluirQpu(qpu.id_qpu)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App;