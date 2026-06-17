import React from 'react';

export default function CopilotHistory({ 
  conversations, 
  setConversations, 
  activeConvId, 
  setActiveConvId, 
  setTelaAtual 
}) {

  const handleOpenConversation = (id) => {
    setActiveConvId(id);
    setTelaAtual('copilot');
  };

  const handleCreateNewConversation = () => {
    const newId = Date.now().toString();
    const newConv = {
      id: newId,
      title: `Nova Conversa ${conversations.length + 1}`,
      messages: [
        {
          role: 'assistant',
          text: 'Olá! Criei uma nova aba de conversa para você. Pergunte-me qualquer coisa sobre o banco de dados do laboratório!'
        }
      ]
    };
    setConversations(prev => [...prev, newConv]);
    setActiveConvId(newId);
    setTelaAtual('copilot');
  };

  const handleDeleteConversation = (idToDelete, e) => {
    e.stopPropagation();
    
    if (conversations.length === 1) {
      alert("Você precisa manter pelo menos uma conversa aberta!");
      return;
    }

    if (!window.confirm("Deseja realmente apagar esta conversa do histórico?")) {
      return;
    }

    const updated = conversations.filter(c => c.id !== idToDelete);
    setConversations(updated);

    if (activeConvId === idToDelete) {
      setActiveConvId(updated[0].id);
    }
  };

  const getFormattedDate = (id) => {
    if (id === 'default') return 'Sessão Inicial';
    try {
      const timestamp = parseInt(id);
      if (isNaN(timestamp)) return 'Data Indisponível';
      return new Date(timestamp).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Data Indisponível';
    }
  };

  return (
    <div style={{ padding: '25px', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            📂 Histórico de Chats do Copilot
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Retome ou gerencie suas interações e análises de banco de dados do Copilot QTrack.
          </p>
        </div>
        <button
          onClick={handleCreateNewConversation}
          style={{
            padding: '10px 20px',
            background: 'var(--accent-purple)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          ➕ Iniciar Novo Chat
        </button>
      </div>

      {/* Grid of Conversations */}
      {conversations.length === 0 ? (
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 20px', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', marginBottom: '15px' }}>💬</span>
          <h3>Nenhum chat salvo</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', fontSize: '0.9rem', marginTop: '5px' }}>
            Você ainda não tem chats ativos ou apagou o histórico.
          </p>
          <button
            onClick={handleCreateNewConversation}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid var(--accent-purple)',
              color: 'var(--text-main)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Começar Agora
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
          marginTop: '10px'
        }}>
          {conversations.map(conv => {
            const lastMessage = conv.messages[conv.messages.length - 1];
            const isCurrentActive = conv.id === activeConvId;
            const userMsgCount = conv.messages.filter(m => m.role === 'user').length;

            return (
              <div
                key={conv.id}
                onClick={() => handleOpenConversation(conv.id)}
                className="panel"
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: isCurrentActive ? '1px solid var(--accent-purple)' : '1px solid var(--border-color)',
                  background: isCurrentActive ? 'rgba(168, 85, 247, 0.04)' : 'var(--bg-panel)',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '15px',
                  transition: 'all 0.3s ease',
                  boxShadow: isCurrentActive ? '0 0 15px rgba(168, 85, 247, 0.12)' : 'none'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'var(--accent-purple)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(168, 85, 247, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = isCurrentActive ? 'var(--accent-purple)' : 'var(--border-color)';
                  e.currentTarget.style.boxShadow = isCurrentActive ? '0 0 15px rgba(168, 85, 247, 0.12)' : 'none';
                }}
              >
                <div>
                  {/* Top Info inside Card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      background: 'rgba(168, 85, 247, 0.15)', 
                      color: '#c084fc', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontWeight: 'bold' 
                    }}>
                      {userMsgCount} {userMsgCount === 1 ? 'pergunta' : 'perguntas'}
                    </span>
                    {isCurrentActive && (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: '#22c55e', 
                        background: 'rgba(34, 197, 94, 0.15)', 
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        fontWeight: 'bold',
                        border: '1px solid rgba(34, 197, 94, 0.2)'
                      }}>
                        Chat Ativo
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h4 style={{ 
                    margin: '5px 0 10px 0', 
                    fontSize: '1.05rem', 
                    fontWeight: 'bold',
                    color: 'var(--text-main)',
                    lineHeight: '1.4',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    💬 {conv.title}
                  </h4>

                  {/* Last message preview */}
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--text-muted)', 
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: '1.4'
                  }}>
                    {lastMessage ? (
                      <strong>{lastMessage.role === 'user' ? 'Você: ' : 'Copilot: '}</strong>
                    ) : ''}
                    {lastMessage ? lastMessage.text : 'Sem mensagens'}
                  </p>
                </div>

                {/* Footer Buttons inside Card */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginTop: '10px', 
                  paddingTop: '12px', 
                  borderTop: '1px solid rgba(255,255,255,0.06)' 
                }}>
                  <span style={{ 
                    fontSize: '0.72rem', 
                    color: 'var(--text-muted)' 
                  }}>
                    {getFormattedDate(conv.id)}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenConversation(conv.id);
                      }}
                      style={{
                        padding: '6px 12px',
                        background: 'transparent',
                        border: '1px solid var(--accent-purple)',
                        color: 'white',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'var(--accent-purple)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      Continuar ➔
                    </button>
                    <button
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      style={{
                        padding: '6px 10px',
                        background: 'transparent',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                      title="Apagar conversa"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
