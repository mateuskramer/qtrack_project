import { useState, useEffect, useRef } from 'react';

export default function Copilot({
  conversations,
  setConversations,
  activeConvId,
  setActiveConvId
}) {
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('qtrack_gemini_api_key') || '');
  const [loading, setLoading] = useState(false);
  const [showKeyField, setShowKeyField] = useState(!localStorage.getItem('qtrack_gemini_api_key'));
  const [openSqlId, setOpenSqlId] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('qtrack_selected_model') || '');

  // Estado para controlar se a barra lateral de histórico do chat está colapsada
  const [chatSidebarCollapsed, setChatSidebarCollapsed] = useState(() => {
    return localStorage.getItem('qtrack_chat_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('qtrack_chat_sidebar_collapsed', chatSidebarCollapsed);
  }, [chatSidebarCollapsed]);

  const messagesEndRef = useRef(null);

  // Rola até o final das mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];
  const messages = activeConv ? activeConv.messages : [];

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Lista os modelos disponíveis para a chave informada
  useEffect(() => {
    if (apiKey) {
      fetch(`http://localhost:8000/api/copilot/models?apiKey=${apiKey}`)
        .then(res => {
          if (!res.ok) throw new Error('Falha ao listar modelos');
          return res.json();
        })
        .then(data => {
          if (data.models && data.models.length > 0) {
            setAvailableModels(data.models);
            const savedModel = localStorage.getItem('qtrack_selected_model') || '';
            const exists = data.models.some(m => m.name.includes(savedModel) || savedModel.includes(m.name));
            if (!savedModel || !exists) {
              const flashModel = data.models.find(m => m.name.toLowerCase().includes('flash'));
              const modelToSet = flashModel ? flashModel.name : data.models[0].name;
              setSelectedModel(modelToSet);
              localStorage.setItem('qtrack_selected_model', modelToSet);
            }
          }
        })
        .catch(err => {
          console.error("Erro ao carregar modelos do Gemini:", err);
          setAvailableModels([
            { name: 'models/gemini-1.5-flash', displayName: 'Gemini 1.5 Flash' },
            { name: 'models/gemini-2.0-flash', displayName: 'Gemini 2.0 Flash' },
            { name: 'models/gemini-2.5-flash', displayName: 'Gemini 2.5 Flash' },
            { name: 'models/gemini-1.5-pro', displayName: 'Gemini 1.5 Pro' }
          ]);
          if (!selectedModel) {
            setSelectedModel('models/gemini-1.5-flash');
          }
        });
    } else {
      setAvailableModels([]);
    }
  }, [apiKey]);

  const saveApiKey = (key) => {
    localStorage.setItem('qtrack_gemini_api_key', key);
    setApiKey(key);
    setShowKeyField(false);
  };

  const clearApiKey = () => {
    localStorage.removeItem('qtrack_gemini_api_key');
    setApiKey('');
    setShowKeyField(true);
  };

  // Cria uma nova conversa
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
  };

  // Exclui uma conversa
  const handleDeleteConversation = (idToDelete, e) => {
    e.stopPropagation(); // Impede ativar a conversa antes de excluir
    
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

  const handleSend = async (textToSend) => {
    const prompt = textToSend || input;
    if (!prompt.trim()) return;

    if (!apiKey) {
      alert('Por favor, configure sua Gemini API Key antes de enviar perguntas.');
      setShowKeyField(true);
      return;
    }

    if (!textToSend) {
      setInput('');
    }

    // Cria a nova mensagem do usuário
    const userMsg = { role: 'user', text: prompt };
    const updatedMessages = [...messages, userMsg];

    // Atualiza o título da conversa se for a primeira pergunta do usuário
    const isFirstUserMsg = messages.filter(m => m.role === 'user').length === 0;
    const cleanTitle = isFirstUserMsg 
      ? (prompt.length > 25 ? prompt.substring(0, 22) + '...' : prompt)
      : activeConv.title;

    // Atualiza o estado da conversa com a mensagem do usuário e o novo título
    setConversations(prev => prev.map(c => {
      if (c.id === activeConvId) {
        return {
          ...c,
          title: cleanTitle,
          messages: updatedMessages
        };
      }
      return c;
    }));

    setLoading(true);

    try {
      // Cria histórico formatado para enviar ao backend
      const history = updatedMessages
        .slice(1, -1) // remove o de boas vindas inicial e o recém-enviado
        .map(msg => ({
          role: msg.role,
          text: msg.text
        }));

      const response = await fetch('http://localhost:8000/api/copilot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: prompt,
          history: history,
          apiKey: apiKey,
          model: selectedModel
        })
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMsg = {
          role: 'assistant',
          text: data.response,
          sql: data.sql,
          dbResult: data.dbResult,
          error: data.error
        };
        
        setConversations(prev => prev.map(c => {
          if (c.id === activeConvId) {
            return {
              ...c,
              messages: [...c.messages, assistantMsg]
            };
          }
          return c;
        }));
      } else {
        const errMsg = {
          role: 'assistant',
          text: `Erro: ${data.error || 'Não foi possível obter resposta.'}`
        };
        setConversations(prev => prev.map(c => {
          if (c.id === activeConvId) {
            return { ...c, messages: [...c.messages, errMsg] };
          }
          return c;
        }));
      }
    } catch (err) {
      const netErrMsg = {
        role: 'assistant',
        text: `Erro de rede: ${err.message}`
      };
      setConversations(prev => prev.map(c => {
        if (c.id === activeConvId) {
          return { ...c, messages: [...c.messages, netErrMsg] };
        }
        return c;
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    { title: '💻 QPUs Ativas', prompt: 'Quais são as QPUs ativas registradas e quem são seus fabricantes?' },
    { title: '❄️ Criostatos Frios', prompt: 'Me mostre a lista de criostatos com temperatura nominal menor que 0.1 K.' },
    { title: '⚠️ Qubits Instáveis', prompt: 'Quais qubits estão com o status "Instável" ou "Inoperante"?' },
    { title: '📊 Calibrações de Sucesso', prompt: 'Quantas calibrações resultaram em "Sucesso" recentemente?' },
    { title: '🧪 Experimentos e QPUs', prompt: 'Mostre o nome dos experimentos executados na QPU QPU-A.' }
  ];

  // Formatador de Markdown/estilo
  const formatText = (text) => {
    if (!text) return '';
    
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="copilot-pre"><code>$2</code></pre>');
    html = html.replace(/`(.*?)`/g, '<code class="copilot-code">$1</code>');
    html = html.replace(/^\s*[-*]\s+(.*?)$/gm, '<li>$1</li>');

    html = html.split('\n').map(line => {
      if (line.trim().startsWith('<li>') || line.trim().startsWith('<pre') || line.trim().startsWith('</pre>') || line.trim().startsWith('<code>') || line.trim().startsWith('</code>')) {
        return line;
      }
      return line + '<br />';
    }).join('\n');

    return <div className="formatted-markdown" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 70px)', color: 'var(--text-main)' }}>
      
      {/* 1. Painel Lateral de Histórico de Conversas (Abas) */}
      <div 
        style={{ 
          width: chatSidebarCollapsed ? '70px' : '240px', 
          borderRight: '1px solid var(--border-color)', 
          padding: chatSidebarCollapsed ? '15px 5px' : '15px 10px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '15px',
          background: 'rgba(11, 15, 25, 0.4)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden'
        }}
      >
        <div style={{ display: 'flex', flexDirection: chatSidebarCollapsed ? 'column' : 'row', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={handleCreateNewConversation}
            style={{
              flex: 1,
              width: chatSidebarCollapsed ? '44px' : 'auto',
              height: chatSidebarCollapsed ? '44px' : 'auto',
              padding: '10px',
              background: 'transparent',
              border: '1px dashed var(--accent-purple)',
              color: 'var(--text-main)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            title="Nova Conversa"
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)';
              e.currentTarget.style.border = '1px solid var(--accent-purple)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.border = '1px dashed var(--accent-purple)';
            }}
          >
            {chatSidebarCollapsed ? '➕' : '➕ Nova Conversa'}
          </button>
          
          <button
            onClick={() => setChatSidebarCollapsed(!chatSidebarCollapsed)}
            style={{
              width: '36px',
              height: '36px',
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            title={chatSidebarCollapsed ? "Expandir Histórico" : "Recolher Histórico"}
          >
            {chatSidebarCollapsed ? '▶' : '◀'}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {!chatSidebarCollapsed && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '5px', fontWeight: 'bold', letterSpacing: '1px' }}>
              HISTÓRICO
            </span>
          )}
          
          {conversations.map(conv => {
            const isActive = conv.id === activeConvId;
            return (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                title={conv.title}
                style={{
                  padding: chatSidebarCollapsed ? '10px 0' : '10px 12px',
                  borderRadius: '8px',
                  background: isActive ? 'var(--accent-purple)' : 'transparent',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: chatSidebarCollapsed ? 'center' : 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                  fontSize: '0.88rem'
                }}
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                {chatSidebarCollapsed ? (
                  <span style={{ fontSize: '1.2rem' }}>💬</span>
                ) : (
                  <>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: '5px' }}>
                      💬 {conv.title}
                    </span>
                    
                    {conversations.length > 1 && (
                      <button
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: isActive ? 'white' : '#ef4444',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          opacity: isActive ? 0.7 : 0.4,
                          transition: 'opacity 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = isActive ? 0.7 : 0.4}
                      >
                        🗑️
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Área de Chat Principal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '15px 20px', height: '100%' }}>
        
        {/* Cabeçalho do Chat */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>🤖 Copilot QTrack</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
              Conversa ativa: <strong>{activeConv?.title}</strong>
            </p>
          </div>

          {/* Status da Chave API e Seleção de Modelo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {apiKey && availableModels.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Modelo:</span>
                <select
                  value={selectedModel}
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    localStorage.setItem('qtrack_selected_model', e.target.value);
                  }}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-panel)',
                    color: 'white',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {availableModels.map(m => (
                    <option key={m.name} value={m.name}>
                      {m.displayName || m.name.replace('models/', '')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {apiKey ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.85rem', color: '#22c55e', background: 'rgba(34, 197, 94, 0.15)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(34, 197, 94, 0.4)' }}>
                  ● API Key Ativa
                </span>
                <button 
                  onClick={clearApiKey}
                  style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Alterar Chave
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowKeyField(true)}
                style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '4px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                ⚠️ Configurar API Key
              </button>
            )}
          </div>
        </div>

        {/* Configurações de API Key */}
        {showKeyField && (
          <div className="panel" style={{ marginBottom: '15px', border: '1px dashed #a855f7', background: 'rgba(168, 85, 247, 0.05)', padding: '15px', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '8px', color: 'var(--text-main)' }}>Configurar Chave do Gemini AI</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>
              Para usar o assistente, digite sua Gemini API Key abaixo. Chaves gratuitas são criadas no Google AI Studio. 
              <br />
              <strong>Dica:</strong> Você também pode digitar <code style={{ color: '#c084fc' }}>'mock'</code> para testar a integração com o banco no modo demonstrativo offline.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="password" 
                placeholder="Cole sua Gemini API Key ou digite 'mock'" 
                defaultValue={apiKey}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveApiKey(e.target.value);
                }}
                id="api-key-input"
                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'white' }}
              />
              <button 
                onClick={() => {
                  const val = document.getElementById('api-key-input').value;
                  saveApiKey(val);
                }}
                style={{ padding: '10px 20px', background: 'var(--accent-purple)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Salvar
              </button>
              {apiKey && (
                <button 
                  onClick={() => setShowKeyField(false)}
                  style={{ padding: '10px 15px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '6px' }}>
              Não tem uma chave? Crie uma gratuitamente no <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: '#c084fc', textDecoration: 'underline' }}>Google AI Studio</a>.
            </p>
          </div>
        )}

        {/* Janela de Mensagens */}
        <div 
          className="panel" 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            marginBottom: '15px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '15px', 
            padding: '20px', 
            borderRadius: 'var(--radius)', 
            background: 'var(--bg-panel)' 
          }}
        >
          {messages.map((msg, index) => (
            <div 
              key={index} 
              style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {msg.role === 'user' ? 'Você' : 'Copilot QTrack'}
              </span>

              <div 
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  background: msg.role === 'user' ? 'var(--accent-purple)' : 'rgba(30, 41, 59, 0.6)', 
                  color: 'var(--text-main)', 
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
                  lineHeight: '1.5'
                }}
              >
                {msg.role === 'user' ? msg.text : formatText(msg.text)}

                {msg.sql && (
                  <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                    <button
                      onClick={() => setOpenSqlId(openSqlId === index ? null : index)}
                      style={{
                        background: 'rgba(168, 85, 247, 0.1)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        borderRadius: '6px',
                        color: '#c084fc',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <span>{openSqlId === index ? '▼ Ocultar Query' : '▶ Ver Query SQL Gerada'}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>(Banco de Dados)</span>
                    </button>

                    {openSqlId === index && (
                      <div style={{ marginTop: '8px', fontSize: '0.8rem' }}>
                        <pre style={{ background: '#0b0f19', padding: '8px', borderRadius: '4px', overflowX: 'auto', border: '1px solid var(--border-color)', color: '#38bdf8' }}>
                          <code>{msg.sql}</code>
                        </pre>
                        
                        {msg.error && (
                          <div style={{ color: '#ef4444', marginTop: '5px', fontSize: '0.75rem' }}>
                            ❌ <strong>Erro no PostgreSQL:</strong> {msg.error}
                          </div>
                        )}
                        
                        {msg.dbResult && (
                          <div style={{ marginTop: '8px' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Dados brutos retornados:</span>
                            <pre style={{ background: '#0b0f19', padding: '8px', borderRadius: '4px', overflowX: 'auto', border: '1px solid var(--border-color)', color: '#10b981', maxHeight: '150px', overflowY: 'auto' }}>
                              <code>{JSON.stringify(msg.dbResult, null, 2)}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <div className="spinner-copilot"></div>
              <span>Copilot está analisando o banco de dados...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Prompts Rápidos */}
        {!loading && (
          <div style={{ marginBottom: '15px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              💡 Sugestões de consultas ao banco de dados:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(qp.prompt)}
                  style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '20px',
                    color: 'var(--text-main)',
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-purple)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)'}
                >
                  {qp.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Barra de Input de Mensagem */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Digite sua dúvida ou instrução (Ex: Quais qubits têm o menor T1?)..."
            rows={1}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-panel)',
              color: 'white',
              resize: 'none',
              fontSize: '0.95rem',
              lineHeight: '1.4'
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            style={{
              padding: '0 24px',
              background: 'var(--accent-purple)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: loading || !input.trim() ? 0.6 : 1,
              transition: 'background 0.2s'
            }}
          >
            Enviar
          </button>
        </div>
      </div>

    </div>
  );
}
