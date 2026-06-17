import { useState, useEffect, useRef } from 'react';

export default function Copilot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Olá! Sou o Copilot do QTrack. Posso responder dúvidas conceituais de computação quântica ou fazer consultas diretas no banco de dados para analisar o status das QPUs, qubits, criostatos, calibrações e experimentos. Como posso te ajudar hoje?'
    }
  ]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('qtrack_gemini_api_key') || '');
  const [loading, setLoading] = useState(false);
  const [showKeyField, setShowKeyField] = useState(!localStorage.getItem('qtrack_gemini_api_key'));
  const [openSqlId, setOpenSqlId] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('qtrack_selected_model') || '');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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

    // Adiciona mensagem do usuário ao chat
    const newMessages = [...messages, { role: 'user', text: prompt }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Cria histórico formatado para enviar ao backend
      const history = newMessages
        .slice(1, -1) // remove a primeira de boas vindas e a última recém-adicionada
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
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: data.response,
            sql: data.sql,
            dbResult: data.dbResult,
            error: data.error
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: `Erro: ${data.error || 'Não foi possível obter resposta.'}`
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `Erro de rede: ${err.message}`
        }
      ]);
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
    { title: '🧪 Experimentos e QPUs', prompt: 'Mostre o nome dos experimentos executados na QPU IBM-Helsinki.' }
  ];

  // Formatador simples de Markdown/estilo para a resposta da LLM
  const formatText = (text) => {
    if (!text) return '';
    
    // Escapa tags HTML para segurança
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Bold (**texto**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Bloco de código
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="copilot-pre"><code>$2</code></pre>');

    // Código em linha (`código`)
    html = html.replace(/`(.*?)`/g, '<code class="copilot-code">$1</code>');

    // Tópicos (- item)
    html = html.replace(/^\s*[-*]\s+(.*?)$/gm, '<li>$1</li>');

    // Quebras de linha
    html = html.split('\n').map(line => {
      if (line.trim().startsWith('<li>') || line.trim().startsWith('<pre') || line.trim().startsWith('</pre>') || line.trim().startsWith('<code>') || line.trim().startsWith('</code>')) {
        return line;
      }
      return line + '<br />';
    }).join('\n');

    return <div className="formatted-markdown" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)', padding: '20px', color: 'var(--text-main)' }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>🤖 Copilot QTrack</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Assistente inteligente integrado ao banco de dados PostgreSQL do projeto QTrack.
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

      {/* Campo para input de API Key se necessário */}
      {showKeyField && (
        <div className="panel" style={{ marginBottom: '15px', border: '1px dashed #a855f7', background: 'rgba(168, 85, 247, 0.05)', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '8px', color: 'var(--text-main)' }}>Configurar Chave do Gemini AI</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>
            Você precisa de uma chave de API do Gemini para usar o assistente inteligente. A chave é enviada do seu navegador para o servidor do backend e fica salva localmente no seu localStorage.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="password" 
              placeholder="Cole sua Gemini API Key aqui (ex: AIzaSy...)" 
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
            {/* Rótulo de remetente */}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {msg.role === 'user' ? 'Você' : 'Copilot QTrack'}
            </span>

            {/* Balão de mensagem */}
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

              {/* Bloco de consulta SQL executada */}
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

        {/* Indicador de carregamento */}
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
            💡 Perguntas sugeridas para testar a integração com o banco de dados:
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

      {/* Campo de Entrada de Mensagem */}
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
  );
}
