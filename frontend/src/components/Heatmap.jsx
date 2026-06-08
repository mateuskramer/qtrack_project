export default function Heatmap() {
  // Gerando 31 qubits e simulando os estados da sua imagem
  const qubits = Array.from({ length: 31 }, (_, i) => {
    if ([13, 27].includes(i)) return 'critical';
    if ([5, 17, 24].includes(i)) return 'warning';
    return 'healthy'; // Futuramente você pode mapear os inativos
  });

  const getStyle = (status) => {
    const colors = {
      healthy: '#22c55e',
      warning: '#f59e0b',
      critical: '#ef4444',
      inactive: '#4b5563'
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
        {qubits.map((status, index) => (
          <div
            key={index}
            className="cell"
            style={getStyle(status)}
          >
            {index}
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
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }}></div> Saudável
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></div> Atenção
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div> Crítico
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4b5563' }}></div> Inativo
        </div>
      </div>
    </div>
  )
}