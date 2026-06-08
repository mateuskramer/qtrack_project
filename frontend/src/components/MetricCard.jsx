export default function MetricCard({ title, value, trend, isPositive }) {
  return (
    <div className="card">
      <h4>{title}</h4>
      <h2 style={{ color: 'var(--text-main)', marginTop: '8px' }}>{value}</h2>
      
      {/* Só renderiza a tendência se a prop "trend" for passada */}
      {trend && (
        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span style={{ 
            color: isPositive ? '#22c55e' : '#ef4444', 
            fontWeight: 'bold', 
            marginRight: '6px' 
          }}>
            {isPositive ? '↑' : '↓'} {trend}
          </span>
          vs período anterior
        </div>
      )}
    </div>
  )
}