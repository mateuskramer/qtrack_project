export default function Heatmap({ qubits = [] }) {
  if (!qubits || qubits.length === 0) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "120px",
        color: "#94a3b8",
        fontSize: "14px"
      }}>
        Sem qubits cadastrados nesta QPU.
      </div>
    );
  }

  const list = qubits.map(q => {
    let status = 'healthy';
    const st = q.status_operacional || q.status_qubit;
    if (st === 'Atenção' || st === 'warning') status = 'warning';
    else if (st === 'Inativo' || st === 'inactive' || st === 'Crítico' || st === 'critical') status = 'inactive';
    return { index: q.indice_qubit, status };
  });

  const getStyle = (status) => {
    const colors = {
      healthy: '#22c55e',
      warning: '#f59e0b',
      inactive: '#ef4444'
    };
    
    return {
      border: `2px solid ${colors[status]}`,
      color: colors[status],
      background: 'transparent'
    };
  };

  return (
    <div>
      <div className="heatmap" style={{ gap: '10px', padding: '10px 0' }}>
        {list.map((item, index) => (
          <div
            key={index}
            className="cell"
            style={getStyle(item.status)}
          >
            {item.index}
          </div>
        ))}
      </div>

      {/* Legenda */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '15px', 
        marginTop: '25px', 
        fontSize: '0.8rem', 
        color: 'var(--text-muted)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }}></div> Ativo
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></div> Atenção
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div> Inativo
        </div>
      </div>
    </div>
  )
}