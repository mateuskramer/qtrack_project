export default function Sidebar() {
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

      <ul style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <li className="active">🏠 Dashboard</li>

        <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)', marginTop: '20px', marginBottom: '10px', letterSpacing: '1px' }}>
          MONITORAMENTO
        </div>
        <li>⚛ Qubits</li>
        <li>📊 Métricas</li>
        <li>🧾 Leituras</li>
        <li>🔔 Alertas</li>

        <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)', marginTop: '20px', marginBottom: '10px', letterSpacing: '1px' }}>
          EXPERIMENTOS
        </div>
        <li>🧪 Experimentos</li>
        <li>📈 Sequências de Pulso</li>
        <li>🎛️ Portas Quânticas</li>

        <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)', marginTop: '20px', marginBottom: '10px', letterSpacing: '1px' }}>
          INFRAESTRUTURA
        </div>
        <li>💻 QPUs</li>
        <li>❄️ Criostatos</li>
        <li>🌡️ Ambiente</li>
      </ul>
    </aside>
  )
}