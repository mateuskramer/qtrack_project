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

// Relatório 1: Evolução Diária do T1
app.get('/api/relatorios/t1', async (req, res) => {
  try {
    const query = `
      SELECT DATE(data_hora_medicao) as data, AVG(valor) as media_t1
      FROM MedeQubit
      WHERE nome = 'T1'
      GROUP BY DATE(data_hora_medicao)
      ORDER BY data;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro no Relatório 1');
  }
});

// Relatório 2: Fidelidade por Categoria de Porta
app.get('/api/relatorios/fidelidade', async (req, res) => {
  try {
    const query = `
      SELECT pq.numero_qubits_alvo || ' Qubit(s)' as categoria, AVG(mp.valor) as fidelidade_media
      FROM MedePorta mp
      JOIN PortaQuantica pq ON mp.id_porta = pq.id_porta
      WHERE mp.nome = 'Fidelidade'
      GROUP BY pq.numero_qubits_alvo;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro no Relatório 2');
  }
});

// Relatório 3: Impacto da Temperatura no Erro
app.get('/api/relatorios/temperatura', async (req, res) => {
  try {
    const query = `
      SELECT ra.temperatura, AVG(mq.valor) as taxa_erro_media
      FROM RegistroAmbiente ra
      JOIN Experimento e ON ra.id_registro_ambiente = e.id_registro_ambiente
      JOIN MedeQubit mq ON e.id_experimento = mq.id_experimento
      WHERE mq.nome = 'Erro de Leitura'
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