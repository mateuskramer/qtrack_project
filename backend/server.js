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

// ================= CRUD DE QPUs =================

// GET - Listar QPUs
app.get('/api/qpus', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_qpu, nome, fabricante, modelo, tecnologia, data_instalacao, status_operacional, id_criostato FROM QPU;');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao buscar QPUs');
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
    console.error(err.message); res.status(500).send('Erro ao inserir QPU');
  }
});

// DELETE - Excluir QPU
app.delete('/api/qpus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM QPU WHERE id_qpu = $1;', [id]);
    res.json({ message: "QPU excluída" });
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao excluir QPU');
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
    console.error(err.message); res.status(500).send('Erro ao atualizar QPU');
  }
});

// ================= RELATÓRIOS ACADÊMICOS (ITEM 6) =================

// Relatório 1: Evolução Diária do T1 com Pior Qubit do Dia
app.get('/api/relatorios/t1', async (req, res) => {
  try {
    const query = `
      WITH diario_qpu AS (
        SELECT 
          p.id_qpu, p.nome as qpu_nome, DATE(mq.data_hora_medicao) as data, AVG(mq.valor) as media_t1
        FROM MedeQubit mq
        JOIN Qubit q ON mq.id_qubit = q.id_qubit
        JOIN QPU p ON q.id_qpu = p.id_qpu
        WHERE mq.nome_metrica = 'T1'
        GROUP BY p.id_qpu, p.nome, DATE(mq.data_hora_medicao)
      ),
      ranqueamento_piores AS (
        SELECT 
          q.id_qpu, DATE(mq.data_hora_medicao) as data, mq.id_qubit as pior_qubit_id, mq.valor as pior_valor_t1,
          ROW_NUMBER() OVER(PARTITION BY q.id_qpu, DATE(mq.data_hora_medicao) ORDER BY mq.valor ASC) as rn
        FROM MedeQubit mq
        JOIN Qubit q ON mq.id_qubit = q.id_qubit
        WHERE mq.nome_metrica = 'T1'
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

// Relatório 2: Fidelidade por Porta Quântica E Categoria
app.get('/api/relatorios/fidelidade', async (req, res) => {
  try {
    const query = `
      SELECT 
        pq.nome_porta,
        pq.numero_qubits_alvo || ' Qubit(s)' as categoria, 
        AVG(mp.valor) as fidelidade_media
      FROM MedePorta mp
      JOIN PortaQuantica pq ON mp.id_porta = pq.id_porta
      JOIN Experimento e ON mp.id_experimento = e.id_experimento
      WHERE mp.nome_metrica = 'Fidelidade'
      GROUP BY pq.nome_porta, pq.numero_qubits_alvo
      ORDER BY categoria DESC, fidelidade_media DESC;
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
      WHERE mq.nome_metrica = 'TaxaErro'
      GROUP BY ra.temperatura
      ORDER BY ra.temperatura;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro no Relatório 3');
  }
});

// ================= DASHBOARD DINÂMICO REAL-TIME =================

// 1. Estado Atual dos Qubits, Cards e Fidelidades por QPU (Corrigido)
app.get('/api/dashboard/qubits/:id_qpu', async (req, res) => {
  try {
    const { id_qpu } = req.params;
    
    // Lista de qubits para o Heatmap
    const mapaQuery = `SELECT id_qubit, status_qubit as status_operacional FROM Qubit WHERE id_qpu = $1 ORDER BY id_qubit;`;
    const mapaResult = await pool.query(mapaQuery, [id_qpu]);

    // Médias de T1 e TaxaErro
    const cardsQuery = `
      SELECT mq.nome_metrica, AVG(mq.valor) as media
      FROM MedeQubit mq
      JOIN Qubit q ON mq.id_qubit = q.id_qubit
      WHERE q.id_qpu = $1 AND mq.nome_metrica IN ('T1', 'TaxaErro')
      GROUP BY mq.nome_metrica;
    `;
    const cardsResult = await pool.query(cardsQuery, [id_qpu]);

    // Fidelidades reais buscando direto pela relação da QPU no Experimento
    const fidelidadeQuery = `
      SELECT pq.numero_qubits_alvo, AVG(mp.valor) as media
      FROM MedePorta mp
      JOIN PortaQuantica pq ON mp.id_porta = pq.id_porta
      JOIN Experimento e ON mp.id_experimento = e.id_experimento
      WHERE e.id_qpu = $1 AND mp.nome_metrica = 'Fidelidade'
      GROUP BY pq.numero_qubits_alvo;
    `;
    const fidResult = await pool.query(fidelidadeQuery, [id_qpu]);

    res.json({
      mapa: mapaResult.rows,
      metricas: cardsResult.rows,
      fidelidades: fidResult.rows
    });
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro no Dashboard (Qubits)');
  }
});

// 2. Condições em Tempo Real do Criostato da QPU selecionada
app.get('/api/dashboard/ambiente/:id_qpu', async (req, res) => {
  try {
    const { id_qpu } = req.params;
    const query = `
      SELECT ra.temperatura, ra.pressao, ra.vibracao
      FROM RegistroAmbiente ra
      JOIN Experimento e ON ra.id_registro_ambiente = e.id_registro_ambiente
      JOIN MedeQubit mq ON e.id_experimento = mq.id_experimento
      JOIN Qubit q ON mq.id_qubit = q.id_qubit
      WHERE q.id_qpu = $1
      ORDER BY ra.data_hora_registro DESC
      LIMIT 1;
    `;
    const result = await pool.query(query, [id_qpu]);
    res.json(result.rows[0] || { temperatura: 0, pressao: 0, vibracao: 0 });
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro no Dashboard (Ambiente)');
  }
});

app.listen(8000, () => {
  console.log('Backend rodando na porta 8000');
});