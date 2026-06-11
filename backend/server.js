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

app.listen(8000, () => { console.log('Backend rodando na porta 8000'); });