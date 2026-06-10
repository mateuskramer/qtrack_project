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
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

function App() {
  const [telaAtual, setTelaAtual] = useState('dashboard')
  const [listaQpus, setListaQpus] = useState([])

  // Estados para armazenar os dados dos relatórios
  const [dadosT1, setDadosT1] = useState([])
  const [dadosFidelidade, setDadosFidelidade] = useState([])
  const [dadosTemperatura, setDadosTemperatura] = useState([])

  // Estados do formulário de QPU
  const [nomeQpu, setNomeQpu] = useState('')
  const [fabricanteQpu, setFabricanteQpu] = useState('')
  const [modeloQpu, setModeloQpu] = useState('')
  const [tecnologiaQpu, setTecnologiaQpu] = useState('')
  const [dataInstalacaoQpu, setDataInstalacaoQpu] = useState('')
  const [statusQpu, setStatusQpu] = useState('Ativo')
  const [idCriostato, setIdCriostato] = useState('')
  const [idEditando, setIdEditando] = useState(null)

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
        alert(idEditando ? "QPU atualizada com sucesso!" : "QPU salva com sucesso!");
        limparFormulario();
        const dadosAtualizados = await fetch('http://localhost:8000/api/qpus').then(res => res.json());
        setListaQpus(dadosAtualizados);
      } else {
        alert("Erro ao salvar no banco de dados.");
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
        alert("Erro ao excluir no banco de dados.");
      }
    } catch (erro) {
      console.error("Erro ao excluir:", erro);
    }
  }

  // Monitora a troca de abas para buscar os dados corretos
  useEffect(() => {
    if (telaAtual === 'qpus') {
      fetch('http://localhost:8000/api/qpus')
        .then(res => res.json())
        .then(dados => setListaQpus(dados))
        .catch(err => console.error(err))
    }

    if (telaAtual === 'relatorios') {
      // Busca Consulta 1
      fetch('http://localhost:8000/api/relatorios/t1')
        .then(res => res.json())
        .then(dados => setDadosT1(dados))
        .catch(err => console.error(err))

      // Busca Consulta 2
      fetch('http://localhost:8000/api/relatorios/fidelidade')
        .then(res => res.json())
        .then(dados => setDadosFidelidade(dados))
        .catch(err => console.error(err))

      // Busca Consulta 3
      fetch('http://localhost:8000/api/relatorios/temperatura')
        .then(res => res.json())
        .then(dados => setDadosTemperatura(dados))
        .catch(err => console.error(err))
    }
  }, [telaAtual])

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
                <select style={{ padding: '8px 12px', background: 'var(--bg-panel)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <option>QPU: QPU-01 (SuperCond-X)</option>
                </select>
                <div style={{ padding: '8px 12px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)' }}>
                  01/05/2026 - 08/05/2026
                </div>
              </div>
            </div>

            <div className="cards">
              <MetricCard title="Qubits Ativos" value="27 / 31" />
              <MetricCard title="Fidelidade Média (1Q)" value="99.23%" />
              <MetricCard title="Fidelidade Média (2Q)" value="97.41%" />
              <MetricCard title="Tempo de Coerência T1 (médio)" value="83.7 μs" />
              <MetricCard title="Taxa de Erro de Leitura" value="1.23%" />
            </div>

            <div className="middle">
              <div className="panel"><h3 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Mapa de Qubits</h3><Heatmap /></div>
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

              <div className="panel">
                <h3 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Condições do Ambiente</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '15px', color: 'var(--text-muted)' }}>
                   <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}><span>Temperatura (mK)</span> <strong style={{ color: 'var(--text-main)' }}>11.2 mK</strong></li>
                   <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}><span>Pressão (mTorr)</span> <strong style={{ color: 'var(--text-main)' }}>2.1 mTorr</strong></li>
                   <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Vibração (RMS)</span> <strong style={{ color: 'var(--text-main)' }}>1.3 μm/s</strong></li>
                </ul>
              </div>
            </div>
          </>
          
        )}

        {/* ================= TELA: RELATÓRIOS ACADÊMICOS (ITEM 6) ================= */}
        {telaAtual === 'relatorios' && (
          <div style={{ padding: '20px', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div>
              <h1>Consultas Acadêmicas</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Resultados estruturados e representações gráficas das consultas do Item 6.</p>
            </div>

            {/* CONSULTA 1 */}
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h2>Consulta 1: Evolução Diária do Tempo de Coerência (T1)</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <strong>Objetivo:</strong> Obter a média diária do tempo de coerência (T1) dos qubits para identificar degradações físicas no processador quântico. Envolve as tabelas <em>MedeQubit</em>, <em>Qubit</em> e <em>TipoMetrica</em>.
              </p>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
                <div style={{ flex: '1 1 40%', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px' }}>Data</th>
                        <th style={{ padding: '10px' }}>Média T1 (μs)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dadosT1.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '10px' }}>{new Date(row.data).toLocaleDateString('pt-BR')}</td>
                          <td style={{ padding: '10px' }}>{Number(row.media_t1).toFixed(2)} μs</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ flex: '1 1 50%', height: '250px', background: 'var(--bg-main)', padding: '10px', borderRadius: '8px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dadosT1}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <XAxis dataKey="data" stroke="var(--text-muted)" tickFormatter={(tick) => new Date(tick).toLocaleDateString('pt-BR')} />
                      <YAxis stroke="var(--text-muted)" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="media_t1" name="Média T1" stroke="var(--accent-purple)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* CONSULTA 2 */}
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h2>Consulta 2: Fidelidade Média por Categoria de Porta Quântica</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <strong>Objetivo:</strong> Calcular a média geral de fidelidade agrupada pelo número de qubits alvo da porta (1 Qubit vs. 2 Qubits) para avaliar o impacto do acoplamento técnico. Envolve as tabelas <em>MedePorta</em>, <em>PortaQuantica</em> e <em>TipoMetrica</em>.
              </p>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
                <div style={{ flex: '1 1 40%', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px' }}>Categoria</th>
                        <th style={{ padding: '10px' }}>Fidelidade Média</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dadosFidelidade.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '10px' }}>{row.categoria}</td>
                          <td style={{ padding: '10px' }}>{(Number(row.fidelidade_media) * 100).toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ flex: '1 1 50%', height: '250px', background: 'var(--bg-main)', padding: '10px', borderRadius: '8px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosFidelidade}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <XAxis dataKey="categoria" stroke="var(--text-muted)" />
                      <YAxis stroke="var(--text-muted)" domain={[0, 1]} />
                      <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(2)}%`} />
                      <Legend />
                      <Bar dataKey="fidelidade_media" name="Fidelidade" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* CONSULTA 3 */}
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h2>Consulta 3: Impacto da Temperatura do Criostato na Taxa de Erro</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <strong>Objetivo:</strong> Avaliar se flutuações na temperatura do ambiente criogênico estão correlacionadas com o aumento da taxa média de erro de leitura dos qubits. Envolve as tabelas <em>RegistroAmbiente</em>, <em>Experimento</em> e <em>MedeQubit</em>.
              </p>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
                <div style={{ flex: '1 1 40%', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px' }}>Temperatura</th>
                        <th style={{ padding: '10px' }}>Taxa de Erro Média</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dadosTemperatura.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '10px' }}>{row.temperatura} K</td>
                          <td style={{ padding: '10px' }}>{(Number(row.taxa_erro_media) * 100).toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ flex: '1 1 50%', height: '250px', background: 'var(--bg-main)', padding: '10px', borderRadius: '8px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosTemperatura}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <XAxis dataKey="temperatura" stroke="var(--text-muted)" unit="K" />
                      <YAxis stroke="var(--text-muted)" />
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
            <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              Gerenciamento de QPUs
            </h2>
            
            <div className="panel" style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>{idEditando ? `Editando QPU #${idEditando}` : 'Cadastrar Nova QPU'}</h3>
                {idEditando && <button onClick={limparFormulario} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline' }}>Cancelar Edição</button>}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input value={nomeQpu} onChange={(e) => setNomeQpu(e.target.value)} type="text" placeholder="Nome (ex: QPU-01)" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <input value={fabricanteQpu} onChange={(e) => setFabricanteQpu(e.target.value)} type="text" placeholder="Fabricante" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <input value={modeloQpu} onChange={(e) => setModeloQpu(e.target.value)} type="text" placeholder="Modelo" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <input value={tecnologiaQpu} onChange={(e) => setTecnologiaQpu(e.target.value)} type="text" placeholder="Tecnologia (ex: Supercondutor)" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <input value={dataInstalacaoQpu} onChange={(e) => setDataInstalacaoQpu(e.target.value)} type="date" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                <input value={idCriostato} onChange={(e) => setIdCriostato(e.target.value)} type="number" placeholder="ID do Criostato (ex: 1)" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: '1 1 30%' }} />
                
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
                      <td style={{ padding: '12px' }}>
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

export default App