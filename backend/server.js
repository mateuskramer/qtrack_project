require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'qtrack',
  password: '1234',
  port: 5432,
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

app.get('/api/experimentos/:id/detalhes', async (req, res) => {
  try {
    const { id } = req.params;
    const expQuery = `
      SELECT e.*, p.nome as pesquisador_nome, q.nome as qpu_nome,
             ra.temperatura, ra.pressao, ra.umidade, ra.vibracao, ra.campo_magnetico, ra.observacoes as ambiente_observacoes
      FROM experimento e
      LEFT JOIN pesquisador p ON e.id_pesquisador = p.id_pesquisador
      LEFT JOIN QPU q ON e.id_qpu = q.id_qpu
      LEFT JOIN registroambiente ra ON e.id_registro_ambiente = ra.id_registro_ambiente
      WHERE e.id_experimento = $1;
    `;
    const expResult = await pool.query(expQuery, [id]);
    if (expResult.rows.length === 0) {
      return res.status(404).send('Experimento não encontrado');
    }
    const experimento = expResult.rows[0];

    const seqQuery = `
      SELECT sp.*
      FROM sequenciapulso sp
      JOIN utilizaexperimento ue ON sp.id_sequencia = ue.id_sequencia
      WHERE ue.id_experimento = $1;
    `;
    const seqResult = await pool.query(seqQuery, [id]);
    
    res.json({
      experimento,
      sequencias: seqResult.rows
    });
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao buscar detalhes do experimento');
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

app.get('/api/calibracoes/:id/detalhes', async (req, res) => {
  try {
    const { id } = req.params;
    const calQuery = `
      SELECT c.*, p.nome as pesquisador_nome, q.nome as qpu_nome,
             ra.temperatura, ra.pressao, ra.umidade, ra.vibracao, ra.campo_magnetico, ra.observacoes as ambiente_observacoes
      FROM calibracao c
      LEFT JOIN pesquisador p ON c.id_pesquisador = p.id_pesquisador
      LEFT JOIN QPU q ON c.id_qpu = q.id_qpu
      LEFT JOIN registroambiente ra ON c.id_registro_ambiente = ra.id_registro_ambiente
      WHERE c.id_calibracao = $1;
    `;
    const calResult = await pool.query(calQuery, [id]);
    if (calResult.rows.length === 0) {
      return res.status(404).send('Calibração não encontrada');
    }
    const calibracao = calResult.rows[0];

    const seqQuery = `
      SELECT sp.*
      FROM sequenciapulso sp
      JOIN utilizacalibracao uc ON sp.id_sequencia = uc.id_sequencia
      WHERE uc.id_calibracao = $1;
    `;
    const seqResult = await pool.query(seqQuery, [id]);
    
    res.json({
      calibracao,
      sequencias: seqResult.rows
    });
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao buscar detalhes da calibração');
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
    
    // Histórico de Fidelidades (1Q e 2Q) por dia
    const histFidResult = await pool.query(`
      SELECT 
        TO_CHAR(mp.data_hora_medicao, 'DD/MM') as data,
        pq.numero_qubits_alvo,
        AVG(mp.valor) as media
      FROM MedePorta mp
      JOIN PortaQuantica pq ON mp.id_porta = pq.id_porta
      JOIN Experimento e ON mp.id_experimento = e.id_experimento
      WHERE e.id_qpu = $1::integer AND mp.nome_metrica = 'Fidelidade'
      GROUP BY TO_CHAR(mp.data_hora_medicao, 'DD/MM'), DATE(mp.data_hora_medicao), pq.numero_qubits_alvo
      ORDER BY DATE(mp.data_hora_medicao) ASC
      LIMIT 16;
    `, [id_qpu]);

    // Histórico de Erros de Leitura por dia
    const histErroResult = await pool.query(`
      SELECT 
        TO_CHAR(mq.data_hora_medicao, 'DD/MM') as data,
        AVG(mq.valor) as media
      FROM MedeQubit mq
      JOIN Qubit q ON mq.id_qubit = q.id_qubit
      WHERE q.id_qpu = $1::integer AND mq.nome_metrica = 'TaxaErro'
      GROUP BY TO_CHAR(mq.data_hora_medicao, 'DD/MM'), DATE(mq.data_hora_medicao)
      ORDER BY DATE(mq.data_hora_medicao) ASC
      LIMIT 8;
    `, [id_qpu]);

    // Experimentos recentes da QPU com condições do ambiente associadas
    const expResult = await pool.query(`
      SELECT 
        e.id_experimento, 
        e.nome, 
        e.status_execucao,
        TO_CHAR(e.data_hora_inicio, 'DD/MM/YYYY HH24:MI') as data_inicio,
        p.nome as pesquisador_nome,
        ra.temperatura,
        ra.pressao,
        ra.vibracao
      FROM Experimento e
      LEFT JOIN pesquisador p ON e.id_pesquisador = p.id_pesquisador
      LEFT JOIN RegistroAmbiente ra ON e.id_registro_ambiente = ra.id_registro_ambiente
      WHERE e.id_qpu = $1::integer
      ORDER BY e.data_hora_inicio DESC, e.id_experimento DESC
      LIMIT 5;
    `, [id_qpu]);

    res.json({ 
      mapa: mapaResult.rows, 
      metricas: cardsResult.rows, 
      fidelidades: fidResult.rows,
      historicoFidelidade: histFidResult.rows,
      historicoErro: histErroResult.rows,
      experimentos: expResult.rows
    });
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

// Helper para gerar respostas locais simuladas (Modo Demonstrativo ou Contingência)
function getMockResponse(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes('qpu') || msg.includes('hardware')) {
    return {
      sql: "SELECT nome, fabricante, modelo, status_operacional FROM qpu WHERE status_operacional = 'Operacional';",
      template: (rows) => {
        if (!rows || rows.length === 0) return "Não encontrei nenhuma QPU ativa no momento no banco de dados.";
        let res = "Olá! Identifiquei as seguintes QPUs ativas no banco de dados (Modo Demonstrativo/Contingência):\n\n";
        rows.forEach(r => {
          res += `* **${r.nome}** (${r.fabricante} ${r.modelo}) - Status: \`${r.status_operacional}\`\n`;
        });
        res += "\nEsses processadores quânticos estão operando normalmente.";
        return res;
      }
    };
  }
  
  if (msg.includes('qubit') && (msg.includes('t1') || msg.includes('relaxamento') || msg.includes('menor'))) {
    return {
      sql: "SELECT q.id_qubit, q.indice_qubit, q.id_qpu, mq.valor FROM qubit q JOIN medequbit mq ON q.id_qubit = mq.id_qubit WHERE mq.nome_metrica = 'T1' ORDER BY mq.valor ASC LIMIT 5;",
      template: (rows) => {
        if (!rows || rows.length === 0) return "Não há medições de T1 registradas no banco de dados.";
        let res = "Aqui está a análise de tempos de relaxamento T1 (menores valores) do banco de dados (Modo Demonstrativo/Contingência):\n\n";
        rows.forEach(r => {
          res += `* **Qubit #${r.indice_qubit}** (QPU #${r.id_qpu}) - T1: **${Number(r.valor).toFixed(2)} µs**\n`;
        });
        res += "\nValores baixos de T1 indicam que esses qubits estão perdendo coerência mais rapidamente e podem precisar de recalibração.";
        return res;
      }
    };
  }
  
  if (msg.includes('qubit') && (msg.includes('instavel') || msg.includes('inoperante') || msg.includes('problema') || msg.includes('status'))) {
    return {
      sql: "SELECT id_qubit, indice_qubit, status_qubit, id_qpu FROM qubit WHERE status_qubit IN ('Instável', 'Inoperante');",
      template: (rows) => {
        if (!rows || rows.length === 0) return "Excelente notícia! Todos os qubits cadastrados estão ativos e estáveis no banco de dados (Modo Demonstrativo/Contingência).";
        let res = "Atenção, identifiquei qubits com anomalias no banco de dados:\n\n";
        rows.forEach(r => {
          res += `* **Qubit #${r.indice_qubit}** (QPU #${r.id_qpu}) - Status: \`${r.status_qubit}\`\n`;
        });
        return res;
      }
    };
  }
  
  if (msg.includes('criostato') || msg.includes('temperatura')) {
    return {
      sql: "SELECT nome, fabricante, modelo, temperatura_nominal FROM criostato WHERE temperatura_nominal < 0.1;",
      template: (rows) => {
        if (!rows || rows.length === 0) return "Nenhum criostato operando abaixo de 0.1 K foi encontrado.";
        let res = "Os seguintes criostatos de diluição ultra-fria estão ativos no banco (Modo Demonstrativo/Contingência):\n\n";
        rows.forEach(r => {
          res += `* **${r.nome}** (${r.fabricante} ${r.modelo}) - Temp Nominal: **${r.temperatura_nominal} K**\n`;
        });
        return res;
      }
    };
  }

  if (msg.includes('calibrac') || msg.includes('sucesso') || msg.includes('resultado')) {
    return {
      sql: "SELECT resultado, COUNT(*) as total FROM calibracao GROUP BY resultado;",
      template: (rows) => {
        if (!rows || rows.length === 0) return "Nenhuma calibração encontrada no histórico.";
        let res = "Aqui está o resumo das calibrações de hardware do banco (Modo Demonstrativo/Contingência):\n\n";
        rows.forEach(r => {
          res += `* Resultado: **${r.resultado}** - Total: **${r.total}**\n`;
        });
        return res;
      }
    };
  }

  return {
    isGeneral: true,
    response: "Olá! No momento estamos operando no **Modo de Demonstração Local** (limite de cota atingido ou chave 'mock'). Posso responder sobre 'QPUs', 'qubits instáveis', 'criostatos', 'T1' ou 'calibrações' consultando seu banco de dados!"
  };
}

// Endpoint do Copilot Inteligente com Gemini
app.post('/api/copilot/chat', async (req, res) => {
  try {
    const { message, history, apiKey, model } = req.body;
    const keyToUse = apiKey || process.env.GEMINI_API_KEY;

    if (!keyToUse) {
      return res.status(400).json({ error: 'Gemini API Key não fornecida. Configure no arquivo .env ou informe na interface.' });
    }

    // Se o usuário digitou 'mock' no frontend, entra diretamente no Modo Demonstrativo Local
    if (keyToUse.toLowerCase() === 'mock') {
      const mock = getMockResponse(message);
      if (mock.isGeneral) {
        return res.json({ response: mock.response, model: 'MockAgent' });
      } else {
        const dbResult = await pool.query(mock.sql);
        const text = mock.template(dbResult.rows);
        return res.json({ response: text, sql: mock.sql, dbResult: dbResult.rows, model: 'MockAgent' });
      }
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

    let result;
    let geminiResponse;
    let modelUsed;

    try {
      result = await callGemini(contents, model);
      geminiResponse = result.text;
      modelUsed = result.activeModel;
    } catch (geminiErr) {
      console.warn("Falha ao chamar Gemini (Cota/Limite), usando contingência local...", geminiErr.message);
      const mock = getMockResponse(message);
      const suffix = `\n\n*(⚠️ Nota: A API do Gemini retornou erro de limite de cota: "${geminiErr.message}". O sistema ativou o agente de contingência local para responder usando dados reais do seu banco de dados.)*`;
      if (mock.isGeneral) {
        return res.json({ response: mock.response + suffix, model: 'MockAgent' });
      } else {
        const dbResult = await pool.query(mock.sql);
        const text = mock.template(dbResult.rows);
        return res.json({ response: text + suffix, sql: mock.sql, dbResult: dbResult.rows, model: 'MockAgent' });
      }
    }

    const sqlMatch = geminiResponse.match(/\[SQL\]\s*([\s\S]+)$/i);
    if (sqlMatch) {
      let sqlQuery = sqlMatch[1].trim();
      sqlQuery = sqlQuery.replace(/^```sql\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/, '').trim();
      
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
        console.warn("Falha na segunda chamada Gemini, usando formatação de contingência local...", geminiErr.message);
        const mock = getMockResponse(message);
        const suffix = `\n\n*(⚠️ Nota: Erro de limite de cota do Gemini ao formatar resposta final. Exibindo dados obtidos diretamente do banco de dados.)*`;
        let text = "";
        if (!mock.isGeneral && mock.template) {
          text = mock.template(dbResultRows);
        } else {
          text = `Encontrei ${dbResultRows?.length || 0} registros correspondentes no banco de dados.`;
        }
        res.json({ response: text + suffix, sql: sqlQuery, dbResult: dbResultRows, error: dbErrorMsg, model: 'MockAgent' });
      }
    } else {
      res.json({ response: geminiResponse, sql: null, dbResult: null, model: modelUsed });
    }
  } catch (err) {
    console.error("Erro na API Copilot:", err);
    res.status(500).json({ error: "Erro ao processar conversa: " + err.message });
  }
});

// ================= REQUISITO 5/6: INICIALIZAR E RESETAR BANCO =================
app.post('/api/db/init', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. RegistroAmbiente
    await client.query(`
      CREATE TABLE IF NOT EXISTS registroambiente (
        id_registro_ambiente SERIAL PRIMARY KEY,
        data_hora_registro TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        temperatura DECIMAL(10,4),
        pressao DECIMAL(10,4),
        umidade DECIMAL(10,4),
        vibracao DECIMAL(10,4),
        campo_magnetico DECIMAL(10,4),
        observacoes TEXT
      );
    `);

    // 2. Criostato
    await client.query(`
      CREATE TABLE IF NOT EXISTS criostato (
        id_criostato SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        fabricante VARCHAR(255),
        modelo VARCHAR(255),
        temperatura_nominal DECIMAL(10,4),
        status_operacional VARCHAR(255) DEFAULT 'Ativo'
      );
    `);

    // 3. Pesquisador
    await client.query(`
      CREATE TABLE IF NOT EXISTS pesquisador (
        id_pesquisador SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        instituicao VARCHAR(255),
        area_atuacao VARCHAR(255)
      );
    `);

    // 4. QPU
    await client.query(`
      CREATE TABLE IF NOT EXISTS qpu (
        id_qpu SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        fabricante VARCHAR(255),
        modelo VARCHAR(255),
        tecnologia VARCHAR(255),
        data_instalacao DATE,
        status_operacional VARCHAR(255) DEFAULT 'Ativo',
        id_criostato INT NOT NULL REFERENCES criostato(id_criostato) ON DELETE RESTRICT
      );
    `);

    // 5. Qubit
    await client.query(`
      CREATE TABLE IF NOT EXISTS qubit (
        id_qubit SERIAL PRIMARY KEY,
        indice_qubit INT,
        tipo_qubit VARCHAR(255),
        frequencia_ressonancia DECIMAL(10,4),
        status_qubit VARCHAR(255) DEFAULT 'Saudável',
        observacoes TEXT,
        id_qpu INT NOT NULL REFERENCES qpu(id_qpu) ON DELETE CASCADE
      );
    `);

    // 6. Experimento
    await client.query(`
      CREATE TABLE IF NOT EXISTS experimento (
        id_experimento SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        objetivo TEXT,
        data_hora_inicio TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        data_hora_fim TIMESTAMP WITHOUT TIME ZONE,
        status_execucao VARCHAR(255) DEFAULT 'Planejado',
        observacoes TEXT,
        id_pesquisador INT NOT NULL REFERENCES pesquisador(id_pesquisador) ON DELETE RESTRICT,
        id_qpu INT NOT NULL REFERENCES qpu(id_qpu) ON DELETE CASCADE,
        id_registro_ambiente INT REFERENCES registroambiente(id_registro_ambiente) ON DELETE SET NULL
      );
    `);

    // 7. Calibracao
    await client.query(`
      CREATE TABLE IF NOT EXISTS calibracao (
        id_calibracao SERIAL PRIMARY KEY,
        data_hora_inicio TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        data_hora_fim TIMESTAMP WITHOUT TIME ZONE,
        tipo_calibracao VARCHAR(255),
        versao_parametros VARCHAR(255),
        resultado VARCHAR(255),
        observacoes TEXT,
        id_pesquisador INT NOT NULL REFERENCES pesquisador(id_pesquisador) ON DELETE RESTRICT,
        id_qpu INT NOT NULL REFERENCES qpu(id_qpu) ON DELETE CASCADE,
        id_registro_ambiente INT REFERENCES registroambiente(id_registro_ambiente) ON DELETE SET NULL
      );
    `);

    // 8. MedeQubit
    await client.query(`
      CREATE TABLE IF NOT EXISTS medequbit (
        id_experimento INT REFERENCES experimento(id_experimento) ON DELETE CASCADE,
        id_qubit INT REFERENCES qubit(id_qubit) ON DELETE CASCADE,
        nome_metrica VARCHAR(255) NOT NULL,
        valor DECIMAL(12,6),
        unidade VARCHAR(255),
        data_hora_medicao TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        metodo_obtencao VARCHAR(255),
        observacoes TEXT,
        PRIMARY KEY (id_experimento, id_qubit, nome_metrica)
      );
    `);

    // 9. PortaQuantica
    await client.query(`
      CREATE TABLE IF NOT EXISTS portaquantica (
        id_porta SERIAL PRIMARY KEY,
        nome_porta VARCHAR(255) NOT NULL,
        categoria VARCHAR(255),
        numero_qubits_alvo SMALLINT DEFAULT 1,
        descricao TEXT
      );
    `);

    // 10. MedePorta
    await client.query(`
      CREATE TABLE IF NOT EXISTS medeporta (
        id_experimento INT REFERENCES experimento(id_experimento) ON DELETE CASCADE,
        id_porta INT REFERENCES portaquantica(id_porta) ON DELETE CASCADE,
        nome_metrica VARCHAR(255) NOT NULL,
        valor DECIMAL(12,6),
        unidade VARCHAR(255),
        data_hora_medicao TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        metodo_obtencao VARCHAR(255),
        observacoes TEXT,
        PRIMARY KEY (id_experimento, id_porta, nome_metrica)
      );
    `);

    // 11. SequenciaPulso
    await client.query(`
      CREATE TABLE IF NOT EXISTS sequenciapulso (
        id_sequencia SERIAL PRIMARY KEY,
        nome VARCHAR(255),
        finalidade VARCHAR(255),
        versao VARCHAR(255),
        descricao TEXT
      );
    `);

    // 12. Pulso
    await client.query(`
      CREATE TABLE IF NOT EXISTS pulso (
        id_pulso SERIAL PRIMARY KEY,
        ordem INT,
        tipo_pulso VARCHAR(255),
        amplitude DECIMAL(10,4),
        duracao DECIMAL(10,4),
        frequencia DECIMAL(10,4),
        fase DECIMAL(10,4),
        forma_onda VARCHAR(255),
        id_sequencia INT NOT NULL REFERENCES sequenciapulso(id_sequencia) ON DELETE CASCADE
      );
    `);

    // 13. Implementa (Relação N:M)
    await client.query(`
      CREATE TABLE IF NOT EXISTS implementa (
        id_sequencia INT REFERENCES sequenciapulso(id_sequencia) ON DELETE CASCADE,
        id_porta INT REFERENCES portaquantica(id_porta) ON DELETE CASCADE,
        PRIMARY KEY (id_sequencia, id_porta)
      );
    `);

    // 14. AtuaSobre (Relação N:M)
    await client.query(`
      CREATE TABLE IF NOT EXISTS atuasobre (
        id_porta INT REFERENCES portaquantica(id_porta) ON DELETE CASCADE,
        id_qubit INT REFERENCES qubit(id_qubit) ON DELETE CASCADE,
        PRIMARY KEY (id_porta, id_qubit)
      );
    `);

    // 15. UtilizaCalibracao (Relação N:M)
    await client.query(`
      CREATE TABLE IF NOT EXISTS utilizacalibracao (
        id_calibracao INT REFERENCES calibracao(id_calibracao) ON DELETE CASCADE,
        id_sequencia INT REFERENCES sequenciapulso(id_sequencia) ON DELETE CASCADE,
        PRIMARY KEY (id_calibracao, id_sequencia)
      );
    `);

    // 16. UtilizaExperimento (Relação N:M)
    await client.query(`
      CREATE TABLE IF NOT EXISTS utilizaexperimento (
        id_experimento INT REFERENCES experimento(id_experimento) ON DELETE CASCADE,
        id_sequencia INT REFERENCES sequenciapulso(id_sequencia) ON DELETE CASCADE,
        PRIMARY KEY (id_experimento, id_sequencia)
      );
    `);

    // 17. Abrange (Relação N:M)
    await client.query(`
      CREATE TABLE IF NOT EXISTS abrange (
        id_calibracao INT REFERENCES calibracao(id_calibracao) ON DELETE CASCADE,
        id_qubit INT REFERENCES qubit(id_qubit) ON DELETE CASCADE,
        parametro_ajustado VARCHAR(255),
        valor_antes DECIMAL(12,6),
        valor_depois DECIMAL(12,6),
        PRIMARY KEY (id_calibracao, id_qubit)
      );
    `);

    // Carga de dados (inserindo apenas se as tabelas estiverem vazias para evitar duplicados)
    const countQpus = await client.query('SELECT COUNT(*) FROM qpu;');
    if (parseInt(countQpus.rows[0].count) === 0) {
      // Criostatos
      await client.query("INSERT INTO criostato (nome, fabricante, modelo, temperatura_nominal, status_operacional) VALUES ('Criostato Principal', 'Bluefors', 'LD250', 0.0100, 'Ativo'), ('Criostato de Testes', 'Oxford Instruments', 'Triton', 0.0150, 'Ativo');");
      
      // QPUs (cada uma com 20 qubits)
      await client.query("INSERT INTO qpu (nome, fabricante, modelo, tecnologia, data_instalacao, status_operacional, id_criostato) VALUES ('QPU Triton-20', 'IBM', 'Quantum Eagle v3', 'Supercondutor', '2025-01-15', 'Ativo', 1), ('QPU Borealis-20', 'Xanadu', 'Photonic 20Q', 'Fotônica', '2025-05-10', 'Ativo', 2);");

      // Qubits para Triton-20
      for (let i = 0; i < 20; i++) {
        let status = 'Saudável';
        if (i === 13) status = 'Crítico';
        else if ([5, 17].includes(i)) status = 'Atenção';
        await client.query(`INSERT INTO qubit (indice_qubit, tipo_qubit, frequencia_ressonancia, status_qubit, observacoes, id_qpu) VALUES ($1, 'Transmon', $2, $3, 'Qubit padrão da grade supercondutora', 1);`, [i, 5.0 + i * 0.05, status]);
      }
      // Qubits para Borealis-20
      for (let i = 0; i < 20; i++) {
        await client.query(`INSERT INTO qubit (indice_qubit, tipo_qubit, frequencia_ressonancia, status_qubit, observacoes, id_qpu) VALUES ($1, 'Fóton polarizado', $2, 'Saudável', 'Qubit óptico', 2);`, [i, 193.1 + i * 0.1]);
      }

      // Pesquisadores
      await client.query("INSERT INTO pesquisador (nome, email, instituicao, area_atuacao) VALUES ('Dr. Alice Smith', 'alice@ufsc.br', 'UFSC', 'Controle Quântico'), ('Bob Jones', 'bob@ufsc.br', 'UFSC', 'Mitigação de Erros');");

      // Registros Ambientais
      await client.query("INSERT INTO registroambiente (data_hora_registro, temperatura, pressao, umidade, vibracao, campo_magnetico, observacoes) VALUES (NOW() - INTERVAL '4 days', 0.0110, 0.85, 30.5, 0.04, 0.12, 'Estável'), (NOW() - INTERVAL '3 days', 0.0105, 0.82, 31.0, 0.03, 0.11, 'Flutuação pequena'), (NOW() - INTERVAL '2 days', 0.0120, 0.90, 32.2, 0.06, 0.15, 'Porta aberta rapidamente'), (NOW() - INTERVAL '1 day', 0.0100, 0.80, 29.8, 0.02, 0.10, 'Excelente isolamento'), (NOW(), 0.0102, 0.81, 30.1, 0.03, 0.11, 'Condição nominal');");

      // Experimentos (criando 5 experimentos de calibração/caracterização diários para o histórico, e outros de teste)
      // Experimento 1 (Fidelidade original): 3 dias atrás
      await client.query("INSERT INTO experimento (nome, objetivo, data_hora_inicio, data_hora_fim, status_execucao, observacoes, id_pesquisador, id_qpu, id_registro_ambiente) VALUES ('Fidelidade CNOT', 'Medir fidelidade de porta de dois qubits', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '1 hour', 'Concluído', 'Fidelidade aceitável', 1, 1, 2);");
      
      // Experimentos 2, 3, 4, 5, 6 (Um experimento para cada um dos 5 dias de medição de telemetria)
      for (let day = 4; day >= 0; day--) {
        await client.query(`INSERT INTO experimento (nome, objetivo, data_hora_inicio, data_hora_fim, status_execucao, observacoes, id_pesquisador, id_qpu, id_registro_ambiente) VALUES ('Caracterização Diária T1/Portas', 'Medição diária automática de telemetria e calibração', NOW() - ($1 * INTERVAL '1 day'), NOW() - ($1 * INTERVAL '1 day') + INTERVAL '30 minutes', 'Concluído', 'Rotina automatizada', 2, 1, $2);`, [day, 5 - day]);
      }
      
      // Experimento 7 (Caracterização Óptica)
      await client.query("INSERT INTO experimento (nome, objetivo, data_hora_inicio, data_hora_fim, status_execucao, observacoes, id_pesquisador, id_qpu, id_registro_ambiente) VALUES ('Caracterização Óptica', 'Medir fontes de fótons únicos', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '2 hours', 'Concluído', 'Taxa de coincidência excelente', 1, 2, 4);");
      
      // Experimento 8 (Simulação VQE)
      await client.query("INSERT INTO experimento (nome, objetivo, data_hora_inicio, data_hora_fim, status_execucao, observacoes, id_pesquisador, id_qpu, id_registro_ambiente) VALUES ('Simulação VQE', 'Rodar algoritmo VQE para molécula de H2', NOW(), NULL, 'Executando', 'Executando em background', 2, 1, 5);");

      // Calibrações
      await client.query(`
        INSERT INTO calibracao (data_hora_inicio, data_hora_fim, tipo_calibracao, versao_parametros, resultado, observacoes, id_pesquisador, id_qpu, id_registro_ambiente) 
        VALUES 
        (NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '2 hours', 'Frequência de Qubit', 'v1.4.2', 'Sucesso', 'Frequências calibradas com erro < 100 kHz', 1, 1, 1), 
        (NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '1 hour', 'Pulso de Pi', 'v1.4.3', 'Otimização Parcial', 'Amplitude ajustada para 12.3 mV', 2, 1, 3),
        (NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '30 minutes', 'Calibração de Leitura', 'v1.4.4', 'Falha Crítica', 'Ruído excessivo no amplificador criogênico HEMT', 1, 1, 4);
      `);

      // Porta Quantica
      await client.query("INSERT INTO portaquantica (nome_porta, categoria, numero_qubits_alvo, descricao) VALUES ('Hadamard', '1-Qubit', 1, 'Cria superposição de estados'), ('Pauli-X', '1-Qubit', 1, 'Porta NOT quântica'), ('CNOT', '2-Qubits', 2, 'Porta lógica controlada-NOT');");

      // MedeQubit (T1 e TaxaErro) dinâmico para todos os qubits gerados, associando ao experimento de cada dia
      const allQubits = await client.query('SELECT id_qubit FROM qubit;');
      for (let day = 4; day >= 0; day--) {
        const expId = 6 - day; // Mapeia dia 4 -> id_exp 2, dia 3 -> id_exp 3, ..., dia 0 -> id_exp 6
        for (const row of allQubits.rows) {
          const qId = row.id_qubit;
          await client.query(`INSERT INTO medequbit (id_experimento, id_qubit, nome_metrica, valor, unidade, data_hora_medicao, metodo_obtencao) VALUES ($1, $2, 'T1', $3, 'μs', NOW() - ($4 * INTERVAL '1 day'), 'Decaimento Livre');`, [expId, qId, 60.0 + Math.sin(qId + day) * 15.0, day]);
          await client.query(`INSERT INTO medequbit (id_experimento, id_qubit, nome_metrica, valor, unidade, data_hora_medicao, metodo_obtencao) VALUES ($1, $2, 'TaxaErro', $3, 'taxa', NOW() - ($4 * INTERVAL '1 day'), 'Tomografia de Leitura');`, [expId, qId, 0.01 + Math.cos(qId - day) * 0.005, day]);
        }
      }

      // MedePorta (Fidelidade) associando ao experimento de cada dia
      for (let day = 4; day >= 0; day--) {
        const expId = 6 - day; // Mapeia dia 4 -> id_exp 2, dia 3 -> id_exp 3, ..., dia 0 -> id_exp 6
        await client.query(`INSERT INTO medeporta (id_experimento, id_porta, nome_metrica, valor, unidade, data_hora_medicao, metodo_obtencao) VALUES ($1, 1, 'Fidelidade', $2, 'taxa', NOW() - ($3 * INTERVAL '1 day'), 'Randomized Benchmarking');`, [expId, 0.992 + Math.sin(day) * 0.003, day]);
        await client.query(`INSERT INTO medeporta (id_experimento, id_porta, nome_metrica, valor, unidade, data_hora_medicao, metodo_obtencao) VALUES ($1, 3, 'Fidelidade', $2, 'taxa', NOW() - ($3 * INTERVAL '1 day'), 'Interleaved RB');`, [expId, 0.975 + Math.cos(day) * 0.004, day]);
      }

      // Sequencias de Pulso
      await client.query("INSERT INTO sequenciapulso (nome, finalidade, versao, descricao) VALUES ('Seq-RB-1Q', 'Fidelidade', 'v1.0.0', 'Sequência de Clifford para Randomized Benchmarking de 1 qubit'), ('Seq-Calib-Pi', 'Calibração', 'v2.1.0', 'Sequência de pulso de pi para calibração de amplitude');");

      // Pulsos
      await client.query("INSERT INTO pulso (ordem, tipo_pulso, amplitude, duracao, frequencia, fase, forma_onda, id_sequencia) VALUES (1, 'Gaussian', 0.50, 20.0, 5.12, 0.0, 'Gaussiana', 1), (2, 'DRAG', 0.48, 20.0, 5.12, 90.0, 'Formato DRAG', 1), (1, 'Rabi', 0.60, 40.0, 5.10, 0.0, 'Retangular', 2);");

      // Relações N:M (Seed)
      await client.query("INSERT INTO implementa (id_sequencia, id_porta) VALUES (1, 1), (2, 2);");
      await client.query("INSERT INTO atuasobre (id_porta, id_qubit) VALUES (1, 1), (2, 2);");
      await client.query("INSERT INTO utilizacalibracao (id_calibracao, id_sequencia) VALUES (1, 2);");
      await client.query("INSERT INTO utilizaexperimento (id_experimento, id_sequencia) VALUES (1, 1);");
      await client.query("INSERT INTO abrange (id_calibracao, id_qubit, parametro_ajustado, valor_antes, valor_depois) VALUES (1, 1, 'Frequência Rabi', 5.250, 5.248);");
    }

    await client.query('COMMIT');
    res.json({ message: "Todas as 17 tabelas e relações criadas com sucesso e banco de dados populado com valores padrões!" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send("Erro ao inicializar e popular o banco de dados: " + err.message);
  } finally {
    client.release();
  }
});

app.post('/api/db/drop', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Deleta as tabelas relacionais N:M primeiro por causa das dependências
    await client.query('DROP TABLE IF EXISTS abrange CASCADE;');
    await client.query('DROP TABLE IF EXISTS utilizaexperimento CASCADE;');
    await client.query('DROP TABLE IF EXISTS utilizacalibracao CASCADE;');
    await client.query('DROP TABLE IF EXISTS atuasobre CASCADE;');
    await client.query('DROP TABLE IF EXISTS implementa CASCADE;');
    
    // Deleta as tabelas com dependências secundárias
    await client.query('DROP TABLE IF EXISTS pulso CASCADE;');
    await client.query('DROP TABLE IF EXISTS sequenciapulso CASCADE;');
    await client.query('DROP TABLE IF EXISTS medeporta CASCADE;');
    await client.query('DROP TABLE IF EXISTS portaquantica CASCADE;');
    await client.query('DROP TABLE IF EXISTS medequbit CASCADE;');
    await client.query('DROP TABLE IF EXISTS calibracao CASCADE;');
    await client.query('DROP TABLE IF EXISTS experimento CASCADE;');
    await client.query('DROP TABLE IF EXISTS qubit CASCADE;');
    await client.query('DROP TABLE IF EXISTS qpu CASCADE;');
    await client.query('DROP TABLE IF EXISTS criostato CASCADE;');
    await client.query('DROP TABLE IF EXISTS registroambiente CASCADE;');
    await client.query('DROP TABLE IF EXISTS pesquisador CASCADE;');
    
    // Deleta sequências residuais
    await client.query('DROP SEQUENCE IF EXISTS qpu_id_qpu_seq CASCADE;');
    await client.query('DROP SEQUENCE IF EXISTS pesquisador_id_pesquisador_seq CASCADE;');
    await client.query('DROP SEQUENCE IF EXISTS qubit_id_qubit_seq CASCADE;');
    await client.query('DROP SEQUENCE IF EXISTS criostato_id_criostato_seq CASCADE;');
    await client.query('DROP SEQUENCE IF EXISTS experimento_id_experimento_seq CASCADE;');
    await client.query('DROP SEQUENCE IF EXISTS calibracao_id_calibracao_seq CASCADE;');
    await client.query('DROP SEQUENCE IF EXISTS sequenciapulso_id_sequencia_seq CASCADE;');
    await client.query('DROP SEQUENCE IF EXISTS pulso_id_pulso_seq CASCADE;');
    await client.query('DROP SEQUENCE IF EXISTS portaquantica_id_porta_seq CASCADE;');
    await client.query('DROP SEQUENCE IF EXISTS registroambiente_id_registro_ambiente_seq CASCADE;');

    await client.query('COMMIT');
    res.json({ message: "Todas as 17 tabelas e sequências foram eliminadas com sucesso!" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send("Erro ao eliminar as tabelas: " + err.message);
  } finally {
    client.release();
  }
});

app.listen(8000, () => { console.log('Backend rodando na porta 8000'); });