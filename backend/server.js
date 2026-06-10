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

// GET - Listar QPUs
// GET - Listar QPUs
app.get('/api/qpus', async (req, res) => {
  try {
    // Adicionado id_criostato no final do SELECT
    const result = await pool.query('SELECT id_qpu, nome, fabricante, modelo, tecnologia, data_instalacao, status_operacional, id_criostato FROM QPU;');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro');
  }
});

// POST - Inserir QPU
app.post('/api/qpus', async (req, res) => {
  try {
    const { nome, fabricante, modelo, tecnologia, data_instalacao, status_operacional, id_criostato } = req.body;
    const result = await pool.query(
      'INSERT INTO QPU (nome, fabricante, modelo, tecnologia, data_instalacao, status_operacional, id_criostato) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;',
      [nome, fabricante, modelo, tecnologia, data_instalacao, status_operacional, id_criostato]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao inserir');
  }
});

// DELETE - Excluir QPU
app.delete('/api/qpus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM QPU WHERE id_qpu = $1;', [id]);
    res.json({ message: "QPU excluída" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro ao excluir');
  }
});

// PUT - Atualizar QPU
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
    console.error(err.message);
    res.status(500).send('Erro ao atualizar');
  }
});

// ================= RELATÓRIOS (ITEM 6) =================

// Relatório 1 Avançado: Evolução Diária do T1 com Pior Qubit do Dia
app.get('/api/relatorios/t1', async (req, res) => {
  try {
    const query = `
      WITH diario_qpu AS (
        SELECT 
          p.id_qpu, p.nome as qpu_nome, DATE(mq.data_hora_medicao) as data, AVG(mq.valor) as media_t1
        FROM MedeQubit mq
        JOIN Qubit q ON mq.id_qubit = q.id_qubit
        JOIN QPU p ON q.id_qpu = p.id_qpu
        WHERE mq.nome_metrica IN ('T1', 'Tempo de Coerência', 'Coherence Time')
        GROUP BY p.id_qpu, p.nome, DATE(mq.data_hora_medicao)
      ),
      ranqueamento_piores AS (
        SELECT 
          q.id_qpu, DATE(mq.data_hora_medicao) as data, mq.id_qubit as pior_qubit_id, mq.valor as pior_valor_t1,
          ROW_NUMBER() OVER(PARTITION BY q.id_qpu, DATE(mq.data_hora_medicao) ORDER BY mq.valor ASC) as rn
        FROM MedeQubit mq
        JOIN Qubit q ON mq.id_qubit = q.id_qubit
        WHERE mq.nome_metrica IN ('T1', 'Tempo de Coerência', 'Coherence Time')
      )
      SELECT 
        d.qpu_nome, d.data, d.media_t1, r.pior_qubit_id, r.pior_valor_t1
      FROM diario_qpu d
      LEFT JOIN ranqueamento_piores r ON d.id_qpu = r.id_qpu AND d.data = r.data AND r.rn = 1
      ORDER BY d.data ASC, d.qpu_nome ASC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro no Relatório 1');
  }
});

// Relatório 2: Fidelidade por Categoria de Porta (MedePorta, PortaQuantica, Experimento)
app.get('/api/relatorios/fidelidade', async (req, res) => {
  try {
    const query = `
      SELECT pq.numero_qubits_alvo || ' Qubit(s)' as categoria, AVG(mp.valor) as fidelidade_media
      FROM MedePorta mp
      JOIN PortaQuantica pq ON mp.id_porta = pq.id_porta
      JOIN Experimento e ON mp.id_experimento = e.id_experimento
      WHERE mp.nome_metrica IN ('Fidelidade', 'Fidelity', 'Gate Fidelity')
      GROUP BY pq.numero_qubits_alvo;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro no Relatório 2');
  }
});

// Relatório 3: Impacto da Temperatura no Erro (RegistroAmbiente, Experimento, MedeQubit)
app.get('/api/relatorios/temperatura', async (req, res) => {
  try {
    const query = `
      SELECT ra.temperatura, AVG(mq.valor) as taxa_erro_media
      FROM RegistroAmbiente ra
      JOIN Experimento e ON ra.id_registro_ambiente = e.id_registro_ambiente
      JOIN MedeQubit mq ON e.id_experimento = mq.id_experimento
      WHERE mq.nome_metrica IN ('Erro de Leitura', 'Readout Error', 'Measurement Error')
      GROUP BY ra.temperatura
      ORDER BY ra.temperatura;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro no Relatório 3');
  }
});

// Inicia o servidor (sempre no final do arquivo)
app.listen(8000, () => {
  console.log('Backend rodando na porta 8000');
});