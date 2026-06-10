export default function Sidebar({ telaAtual, setTelaAtual }) {
  // Função auxiliar para aplicar a classe 'active' no item selecionado
  const isActive = (tela) => telaAtual === tela ? "active" : "";

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', margin: 0 }}>
          ⚛ QTrack
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '5px' }}>
          Analisador de Saúde de Qubits
        </p>
      </div>

      <ul style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: 0, listStyle: 'none' }}>
        
        <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)', marginTop: '10px', marginBottom: '10px', letterSpacing: '1px' }}>
          MONITORAMENTO
        </div>
        <li className={isActive('dashboard')} onClick={() => setTelaAtual('dashboard')} style={{ cursor: 'pointer' }}>
  🏠 Dashboard
        </li>

        <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)', marginTop: '20px', marginBottom: '10px', letterSpacing: '1px' }}>
          GERENCIAMENTO (CRUD)
        </div>
        <li className={isActive('qpus')} onClick={() => setTelaAtual('qpus')} style={{ cursor: 'pointer' }}>💻 QPUs</li>
        <li className={isActive('qubits')} onClick={() => setTelaAtual('qubits')} style={{ cursor: 'pointer' }}>⚛ Qubits</li>
        <li className={isActive('criostatos')} onClick={() => setTelaAtual('criostatos')} style={{ cursor: 'pointer' }}>❄️ Criostatos</li>
        <li className={isActive('pesquisadores')} onClick={() => setTelaAtual('pesquisadores')} style={{ cursor: 'pointer' }}>👩‍🔬 Pesquisadores</li>
        <li className={isActive('experimentos')} onClick={() => setTelaAtual('experimentos')} style={{ cursor: 'pointer' }}>🧪 Experimentos</li>
        <li className={isActive('calibracoes')} onClick={() => setTelaAtual('calibracoes')} style={{ cursor: 'pointer' }}>🔧 Calibrações</li>

        <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)', marginTop: '20px', marginBottom: '10px', letterSpacing: '1px' }}>
          CONSULTAS ACADÊMICAS
        </div>
        <li className={isActive('relatorios')} onClick={() => setTelaAtual('relatorios')} style={{ cursor: 'pointer' }}>📊 Relatórios</li>

        <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)', marginTop: '20px', marginBottom: '10px', letterSpacing: '1px' }}>
          MANUTENÇÃO DO BANCO
        </div>
        <li className={isActive('configuracoes')} onClick={() => setTelaAtual('configuracoes')} style={{ cursor: 'pointer' }}>⚙️ Configurações</li>

        <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)', marginTop: '20px', marginBottom: '10px', letterSpacing: '1px' }}>
          ASSISTENTE DE IA
        </div>
        <li className={isActive('copilot')} onClick={() => setTelaAtual('copilot')} style={{ cursor: 'pointer' }}>🤖 Copilot QTrack</li>

      </ul>
    </aside>
  )
}