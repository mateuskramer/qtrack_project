export default function Sidebar({ telaAtual, setTelaAtual, collapsed, setCollapsed }) {
  // Função auxiliar para aplicar a classe 'active' no item selecionado
  const isActive = (tela) => telaAtual === tela ? "active" : "";

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', category: 'MONITORAMENTO' },
    
    { id: 'qpus', label: 'QPUs', icon: '💻', category: 'GERENCIAMENTO (CRUD)' },
    { id: 'qubits', label: 'Qubits', icon: '⚛', category: 'GERENCIAMENTO (CRUD)' },
    { id: 'criostatos', label: 'Criostatos', icon: '❄️', category: 'GERENCIAMENTO (CRUD)' },
    { id: 'pesquisadores', label: 'Pesquisadores', icon: '👩‍🔬', category: 'GERENCIAMENTO (CRUD)' },
    { id: 'experimentos', label: 'Experimentos', icon: '🧪', category: 'GERENCIAMENTO (CRUD)' },
    { id: 'calibracoes', label: 'Calibrações', icon: '🔧', category: 'GERENCIAMENTO (CRUD)' },
    
    { id: 'relatorios', label: 'Relatórios', icon: '📊', category: 'CONSULTAS ACADÊMICAS' },
    
    { id: 'configuracoes', label: 'Configurações', icon: '⚙️', category: 'MANUTENÇÃO DO BANCO' },
    
    { id: 'copilot', label: 'Copilot QTrack', icon: '🤖', category: 'ASSISTENTE DE IA' }
  ];

  return (
    <aside 
      className="sidebar"
      style={{
        width: collapsed ? '80px' : '260px',
        padding: collapsed ? '24px 10px' : '24px',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Cabeçalho com Botão Collapse */}
      <div style={{ 
        display: 'flex', 
        justifyContent: collapsed ? 'center' : 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px'
      }}>
        {!collapsed && (
          <div>
            <h2 style={{ color: 'var(--text-main)', fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚛️ <span style={{ whiteSpace: 'nowrap' }}>QTrack</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '3px', marginBottom: 0 }}>
              Saúde de Qubits
            </p>
          </div>
        )}
        {collapsed && (
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', margin: 0, textAlign: 'center' }}>
            ⚛️
          </h2>
        )}
        
        <button 
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            padding: '6px 8px',
            fontSize: '0.85rem',
            marginLeft: collapsed ? '0' : '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          title={collapsed ? "Expandir Menu" : "Recolher Menu"}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: 0, listStyle: 'none', margin: 0 }}>
        {menuItems.map((item, index) => {
          const isFirstInCategory = index === 0 || menuItems[index - 1].category !== item.category;
          const active = isActive(item.id);
          
          return (
            <div key={item.id}>
              {isFirstInCategory && (
                <div style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 'bold', 
                  color: 'var(--text-muted)', 
                  marginTop: collapsed ? '15px' : '20px', 
                  marginBottom: '8px', 
                  letterSpacing: '1px',
                  textAlign: collapsed ? 'center' : 'left',
                  borderBottom: collapsed ? '1px solid var(--border-color)' : 'none',
                  paddingBottom: collapsed ? '8px' : '0',
                  opacity: collapsed ? 0.5 : 0.8,
                  textTransform: 'uppercase',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {!collapsed ? item.category : ''}
                </div>
              )}
              <li 
                className={active} 
                onClick={() => setTelaAtual(item.id)} 
                title={item.label}
                style={{ 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: collapsed ? '0' : '12px',
                  padding: collapsed ? '12px 0' : '12px 16px',
                  transition: 'all 0.2s',
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  marginBottom: '4px'
                }}
              >
                <span style={{ fontSize: '1.1rem', display: 'inline-block' }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </li>
            </div>
          );
        })}
      </ul>
    </aside>
  )
}