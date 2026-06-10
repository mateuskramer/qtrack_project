import { useState, useEffect } from 'react'
import './App.css'

import Sidebar from './components/Sidebar'
import MetricCard from './components/MetricCard'
import Heatmap from './components/Heatmap'
import ExperimentTable from './components/ExperimentTable'
import FidelityChart from './components/FidelityChart'
import ReadoutChart from './components/ReadoutChart'

function App() {
  // Estado que controla qual página está visível na tela
  const [telaAtual, setTelaAtual] = useState('dashboard')
  
  // Estado para armazenar os dados vindos do PostgreSQL
  const [listaQpus, setListaQpus] = useState([])

  // Faz a requisição para a sua API (backend) assim que o usuário clica na aba 'qpus'
  useEffect(() => {
    if (telaAtual === 'qpus') {
      fetch('http://localhost:8000/api/qpus')
        .then(resposta => resposta.json())
        .then(dados => setListaQpus(dados))
        .catch(erro => console.error("Erro ao buscar dados:", erro))
    }
  }, [telaAtual])

  return (
    <div className="layout">
      {/* Passamos o estado e o alterador para a Sidebar */}
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '10px' }}>
                   <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                     MV
                   </div>
                   <div>
                     <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Administrador</div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pesquisadora</div>
                   </div>
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
              <div className="panel">
                 <h3 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Mapa de Qubits</h3>
                 <Heatmap />
              </div>

              <div className="panel">
                <h3 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Fidelidade de Portas (Média)</h3>
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                   <FidelityChart />
                </div>
              </div>

              <div className="panel">
                <h3 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Taxa de Erro de Leitura</h3>
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                   <ReadoutChart />
                </div>
              </div>
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

        {/* ================= TELA: RELATÓRIOS ACADÊMICOS ================= */}
        {telaAtual === 'relatorios' && (
          <div style={{ padding: '20px', color: 'white' }}>
            <h1>Consultas Acadêmicas</h1>
            <p style={{ color: 'var(--text-muted)' }}>Execute as queries exigidas no item 6 do projeto.</p>
            {/* O conteúdo interativo dos relatórios entrará aqui */}
          </div>
        )}

        {/* ================= TELA: CRUD DE QPUs ================= */}
        {telaAtual === 'qpus' && (
          <div style={{ padding: '20px', color: 'var(--text-main)' }}>
            <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              Gerenciamento de QPUs
            </h2>
            
            {/* Formulário de Inserção */}
            <div className="panel" style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '15px' }}>Cadastrar Nova QPU</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input type="text" placeholder="Nome (ex: QPU-01)" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: 1 }} />
                <input type="text" placeholder="Fabricante" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: 1 }} />
                <input type="text" placeholder="Modelo" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white', flex: 1 }} />
                <button style={{ padding: '10px 20px', background: 'var(--accent-purple)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Salvar
                </button>
              </div>
            </div>

            {/* Tabela de Listagem Dinâmica */}
            <div className="panel" style={{ marginTop: '20px', overflowX: 'auto' }}>
              <h3 style={{ marginBottom: '15px' }}>QPUs Cadastradas</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px' }}>ID</th>
                    <th style={{ padding: '12px' }}>Nome</th>
                    <th style={{ padding: '12px' }}>Fabricante</th>
                    <th style={{ padding: '12px' }}>Modelo</th>
                    <th style={{ padding: '12px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Loop que cria uma linha na tabela para cada QPU recebida do backend */}
                  {listaQpus.map((qpu) => (
                    <tr key={qpu.id_qpu} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px' }}>{qpu.id_qpu}</td>
                      <td style={{ padding: '12px' }}>{qpu.nome}</td>
                      <td style={{ padding: '12px' }}>{qpu.fabricante}</td>
                      <td style={{ padding: '12px' }}>{qpu.modelo}</td>
                      <td style={{ padding: '12px' }}>
                        <button style={{ marginRight: '8px', background: 'transparent', border: '1px solid #eab308', color: '#eab308', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                        <button style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Excluir</button>
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