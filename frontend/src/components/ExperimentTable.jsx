export default function ExperimentTable({ experimentos = [], onVerDetalhes }) {
  const list = experimentos && experimentos.length > 0
    ? experimentos.map(exp => ({
        id: exp.id_experimento,
        nome: exp.nome,
        status: exp.status_execucao,
        data: exp.data_inicio,
        pesquisador: exp.pesquisador_nome || 'N/A',
        temp: exp.temperatura !== null && exp.temperatura !== undefined ? `${Number(exp.temperatura).toFixed(4)} K` : '---',
        pressao: exp.pressao !== null && exp.pressao !== undefined ? `${Number(exp.pressao).toFixed(2)} mTorr` : '---',
        vibracao: exp.vibracao !== null && exp.vibracao !== undefined ? `${Number(exp.vibracao).toFixed(2)} µm/s` : '---'
      }))
    : [
        { id: 1, nome: 'Randomized Benchmarking', status: 'Concluído', data: '05/05/2026 14:30', pesquisador: 'Dr. Alice', temp: '0.1 K', pressao: '0.80 mTorr', vibracao: '0.05 µm/s' },
        { id: 2, nome: 'T1 Characterization', status: 'Executando', data: '08/05/2026 09:15', pesquisador: 'Bob', temp: '0.2 K', pressao: '0.90 mTorr', vibracao: '0.08 µm/s' },
        { id: 3, nome: 'Gate Tomography', status: 'Planejado', data: '10/05/2026 --:--', pesquisador: 'Dr. Alice', temp: '---', pressao: '---', vibracao: '---' }
      ];

  return (
    <div className="panel experiments" style={{ width: '100%' }}>
      <h2>Últimos Experimentos</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'left' }}>
            <th style={{ padding: '8px' }}>ID</th>
            <th style={{ padding: '8px' }}>Experimento</th>
            <th style={{ padding: '8px' }}>Pesquisador</th>
            <th style={{ padding: '8px' }}>Data Início</th>
            <th style={{ padding: '8px' }}>Temp</th>
            <th style={{ padding: '8px' }}>Pressão</th>
            <th style={{ padding: '8px' }}>Vibração</th>
            <th style={{ padding: '8px' }}>Status</th>
            <th style={{ padding: '8px' }}>Ações</th>
          </tr>
        </thead>
        <tbody style={{ fontSize: '0.9rem' }}>
          {list.map(exp => (
            <tr key={exp.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '8px' }}>{exp.id}</td>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>{exp.nome}</td>
              <td style={{ padding: '8px' }}>{exp.pesquisador}</td>
              <td style={{ padding: '8px' }}>{exp.data}</td>
              <td style={{ padding: '8px' }}>{exp.temp}</td>
              <td style={{ padding: '8px' }}>{exp.pressao}</td>
              <td style={{ padding: '8px' }}>{exp.vibracao}</td>
              <td style={{ padding: '8px' }}>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  background: exp.status === 'Concluído' ? 'rgba(34, 197, 94, 0.1)' : exp.status === 'Executando' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: exp.status === 'Concluído' ? '#22c55e' : exp.status === 'Executando' ? '#3b82f6' : '#f59e0b'
                }}>
                  {exp.status}
                </span>
              </td>
              <td style={{ padding: '8px' }}>
                <button 
                  onClick={() => onVerDetalhes && onVerDetalhes(exp.id)} 
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--accent-purple)',
                    color: 'var(--accent-purple)',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                >
                  Detalhes
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}