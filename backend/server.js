require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'qtrack',
  password: process.env.PGPASSWORD || '1234',
  port: parseInt(process.env.PGPORT || '5432'),
});

// Auxiliar para popular selects de logs ambientais nas chaves estrangeiras
app.get('/api/registro-ambiente', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_registro_ambiente, data_hora_registro, temperatura FROM registroambiente ORDER BY data_hora_registro DESC;');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao buscar Registros de Ambiente');
  }
});

// ================= 1. CRUD DE QPUs =================
app.get('/api/qpus', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_qpu, nome, fabricante, modelo, tecnologia, data_instalacao, status_operacional, id_criostato FROM QPU ORDER BY id_qpu;');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao buscar QPUs');
  }
});

app.post('/api/qpus', async (req, res) => {
  try {
    const { nome, fabricante, modelo, tecnologia, data_instalacao, status_operacional, id_criostato } = req.body;
    const result = await pool.query(
      'INSERT INTO QPU (nome, fabricante, modelo, tecnologia, data_instalacao, status_operacional, id_criostato) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;',
      [nome, fabricante, modelo, tecnologia, data_instalacao, status_operacional, id_criostato]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao inserir QPU');
  }
});

app.put('/api/qpus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, fabricante, modelo, tecnologia, data_instalacao, status_operacional, id_criostato } = req.body;
    const result = await pool.query(
      'UPDATE QPU SET nome=$1, fabricante=$2, modelo=$3, tecnologia=$4, data_instalacao=$5, status_operacional=$6, id_criostato=$7 WHERE id_qpu=$8 RETURNING *;',
      [nome, fabricante, modelo, tecnologia, data_instalacao, status_operacional, id_criostato, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao atualizar QPU');
  }
});

app.delete('/api/qpus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM QPU WHERE id_qpu = $1;', [id]);
    res.json({ message: "QPU excluída" });
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao excluir QPU');
  }
});

// ================= 2. CRUD DE CRIOSTATOS =================
app.get('/api/criostatos', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_criostato, nome, fabricante, modelo, temperatura_nominal, status_operacional FROM criostato ORDER BY id_criostato;');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao buscar Criostatos');
  }
});

app.post('/api/criostatos', async (req, res) => {
  try {
    const { nome, fabricante, modelo, temperatura_nominal, status_operacional } = req.body;
    const result = await pool.query(
      'INSERT INTO criostato (nome, fabricante, modelo, temperatura_nominal, status_operacional) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
      [nome, fabricante, modelo, temperatura_nominal, status_operacional]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao inserir Criostato');
  }
});

app.put('/api/criostatos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, fabricante, modelo, temperatura_nominal, status_operacional } = req.body;
    const result = await pool.query(
      'UPDATE criostato SET nome=$1, fabricante=$2, modelo=$3, temperatura_nominal=$4, status_operacional=$5 WHERE id_criostato=$6 RETURNING *;',
      [nome, fabricante, modelo, temperatura_nominal, status_operacional, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao atualizar Criostato');
  }
});

app.delete('/api/criostatos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM criostato WHERE id_criostato = $1;', [id]);
    res.json({ message: "Criostato excluído" });
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao excluir Criostato');
  }
});

// ================= 3. CRUD DE PESQUISADORES =================
app.get('/api/pesquisadores', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_pesquisador, nome, email, instituicao, area_atuacao FROM pesquisador ORDER BY id_pesquisador;');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao buscar Pesquisadores');
  }
});

app.post('/api/pesquisadores', async (req, res) => {
  try {
    const { nome, email, instituicao, area_atuacao } = req.body;
    const result = await pool.query(
      'INSERT INTO pesquisador (nome, email, instituicao, area_atuacao) VALUES ($1, $2, $3, $4) RETURNING *;',
      [nome, email, instituicao, area_atuacao]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao inserir Pesquisador');
  }
});

app.put('/api/pesquisadores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, instituicao, area_atuacao } = req.body;
    const result = await pool.query(
      'UPDATE pesquisador SET nome=$1, email=$2, instituicao=$3, area_atuacao=$4 WHERE id_pesquisador=$5 RETURNING *;',
      [nome, email, instituicao, area_atuacao, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao atualizar Pesquisador');
  }
});

app.delete('/api/pesquisadores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM pesquisador WHERE id_pesquisador = $1;', [id]);
    res.json({ message: "Pesquisador excluído" });
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao excluir Pesquisador');
  }
});

// ================= 4. CRUD DE QUBITS =================
app.get('/api/qubits', async (req, res) => {
  try {
    const query = `
      SELECT q.id_qubit, q.indice_qubit, q.tipo_qubit, q.frequencia_ressonancia, q.status_qubit, q.observacoes, q.id_qpu, p.nome as qpu_nome
      FROM Qubit q
      JOIN QPU p ON q.id_qpu = p.id_qpu
      ORDER BY q.id_qpu ASC, q.indice_qubit ASC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao buscar Qubits');
  }
});

app.post('/api/qubits', async (req, res) => {
  try {
    const { indice_qubit, tipo_qubit, frequencia_ressonancia, status_qubit, observacoes, id_qpu } = req.body;
    const query = `
      INSERT INTO Qubit (indice_qubit, tipo_qubit, frequencia_ressonancia, status_qubit, observacoes, id_qpu)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;
    const result = await pool.query(query, [indice_qubit, tipo_qubit, frequencia_ressonancia, status_qubit, observacoes, id_qpu]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao inserir Qubit');
  }
});

app.put('/api/qubits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { indice_qubit, tipo_qubit, frequencia_ressonancia, status_qubit, observacoes, id_qpu } = req.body;
    const query = `
      UPDATE Qubit 
      SET indice_qubit=$1, tipo_qubit=$2, frequencia_ressonancia=$3, status_qubit=$4, observacoes=$5, id_qpu=$6 
      WHERE id_qubit=$7 RETURNING *;
    `;
    const result = await pool.query(query, [indice_qubit, tipo_qubit, frequencia_ressonancia, status_qubit, observacoes, id_qpu, id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao atualizar Qubit');
  }
});

app.delete('/api/qubits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM Qubit WHERE id_qubit = $1;', [id]);
    res.json({ message: "Qubit excluído com sucesso" });
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao excluir Qubit');
  }
});

// ================= 5. CRUD DE EXPERIMENTOS =================
app.get('/api/experimentos', async (req, res) => {
  try {
    const query = `
      SELECT e.*, p.nome as pesquisador_nome, q.nome as qpu_nome
      FROM experimento e
      LEFT JOIN pesquisador p ON e.id_pesquisador = p.id_pesquisador
      LEFT JOIN QPU q ON e.id_qpu = q.id_qpu
      ORDER BY e.data_hora_inicio DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao buscar Experimentos');
  }
});

app.post('/api/experimentos', async (req, res) => {
  try {
    const { nome, objetivo, data_hora_inicio, data_hora_fim, status_execucao, observacoes, id_pesquisador, id_qpu, id_registro_ambiente } = req.body;
    const query = `
      INSERT INTO experimento (nome, objetivo, data_hora_inicio, data_hora_fim, status_execucao, observacoes, id_pesquisador, id_qpu, id_registro_ambiente)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
    `;
    const result = await pool.query(query, [nome, objetivo, data_hora_inicio || null, data_hora_fim || null, status_execucao, observacoes, id_pesquisador || null, id_qpu || null, id_registro_ambiente || null]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao inserir Experimento');
  }
});

app.put('/api/experimentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, objetivo, data_hora_inicio, data_hora_fim, status_execucao, observacoes, id_pesquisador, id_qpu, id_registro_ambiente } = req.body;
    const query = `
      UPDATE experimento 
      SET nome=$1, objetivo=$2, data_hora_inicio=$3, data_hora_fim=$4, status_execucao=$5, observacoes=$6, id_pesquisador=$7, id_qpu=$8, id_registro_ambiente=$9
      WHERE id_experimento=$10 RETURNING *;
    `;
    const result = await pool.query(query, [nome, objetivo, data_hora_inicio, data_hora_fim, status_execucao, observacoes, id_pesquisador, id_qpu, id_registro_ambiente, id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao atualizar Experimento');
  }
});

app.delete('/api/experimentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM experimento WHERE id_experimento = $1;', [id]);
    res.json({ message: "Experimento excluído" });
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao excluir Experimento');
  }
});

// ================= 6. CRUD DE CALIBRAÇÕES =================
app.get('/api/calibracoes', async (req, res) => {
  try {
    const query = `
      SELECT c.*, p.nome as pesquisador_nome, q.nome as qpu_nome
      FROM calibracao c
      LEFT JOIN pesquisador p ON c.id_pesquisador = p.id_pesquisador
      LEFT JOIN QPU q ON c.id_qpu = q.id_qpu
      ORDER BY c.data_hora_inicio DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao buscar Calibrações');
  }
});

app.post('/api/calibracoes', async (req, res) => {
  try {
    const { data_hora_inicio, data_hora_fim, tipo_calibracao, versao_parametros, resultado, observacoes, id_pesquisador, id_qpu, id_registro_ambiente } = req.body;
    const query = `
      INSERT INTO calibracao (data_hora_inicio, data_hora_fim, tipo_calibracao, versao_parametros, resultado, observacoes, id_pesquisador, id_qpu, id_registro_ambiente)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
    `;
    const result = await pool.query(query, [data_hora_inicio || null, data_hora_fim || null, tipo_calibracao, versao_parametros, resultado, observacoes, id_pesquisador || null, id_qpu || null, id_registro_ambiente || null]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao inserir Calibração');
  }
});

app.put('/api/calibracoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data_hora_inicio, data_hora_fim, tipo_calibracao, versao_parametros, resultado, observacoes, id_pesquisador, id_qpu, id_registro_ambiente } = req.body;
    const query = `
      UPDATE calibracao 
      SET data_hora_inicio=$1, data_hora_fim=$2, tipo_calibracao=$3, versao_parametros=$4, resultado=$5, observacoes=$6, id_pesquisador=$7, id_qpu=$8, id_registro_ambiente=$9
      WHERE id_calibracao=$10 RETURNING *;
    `;
    const result = await pool.query(query, [data_hora_inicio, data_hora_fim, tipo_calibracao, versao_parametros, resultado, observacoes, id_pesquisador, id_qpu, id_registro_ambiente, id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao atualizar Calibração');
  }
});

app.delete('/api/calibracoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM calibracao WHERE id_calibracao = $1;', [id]);
    res.json({ message: "Calibração excluída" });
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao excluir Calibração');
  }
});

// ================= RELATÓRIOS ACADÊMICOS =================
app.get('/api/relatorios/t1', async (req, res) => {
  try {
    const query = `
      WITH diario_qpu AS (
        SELECT p.id_qpu, p.nome as qpu_nome, DATE(mq.data_hora_medicao) as data, AVG(mq.valor) as media_t1
        FROM MedeQubit mq JOIN Qubit q ON mq.id_qubit = q.id_qubit JOIN QPU p ON q.id_qpu = p.id_qpu
        WHERE mq.nome_metrica = 'T1' GROUP BY p.id_qpu, p.nome, DATE(mq.data_hora_medicao)
      ),
      ranqueamento_piores AS (
        SELECT q.id_qpu, DATE(mq.data_hora_medicao) as data, mq.id_qubit as pior_qubit_id, mq.valor as pior_valor_t1,
        ROW_NUMBER() OVER(PARTITION BY q.id_qpu, DATE(mq.data_hora_medicao) ORDER BY mq.valor ASC) as rn
        FROM MedeQubit mq JOIN Qubit q ON mq.id_qubit = q.id_qubit WHERE mq.nome_metrica = 'T1'
      )
      SELECT d.qpu_nome, d.data, d.media_t1, r.pior_qubit_id, r.pior_valor_t1
      FROM diario_qpu d LEFT JOIN ranqueamento_piores r ON d.id_qpu = r.id_qpu AND d.data = r.data AND r.rn = 1
      ORDER BY d.data ASC, d.qpu_nome ASC;
    `;
    const result = await pool.query(query); res.json(result.rows);
  } catch (err) { console.error(err.message); res.status(500).send('Erro no Relatório 1'); }
});

app.get('/api/relatorios/fidelidade', async (req, res) => {
  try {
    const query = `
      SELECT pq.nome_porta, pq.numero_qubits_alvo || ' Qubit(s)' as categoria, AVG(mp.valor) as fidelidade_media
      FROM MedePorta mp JOIN PortaQuantica pq ON mp.id_porta = pq.id_porta JOIN Experimento e ON mp.id_experimento = e.id_experimento
      WHERE mp.nome_metrica = 'Fidelidade' GROUP BY pq.nome_porta, pq.numero_qubits_alvo ORDER BY categoria DESC, fidelidade_media DESC;
    `;
    const result = await pool.query(query); res.json(result.rows);
  } catch (err) { console.error(err.message); res.status(500).send('Erro no Relatório 2'); }
});

app.get('/api/relatorios/temperatura', async (req, res) => {
  try {
    const query = `
      SELECT ra.temperatura, AVG(mq.valor) as taxa_erro_media
      FROM RegistroAmbiente ra JOIN Experimento e ON ra.id_registro_ambiente = e.id_registro_ambiente JOIN MedeQubit mq ON e.id_experimento = mq.id_experimento
      WHERE mq.nome_metrica = 'TaxaErro' GROUP BY ra.temperatura ORDER BY ra.temperatura;
    `;
    const result = await pool.query(query); res.json(result.rows);
  } catch (err) { console.error(err.message); res.status(500).send('Erro no Relatório 3'); }
});

// ================= DASHBOARD DINÂMICO REAL-TIME =================
app.get('/api/dashboard/qubits/:id_qpu', async (req, res) => {
  try {
    const { id_qpu } = req.params;
    const mapaResult = await pool.query(`SELECT id_qubit, indice_qubit, status_qubit, status_qubit as status_operacional FROM Qubit WHERE id_qpu = $1::integer ORDER BY indice_qubit;`, [id_qpu]);
    const cardsResult = await pool.query(`SELECT mq.nome_metrica, AVG(mq.valor) as media FROM MedeQubit mq JOIN Qubit q ON mq.id_qubit = q.id_qubit WHERE q.id_qpu = $1::integer AND mq.nome_metrica IN ('T1', 'TaxaErro') GROUP BY mq.nome_metrica;`, [id_qpu]);
    const fidResult = await pool.query(`SELECT pq.numero_qubits_alvo, AVG(mp.valor) as media FROM MedePorta mp JOIN PortaQuantica pq ON mp.id_porta = pq.id_porta JOIN Experimento e ON mp.id_experimento = e.id_experimento WHERE e.id_qpu = $1::integer AND mp.nome_metrica = 'Fidelidade' GROUP BY pq.numero_qubits_alvo;`, [id_qpu]);
    res.json({ mapa: mapaResult.rows, metricas: cardsResult.rows, fidelidades: fidResult.rows });
  } catch (err) { console.error(err.message); res.status(500).send('Erro no Dashboard'); }
});

app.get('/api/dashboard/ambiente/:id_qpu', async (req, res) => {
  try {
    const { id_qpu } = req.params;
    const result = await pool.query(`SELECT ra.temperatura, ra.pressao, ra.vibracao FROM RegistroAmbiente ra JOIN Experimento e ON ra.id_registro_ambiente = e.id_registro_ambiente JOIN MedeQubit mq ON e.id_experimento = mq.id_experimento JOIN Qubit q ON mq.id_qubit = q.id_qubit WHERE q.id_qpu = $1::integer ORDER BY ra.data_hora_registro DESC LIMIT 1;`, [id_qpu]);
    res.json(result.rows[0] || { temperatura: 0, pressao: 0, vibracao: 0 });
  } catch (err) { console.error(err.message); res.status(500).send('Erro no Dashboard Ambiente'); }
});

// Helper de segurança para validar consultas SQL geradas por IA
function isSafeSql(sql) {
  const cleanSql = sql.trim().toUpperCase();
  if (!cleanSql.startsWith('SELECT')) {
    return false;
  }
  const forbiddenKeywords = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE', 'CREATE', 'GRANT', 'REVOKE'];
  for (const keyword of forbiddenKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(cleanSql)) {
      return false;
    }
  }
  return true;
}

// Endpoint do Copilot Inteligente com Gemini
// Endpoint para listar os modelos disponíveis para a chave do usuário
app.get('/api/copilot/models', async (req, res) => {
  try {
    const apiKey = req.query.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: 'Gemini API Key não fornecida.' });
    }
    
    // Tenta primeiro no endpoint v1
    let response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    if (!response.ok) {
      // Se der erro, tenta no v1beta
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    }
    
    if (!response.ok) {
      const errData = await response.json();
      return res.status(response.status).json({ error: errData.error?.message || 'Erro ao consultar modelos.' });
    }
    
    const data = await response.json();
    const filteredModels = data.models
      ? data.models.filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      : [];
      
    res.json({ models: filteredModels });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint do Copilot Inteligente com Gemini
app.post('/api/copilot/chat', async (req, res) => {
  try {
    const { message, history, apiKey, model } = req.body;
    const keyToUse = apiKey || process.env.GEMINI_API_KEY;

    if (!keyToUse) {
      return res.status(400).json({ error: 'Gemini API Key não fornecida. Configure no arquivo .env ou informe na interface.' });
    }

    const systemPrompt = `Você é o Copilot QTrack, um assistente inteligente e amigável integrado ao sistema de monitoramento de hardware quântico (QPU, Criostatos e Qubits).
Sua principal função é atuar como um colega de laboratório (co-worker) para ajudar pesquisadores a analisarem dados, tomarem decisões e consultarem o banco de dados PostgreSQL.

Você tem acesso a um banco de dados PostgreSQL com as seguintes tabelas e estruturas exatas (use sempre nomes de tabelas e colunas em minúsculas nas queries):

1. qpu (id_qpu, nome, fabricante, modelo, tecnologia, data_instalacao, status_operacional, id_criostato)
   - Valores típicos para status_operacional: 'Operacional', 'Inativo', 'Manutenção'
2. criostato (id_criostato, nome, fabricante, modelo, temperatura_nominal, status_operacional)
   - Valores típicos para status_operacional: 'Operacional', 'Inativo'
3. qubit (id_qubit, indice_qubit, tipo_qubit, frequencia_ressonancia, status_qubit, observacoes, id_qpu)
   - Valores típicos para status_qubit: 'Ativo', 'Instável', 'Inoperante'
4. pesquisador (id_pesquisador, nome, email, instituicao, area_atuacao)
5. experimento (id_experimento, nome, objetivo, data_hora_inicio, data_hora_fim, status_execucao, observacoes, id_pesquisador, id_qpu, id_registro_ambiente)
6. calibracao (id_calibracao, data_hora_inicio, data_hora_fim, tipo_calibracao, versao_parametros, resultado, observacoes, id_pesquisador, id_qpu, id_registro_ambiente)
   - Valores típicos para resultado: 'Sucesso', 'Parcial', 'Falha'
7. registroambiente (id_registro_ambiente, data_hora_registro, temperatura, pressao, umidade, vibracao, campo_magnetico, observacoes)
8. medequbit (id_experimento, id_qubit, nome_metrica, valor, unidade, data_hora_medicao, metodo_obtencao, observacoes)
   - Valores típicos para nome_metrica: 'T1', 'T2', 'Fidelidade', 'TaxaErro'
9. medeporta (id_experimento, id_porta, nome_metrica, valor, unidade, data_hora_medicao, metodo_obtencao, observacoes)
   - Valores típicos para nome_metrica: 'Fidelidade'
10. portaquantica (id_porta, nome_porta, categoria, numero_qubits_alvo, descricao)
11. sequenciapulso (id_sequencia, nome, finalidade, versao, descricao)
12. pulso (id_pulso, ordem, tipo_pulso, amplitude, duracao, frequencia, fase, forma_onda, id_sequencia)
13. abrange (id_calibracao, id_qubit, parametro_ajustado, valor_antes, valor_depois)
14. atuasobre (id_porta, id_qubit)
15. implementa (id_sequencia, id_porta)
16. utilizacalibracao (id_calibracao, id_sequencia)
17. utilizaexperimento (id_experimento, id_sequencia)

Regras Importantes de Execução (Conversa e Interpretação):
1. **Seja Conversacional e Amigável:** Não se limite a responder apenas com dados puros. Responda saudações (como "Oi", "Olá", "Tudo bem?"), agradecimentos, apresente-se como o Copilot e mantenha uma atitude acolhedora e prestativa de colega de trabalho.
2. **Capacidade de Conversa Conceitual:** Se o usuário fizer perguntas conceituais (ex: "O que é o tempo T1?", "Como funciona um criostato?", "O que faz a métrica Fidelidade?"), responda de forma rica e didática diretamente, em português, sem gerar blocos "[SQL]".
3. **Interpretação Flexível (NLP-to-SQL):** Não seja rígido. Se o usuário fizer perguntas vagas ou informais (ex: "quem está trabalhando mais?", "como está a temperatura lá?", "tem alguma máquina com problemas?"), interprete quais tabelas contêm a resposta adequada:
   - "quem trabalha mais?" -> conte experimentos ou calibrações agrupados por pesquisador.
   - "máquina com problemas" -> busque QPUs com status 'Manutenção' ou 'Inativo', ou qubits 'Instável'/'Inoperante'.
   - Escreva a query SELECT necessária para obter os dados relevantes.
4. **Respostas em duas etapas:** Se o usuário pedir informações do banco, responda APENAS com a instrução SQL SELECT necessária no formato "[SQL] <sua consulta SELECT>". Quando receber os dados JSON do banco (começando com "[RESULTADO]"), elabore uma resposta final bem estruturada em português usando Markdown. Não exiba a query SQL no texto da resposta final.
5. **Segurança:** Nunca execute comandos que alterem dados (INSERT, UPDATE, DELETE). Apenas execute queries SELECT.

Exemplos de Tradução (NLP-to-SQL):
- Pergunta: "Olá, pode me dizer quais QPUs estão ativas?"
  Resposta: [SQL] SELECT nome, fabricante, modelo, status_operacional FROM qpu WHERE status_operacional = 'Operacional';
- Pergunta: "Quais qubits tem o menor T1?"
  Resposta: [SQL] SELECT q.id_qubit, q.indice_qubit, q.id_qpu, mq.valor as t1_valor FROM qubit q JOIN medequbit mq ON q.id_qubit = mq.id_qubit WHERE mq.nome_metrica = 'T1' ORDER BY mq.valor ASC LIMIT 5;
- Pergunta: "Quem fez mais experimentos aqui no laboratório?"
  Resposta: [SQL] SELECT p.nome, COUNT(e.id_experimento) as total_experimentos FROM pesquisador p JOIN experimento e ON p.id_pesquisador = e.id_pesquisador GROUP BY p.nome ORDER BY total_experimentos DESC LIMIT 3;`;

    const contents = [];
    
    if (history && history.length > 0) {
      history.forEach((item, idx) => {
        let textVal = item.text;
        if (idx === 0) {
          textVal = `${systemPrompt}\n\n[INÍCIO DA CONVERSA]\n${textVal}`;
        }
        contents.push({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: textVal }]
        });
      });
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\n[INÍCIO DA CONVERSA]\n${message}` }]
      });
    }

    const callGemini = async (contentsList, preferredModel = null) => {
      const modelsToTry = preferredModel ? [preferredModel] : [
        'gemini-1.5-flash',
        'gemini-2.0-flash',
        'gemini-2.5-flash',
        'gemini-1.5-pro'
      ];
      
      let lastError = null;
      const apiVersions = ['v1', 'v1beta'];

      for (const modelName of modelsToTry) {
        const cleanModelName = modelName.replace('models/', '');
        
        for (const apiVersion of apiVersions) {
          try {
            const response = await fetch(`https://generativelanguage.googleapis.com/${apiVersion}/models/${cleanModelName}:generateContent?key=${keyToUse}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: contentsList,
                generationConfig: {
                  temperature: 0.2
                }
              })
            });
            
            if (!response.ok) {
              const errData = await response.json();
              if (response.status === 404 || (errData.error?.message && (errData.error.message.includes('not found') || errData.error.message.includes('not supported')))) {
                lastError = new Error(errData.error?.message || `Erro no modelo ${cleanModelName} (${apiVersion})`);
                continue;
              }
              throw new Error(errData.error?.message || `Erro na chamada da API Gemini com ${cleanModelName}`);
            }
            
            const data = await response.json();
            return {
              text: data.candidates[0].content.parts[0].text,
              activeModel: cleanModelName,
              apiVersion: apiVersion
            };
          } catch (err) {
            lastError = err;
            if (err.message.includes('API key') || err.message.includes('key not valid')) {
              throw err;
            }
          }
        }
      }
      throw lastError || new Error('Nenhum modelo do Gemini respondeu com sucesso.');
    };

    let result = await callGemini(contents, model);
    let geminiResponse = result.text;
    let modelUsed = result.activeModel;

    if (geminiResponse.trim().startsWith('[SQL]')) {
      const sqlQuery = geminiResponse.replace('[SQL]', '').trim();
      
      if (!isSafeSql(sqlQuery)) {
        return res.json({
          response: "Desculpe, por motivos de segurança, eu só posso executar consultas de leitura (SELECT) e não posso rodar comandos que alterem o banco de dados."
        });
      }

      let dbResultRows = null;
      let dbErrorMsg = null;

      try {
        const dbResult = await pool.query(sqlQuery);
        dbResultRows = dbResult.rows;
      } catch (dbErr) {
        dbErrorMsg = dbErr.message;
      }

      contents.push({
        role: 'model',
        parts: [{ text: geminiResponse }]
      });

      if (dbErrorMsg) {
        contents.push({
          role: 'user',
          parts: [{ text: `[RESULTADO] Erro ao executar consulta SQL: ${dbErrorMsg}. Corrija a query se necessário ou explique o erro.` }]
        });
      } else {
        contents.push({
          role: 'user',
          parts: [{ text: `[RESULTADO] ${JSON.stringify(dbResultRows)}` }]
        });
      }

      try {
        const finalResult = await callGemini(contents, modelUsed);
        res.json({ response: finalResult.text, sql: sqlQuery, dbResult: dbResultRows, error: dbErrorMsg, model: modelUsed });
      } catch (geminiErr) {
        console.error(geminiErr);
        res.status(502).json({ error: `Erro na resposta final do Gemini: ${geminiErr.message}` });
      }
    } else {
      res.json({ response: geminiResponse, model: modelUsed });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(8000, () => { console.log('Backend rodando na porta 8000'); });