require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

let dbConfig = {
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'qtrack',
  password: process.env.PGPASSWORD || '1234',
  port: parseInt(process.env.PGPORT || '5432'),
};

let pool = new Pool(dbConfig);


// Auxiliar para popular selects de logs ambientais nas chaves estrangeiras
app.get('/api/registro-ambiente', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_registro_ambiente, data_hora_registro, temperatura FROM RegistroAmbiente ORDER BY data_hora_registro DESC;');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao buscar Registros de Ambiente');
  }
});

app.post('/api/registro-ambiente', async (req, res) => {
  const { temperatura, pressao, umidade, vibracao, campo_magnetico, observacoes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO RegistroAmbiente (temperatura, pressao, umidade, vibracao, campo_magnetico, observacoes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
      [temperatura, pressao, umidade, vibracao, campo_magnetico, observacoes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao inserir Registro de Ambiente');
  }
});

app.get('/api/sequencias-pulso', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_sequencia, nome, finalidade, versao, descricao FROM SequenciaPulso ORDER BY id_sequencia;');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao buscar Sequências de Pulso');
  }
});

// ================= 1. CRUD DE QPUs =================
app.get('/api/qpus', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_qpu, nome, fabricante, modelo, tecnologia, data_instalacao, status_operacional, id_criostato FROM Qpu ORDER BY id_qpu;');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao buscar QPUs');
  }
});

app.post('/api/qpus', async (req, res) => {
  try {
    const { nome, fabricante, modelo, tecnologia, data_instalacao, status_operacional, id_criostato } = req.body;
    const result = await pool.query(
      'INSERT INTO Qpu (nome, fabricante, modelo, tecnologia, data_instalacao, status_operacional, id_criostato) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;',
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
      'UPDATE Qpu SET nome=$1, fabricante=$2, modelo=$3, tecnologia=$4, data_instalacao=$5, status_operacional=$6, id_criostato=$7 WHERE id_qpu=$8 RETURNING *;',
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
    await pool.query('DELETE FROM Qpu WHERE id_qpu = $1;', [id]);
    res.json({ message: "QPU excluída" });
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao excluir QPU');
  }
});

// ================= 2. CRUD DE CRIOSTATOS =================
app.get('/api/criostatos', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_criostato, nome, fabricante, modelo, temperatura_nominal, status_operacional FROM Criostato ORDER BY id_criostato;');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao buscar Criostatos');
  }
});

app.post('/api/criostatos', async (req, res) => {
  try {
    const { nome, fabricante, modelo, temperatura_nominal, status_operacional } = req.body;
    const result = await pool.query(
      'INSERT INTO Criostato (nome, fabricante, modelo, temperatura_nominal, status_operacional) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
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
      'UPDATE Criostato SET nome=$1, fabricante=$2, modelo=$3, temperatura_nominal=$4, status_operacional=$5 WHERE id_criostato=$6 RETURNING *;',
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
    await pool.query('DELETE FROM Criostato WHERE id_criostato = $1;', [id]);
    res.json({ message: "Criostato excluído" });
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao excluir Criostato');
  }
});

// ================= 3. CRUD DE PESQUISADORES =================
app.get('/api/pesquisadores', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_pesquisador, nome, email, instituicao, area_atuacao FROM Pesquisador ORDER BY id_pesquisador;');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao buscar Pesquisadores');
  }
});

app.post('/api/pesquisadores', async (req, res) => {
  try {
    const { nome, email, instituicao, area_atuacao } = req.body;
    const result = await pool.query(
      'INSERT INTO Pesquisador (nome, email, instituicao, area_atuacao) VALUES ($1, $2, $3, $4) RETURNING *;',
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
      'UPDATE Pesquisador SET nome=$1, email=$2, instituicao=$3, area_atuacao=$4 WHERE id_pesquisador=$5 RETURNING *;',
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
    await pool.query('DELETE FROM Pesquisador WHERE id_pesquisador = $1;', [id]);
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
      JOIN Qpu p ON q.id_qpu = p.id_qpu
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
      SELECT e.*, p.nome as pesquisador_nome, q.nome as qpu_nome,
             (SELECT id_sequencia FROM SequenciaPulso_Experimento WHERE id_experimento = e.id_experimento LIMIT 1) as id_sequencia
      FROM Experimento e
      LEFT JOIN Pesquisador p ON e.id_pesquisador = p.id_pesquisador
      LEFT JOIN Qpu q ON e.id_qpu = q.id_qpu
      ORDER BY e.data_hora_inicio DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao buscar Experimentos');
  }
});

app.post('/api/experimentos', async (req, res) => {
  const client = await pool.connect();
  try {
    const { nome, objetivo, data_hora_inicio, data_hora_fim, status_execucao, observacoes, id_pesquisador, id_qpu, id_registro_ambiente, id_sequencia } = req.body;
    await client.query('BEGIN');
    const query = `
      INSERT INTO Experimento (nome, objetivo, data_hora_inicio, data_hora_fim, status_execucao, observacoes, id_pesquisador, id_qpu, id_registro_ambiente)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
    `;
    const result = await client.query(query, [nome, objetivo, data_hora_inicio || null, data_hora_fim || null, status_execucao, observacoes, id_pesquisador || null, id_qpu || null, id_registro_ambiente || null]);
    const exp = result.rows[0];
    if (id_sequencia) {
      await client.query('INSERT INTO SequenciaPulso_Experimento (id_experimento, id_sequencia) VALUES ($1, $2);', [exp.id_experimento, id_sequencia]);
    }
    await client.query('COMMIT');
    res.json(exp);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message); res.status(500).send('Erro ao inserir Experimento');
  } finally {
    client.release();
  }
});

app.put('/api/experimentos/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { nome, objetivo, data_hora_inicio, data_hora_fim, status_execucao, observacoes, id_pesquisador, id_qpu, id_registro_ambiente, id_sequencia } = req.body;
    await client.query('BEGIN');
    const query = `
      UPDATE Experimento 
      SET nome=$1, objetivo=$2, data_hora_inicio=$3, data_hora_fim=$4, status_execucao=$5, observacoes=$6, id_pesquisador=$7, id_qpu=$8, id_registro_ambiente=$9
      WHERE id_experimento=$10 RETURNING *;
    `;
    const result = await client.query(query, [nome, objetivo, data_hora_inicio, data_hora_fim, status_execucao, observacoes, id_pesquisador, id_qpu, id_registro_ambiente, id]);
    const exp = result.rows[0];
    await client.query('DELETE FROM SequenciaPulso_Experimento WHERE id_experimento = $1;', [id]);
    if (id_sequencia) {
      await client.query('INSERT INTO SequenciaPulso_Experimento (id_experimento, id_sequencia) VALUES ($1, $2);', [id, id_sequencia]);
    }
    await client.query('COMMIT');
    res.json(exp);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message); res.status(500).send('Erro ao atualizar Experimento');
  } finally {
    client.release();
  }
});

app.delete('/api/experimentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM Experimento WHERE id_experimento = $1;', [id]);
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
      FROM Experimento e
      LEFT JOIN Pesquisador p ON e.id_pesquisador = p.id_pesquisador
      LEFT JOIN Qpu q ON e.id_qpu = q.id_qpu
      LEFT JOIN RegistroAmbiente ra ON e.id_registro_ambiente = ra.id_registro_ambiente
      WHERE e.id_experimento = $1;
    `;
    const expResult = await pool.query(expQuery, [id]);
    if (expResult.rows.length === 0) {
      return res.status(404).send('Experimento não encontrado');
    }
    const experimento = expResult.rows[0];

    const seqQuery = `
      SELECT sp.*
      FROM SequenciaPulso sp
      JOIN SequenciaPulso_Experimento ue ON sp.id_sequencia = ue.id_sequencia
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
      SELECT c.*, p.nome as pesquisador_nome, q.nome as qpu_nome,
             (SELECT id_sequencia FROM SequenciaPulso_Calibracao WHERE id_calibracao = c.id_calibracao LIMIT 1) as id_sequencia
      FROM Calibracao c
      LEFT JOIN Pesquisador p ON c.id_pesquisador = p.id_pesquisador
      LEFT JOIN Qpu q ON c.id_qpu = q.id_qpu
      ORDER BY c.data_hora_inicio DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).send('Erro ao buscar Calibrações');
  }
});

app.post('/api/calibracoes', async (req, res) => {
  const client = await pool.connect();
  try {
    const { data_hora_inicio, data_hora_fim, tipo_calibracao, versao_parametros, resultado, observacoes, id_pesquisador, id_qpu, id_registro_ambiente, id_sequencia } = req.body;
    await client.query('BEGIN');
    const query = `
      INSERT INTO Calibracao (data_hora_inicio, data_hora_fim, tipo_calibracao, versao_parametros, resultado, observacoes, id_pesquisador, id_qpu, id_registro_ambiente)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
    `;
    const result = await client.query(query, [data_hora_inicio || null, data_hora_fim || null, tipo_calibracao, versao_parametros, resultado, observacoes, id_pesquisador || null, id_qpu || null, id_registro_ambiente || null]);
    const cal = result.rows[0];
    if (id_sequencia) {
      await client.query('INSERT INTO SequenciaPulso_Calibracao (id_calibracao, id_sequencia) VALUES ($1, $2);', [cal.id_calibracao, id_sequencia]);
    }
    await client.query('COMMIT');
    res.json(cal);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message); res.status(500).send('Erro ao inserir Calibração');
  } finally {
    client.release();
  }
});

app.put('/api/calibracoes/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { data_hora_inicio, data_hora_fim, tipo_calibracao, versao_parametros, resultado, observacoes, id_pesquisador, id_qpu, id_registro_ambiente, id_sequencia } = req.body;
    await client.query('BEGIN');
    const query = `
      UPDATE Calibracao 
      SET data_hora_inicio=$1, data_hora_fim=$2, tipo_calibracao=$3, versao_parametros=$4, resultado=$5, observacoes=$6, id_pesquisador=$7, id_qpu=$8, id_registro_ambiente=$9
      WHERE id_calibracao=$10 RETURNING *;
    `;
    const result = await client.query(query, [data_hora_inicio, data_hora_fim, tipo_calibracao, versao_parametros, resultado, observacoes, id_pesquisador, id_qpu, id_registro_ambiente, id]);
    const cal = result.rows[0];
    await client.query('DELETE FROM SequenciaPulso_Calibracao WHERE id_calibracao = $1;', [id]);
    if (id_sequencia) {
      await client.query('INSERT INTO SequenciaPulso_Calibracao (id_calibracao, id_sequencia) VALUES ($1, $2);', [id, id_sequencia]);
    }
    await client.query('COMMIT');
    res.json(cal);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message); res.status(500).send('Erro ao atualizar Calibração');
  } finally {
    client.release();
  }
});

app.delete('/api/calibracoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM Calibracao WHERE id_calibracao = $1;', [id]);
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
      FROM Calibracao c
      LEFT JOIN Pesquisador p ON c.id_pesquisador = p.id_pesquisador
      LEFT JOIN Qpu q ON c.id_qpu = q.id_qpu
      LEFT JOIN RegistroAmbiente ra ON c.id_registro_ambiente = ra.id_registro_ambiente
      WHERE c.id_calibracao = $1;
    `;
    const calResult = await pool.query(calQuery, [id]);
    if (calResult.rows.length === 0) {
      return res.status(404).send('Calibração não encontrada');
    }
    const calibracao = calResult.rows[0];

    const seqQuery = `
      SELECT sp.*
      FROM SequenciaPulso sp
      JOIN SequenciaPulso_Calibracao uc ON sp.id_sequencia = uc.id_sequencia
      WHERE uc.id_calibracao = $1;
    `;
    const seqResult = await pool.query(seqQuery, [id]);

    const abrangeQuery = `
      SELECT a.*, q.indice_qubit, q.tipo_qubit
      FROM Calibracao_Qubit a
      JOIN Qubit q ON a.id_qubit = q.id_qubit
      WHERE a.id_calibracao = $1;
    `;
    const abrangeResult = await pool.query(abrangeQuery, [id]);
    
    res.json({
      calibracao,
      sequencias: seqResult.rows,
      qubitsCalibrados: abrangeResult.rows
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
        FROM Experimento_Qubit mq JOIN Qubit q ON mq.id_qubit = q.id_qubit JOIN Qpu p ON q.id_qpu = p.id_qpu
        WHERE mq.nome_metrica = 'T1' GROUP BY p.id_qpu, p.nome, DATE(mq.data_hora_medicao)
      ),
      ranqueamento_piores AS (
        SELECT q.id_qpu, DATE(mq.data_hora_medicao) as data, mq.id_qubit as pior_qubit_id, mq.valor as pior_valor_t1,
        ROW_NUMBER() OVER(PARTITION BY q.id_qpu, DATE(mq.data_hora_medicao) ORDER BY mq.valor ASC) as rn
        FROM Experimento_Qubit mq JOIN Qubit q ON mq.id_qubit = q.id_qubit WHERE mq.nome_metrica = 'T1'
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
      FROM Experimento_Porta mp JOIN PortaQuantica pq ON mp.id_porta = pq.id_porta JOIN Experimento e ON mp.id_experimento = e.id_experimento
      WHERE mp.nome_metrica = 'Fidelidade' GROUP BY pq.nome_porta, pq.numero_qubits_alvo ORDER BY categoria DESC, fidelidade_media DESC;
    `;
    const result = await pool.query(query); res.json(result.rows);
  } catch (err) { console.error(err.message); res.status(500).send('Erro no Relatório 2'); }
});

app.get('/api/relatorios/temperatura', async (req, res) => {
  try {
    const query = `
      SELECT ra.temperatura, AVG(mq.valor) as taxa_erro_media
      FROM RegistroAmbiente ra JOIN Experimento e ON ra.id_registro_ambiente = e.id_registro_ambiente JOIN Experimento_Qubit mq ON e.id_experimento = mq.id_experimento
      WHERE mq.nome_metrica = 'TaxaErro' GROUP BY ra.temperatura ORDER BY ra.temperatura;
    `;
    const result = await pool.query(query); res.json(result.rows);
  } catch (err) { console.error(err.message); res.status(500).send('Erro no Relatório 3'); }
});

// Novo Relatório 4: Efetividade de Calibração
app.get('/api/relatorios/efetividade', async (req, res) => {
  try {
    const query = `
      SELECT * FROM (
        SELECT 
          cq.parametro_ajustado,
          c.id_calibracao,
          c.tipo_calibracao,
          DATE(c.data_hora_inicio) as data,
          (cq.valor_depois - cq.valor_antes) as variacao_media,
          (((cq.valor_depois - cq.valor_antes) / NULLIF(cq.valor_antes, 0)) * 100) as melhora_percentual_media,
          DENSE_RANK() OVER(PARTITION BY cq.parametro_ajustado ORDER BY ABS(cq.valor_depois - cq.valor_antes) DESC) as rank_impacto
        FROM Calibracao_Qubit cq
        JOIN Calibracao c ON cq.id_calibracao = c.id_calibracao
      ) ranked
      WHERE rank_impacto <= 3
      ORDER BY parametro_ajustado, rank_impacto;
    `;
    const result = await pool.query(query); res.json(result.rows);
  } catch (err) { console.error(err.message); res.status(500).send('Erro no Relatório Efetividade'); }
});

// Novo Relatório 5: Degradação com Janela Temporal (LAG)
app.get('/api/relatorios/degradacao', async (req, res) => {
  try {
    const dias = parseInt(req.query.dias) || 2;
    let query = '';
    if (dias === 3) {
      query = `
        WITH t1_diario AS (
          SELECT 
            mq.id_qubit,
            q.indice_qubit,
            p.nome as qpu_nome,
            DATE(mq.data_hora_medicao) as data,
            mq.valor as valor_t1,
            LAG(mq.valor, 1) OVER(PARTITION BY mq.id_qubit ORDER BY DATE(mq.data_hora_medicao)) as t1_anterior_1,
            LAG(mq.valor, 2) OVER(PARTITION BY mq.id_qubit ORDER BY DATE(mq.data_hora_medicao)) as t1_anterior_2,
            LAG(mq.valor, 3) OVER(PARTITION BY mq.id_qubit ORDER BY DATE(mq.data_hora_medicao)) as t1_anterior_3
          FROM Experimento_Qubit mq
          JOIN Qubit q ON mq.id_qubit = q.id_qubit
          JOIN Qpu p ON q.id_qpu = p.id_qpu
          WHERE mq.nome_metrica = 'T1'
        )
        SELECT 
          id_qubit,
          indice_qubit,
          qpu_nome,
          data,
          valor_t1,
          t1_anterior_1,
          t1_anterior_2,
          t1_anterior_3,
          (t1_anterior_3 - valor_t1) as queda_total
        FROM t1_diario
        WHERE valor_t1 < t1_anterior_1 AND t1_anterior_1 < t1_anterior_2 AND t1_anterior_2 < t1_anterior_3
        ORDER BY queda_total DESC, data DESC;
      `;
    } else {
      query = `
        WITH t1_diario AS (
          SELECT 
            mq.id_qubit,
            q.indice_qubit,
            p.nome as qpu_nome,
            DATE(mq.data_hora_medicao) as data,
            mq.valor as valor_t1,
            LAG(mq.valor, 1) OVER(PARTITION BY mq.id_qubit ORDER BY DATE(mq.data_hora_medicao)) as t1_anterior_1,
            LAG(mq.valor, 2) OVER(PARTITION BY mq.id_qubit ORDER BY DATE(mq.data_hora_medicao)) as t1_anterior_2
          FROM Experimento_Qubit mq
          JOIN Qubit q ON mq.id_qubit = q.id_qubit
          JOIN Qpu p ON q.id_qpu = p.id_qpu
          WHERE mq.nome_metrica = 'T1'
        )
        SELECT 
          id_qubit,
          indice_qubit,
          qpu_nome,
          data,
          valor_t1,
          t1_anterior_1,
          t1_anterior_2,
          (t1_anterior_2 - valor_t1) as queda_total
        FROM t1_diario
        WHERE valor_t1 < t1_anterior_1 AND t1_anterior_1 < t1_anterior_2
        ORDER BY queda_total DESC, data DESC;
      `;
    }
    const result = await pool.query(query); res.json(result.rows);
  } catch (err) { console.error(err.message); res.status(500).send('Erro no Relatório Degradação'); }
});

// Novo Relatório 6: Custo-benefício de Calibração
app.get('/api/relatorios/custo-beneficio', async (req, res) => {
  try {
    const query = `
      WITH taxas_erro AS (
        SELECT 
          q.id_qpu,
          DATE(mq.data_hora_medicao) as data_medicao,
          mq.valor as taxa_erro
        FROM Experimento_Qubit mq
        JOIN Qubit q ON mq.id_qubit = q.id_qubit
        WHERE mq.nome_metrica = 'TaxaErro'
      ),
      comparativo_calib AS (
        SELECT 
          c.id_calibracao,
          c.id_qpu,
          c.data_hora_inicio as data_calib,
          (
            SELECT AVG(te.taxa_erro) 
            FROM taxas_erro te 
            WHERE te.id_qpu = c.id_qpu 
              AND te.data_medicao >= DATE(c.data_hora_inicio) - INTERVAL '7 days'
              AND te.data_medicao < DATE(c.data_hora_inicio)
          ) as erro_medio_antes,
          (
            SELECT AVG(te.taxa_erro) 
            FROM taxas_erro te 
            WHERE te.id_qpu = c.id_qpu 
              AND te.data_medicao > DATE(c.data_hora_inicio)
              AND te.data_medicao <= DATE(c.data_hora_inicio) + INTERVAL '7 days'
          ) as erro_medio_depois
        FROM Calibracao c
      )
      SELECT 
        cc.id_calibracao,
        p.nome as qpu_nome,
        DATE(cc.data_calib) as data_calibracao,
        cc.erro_medio_antes,
        cc.erro_medio_depois,
        (cc.erro_medio_antes - cc.erro_medio_depois) as reducao_erro,
        ((cc.erro_medio_antes - cc.erro_medio_depois) / NULLIF(cc.erro_medio_antes, 0)) * 100 as melhora_percentual
      FROM comparativo_calib cc
      JOIN Qpu p ON cc.id_qpu = p.id_qpu
      WHERE cc.erro_medio_antes IS NOT NULL AND cc.erro_medio_depois IS NOT NULL
      ORDER BY melhora_percentual DESC;
    `;
    const result = await pool.query(query); res.json(result.rows);
  } catch (err) { console.error(err.message); res.status(500).send('Erro no Relatório Custo-Benefício'); }
});

// Novo Relatório 7: Ranking de Qubits Problemáticos
app.get('/api/relatorios/problematicos', async (req, res) => {
  try {
    const query = `
      WITH freq_calib AS (
        SELECT id_qubit, COUNT(*) as qtd_calibracoes
        FROM Calibracao_Qubit
        GROUP BY id_qubit
      ),
      erro_medio AS (
        SELECT mq.id_qubit, AVG(mq.valor) as taxa_erro_media
        FROM Experimento_Qubit mq
        WHERE mq.nome_metrica = 'TaxaErro'
        GROUP BY mq.id_qubit
      )
      SELECT 
        q.id_qubit,
        q.indice_qubit,
        p.nome as qpu_nome,
        COALESCE(fc.qtd_calibracoes, 0) as total_calibracoes,
        em.taxa_erro_media,
        DENSE_RANK() OVER (ORDER BY em.taxa_erro_media DESC, COALESCE(fc.qtd_calibracoes, 0) DESC) as rank_criticidade
      FROM Qubit q
      JOIN Qpu p ON q.id_qpu = p.id_qpu
      LEFT JOIN freq_calib fc ON q.id_qubit = fc.id_qubit
      LEFT JOIN erro_medio em ON q.id_qubit = em.id_qubit
      ORDER BY rank_criticidade ASC;
    `;
    const result = await pool.query(query); res.json(result.rows);
  } catch (err) { console.error(err.message); res.status(500).send('Erro no Relatório Qubits Problemáticos'); }
});

// ================= DASHBOARD DINÂMICO REAL-TIME =================
app.get('/api/dashboard/qubits/:id_qpu', async (req, res) => {
  try {
    const { id_qpu } = req.params;
    const mapaResult = await pool.query(`SELECT id_qubit, indice_qubit, status_qubit, status_qubit as status_operacional FROM Qubit WHERE id_qpu = $1::integer ORDER BY indice_qubit;`, [id_qpu]);
    const cardsResult = await pool.query(`SELECT mq.nome_metrica, AVG(mq.valor) as media FROM Experimento_Qubit mq JOIN Qubit q ON mq.id_qubit = q.id_qubit WHERE q.id_qpu = $1::integer AND mq.nome_metrica IN ('T1', 'TaxaErro') GROUP BY mq.nome_metrica;`, [id_qpu]);
    const fidResult = await pool.query(`SELECT pq.numero_qubits_alvo, AVG(mp.valor) as media FROM Experimento_Porta mp JOIN PortaQuantica pq ON mp.id_porta = pq.id_porta JOIN Experimento e ON mp.id_experimento = e.id_experimento WHERE e.id_qpu = $1::integer AND mp.nome_metrica = 'Fidelidade' GROUP BY pq.numero_qubits_alvo;`, [id_qpu]);
    
    // Histórico de Fidelidades (1Q e 2Q) por dia
    const histFidResult = await pool.query(`
      SELECT 
        TO_CHAR(mp.data_hora_medicao, 'DD/MM') as data,
        pq.numero_qubits_alvo,
        AVG(mp.valor) as media
      FROM Experimento_Porta mp
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
      FROM Experimento_Qubit mq
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
      LEFT JOIN Pesquisador p ON e.id_pesquisador = p.id_pesquisador
      LEFT JOIN RegistroAmbiente ra ON e.id_registro_ambiente = ra.id_registro_ambiente
      WHERE e.id_qpu = $1::integer
      ORDER BY e.data_hora_inicio DESC, e.id_experimento DESC
      LIMIT 5;
    `, [id_qpu]);

    // Obter o T1 mais recente de cada qubit desta QPU para o Histograma
    const t1QubitsResult = await pool.query(`
      WITH ultimo_T1 AS (
        SELECT 
          mq.id_qubit, 
          mq.valor as t1_valor,
          ROW_NUMBER() OVER (PARTITION BY mq.id_qubit ORDER BY mq.data_hora_medicao DESC) as rn
        FROM Experimento_Qubit mq
        JOIN Qubit q ON mq.id_qubit = q.id_qubit
        WHERE q.id_qpu = $1::integer AND mq.nome_metrica = 'T1'
      )
      SELECT q.indice_qubit, ut.t1_valor
      FROM Qubit q
      JOIN ultimo_T1 ut ON q.id_qubit = ut.id_qubit
      WHERE ut.rn = 1
      ORDER BY q.indice_qubit;
    `, [id_qpu]);

    res.json({ 
      mapa: mapaResult.rows, 
      metricas: cardsResult.rows, 
      fidelidades: fidResult.rows,
      historicoFidelidade: histFidResult.rows,
      historicoErro: histErroResult.rows,
      experimentos: expResult.rows,
      distribuicaoT1: t1QubitsResult.rows
    });
  } catch (err) { console.error(err.message); res.status(500).send('Erro no Dashboard'); }
});

app.get('/api/dashboard/ambiente/:id_qpu', async (req, res) => {
  try {
    const { id_qpu } = req.params;
    const result = await pool.query(`SELECT ra.temperatura, ra.pressao, ra.vibracao FROM RegistroAmbiente ra JOIN Experimento e ON ra.id_registro_ambiente = e.id_registro_ambiente JOIN Experimento_Qubit mq ON e.id_experimento = mq.id_experimento JOIN Qubit q ON mq.id_qubit = q.id_qubit WHERE q.id_qpu = $1::integer ORDER BY ra.data_hora_registro DESC LIMIT 1;`, [id_qpu]);
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
      sql: "SELECT nome, fabricante, modelo, status_operacional FROM Qpu WHERE status_operacional = 'Ativo';",
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
      sql: "SELECT q.id_qubit, q.indice_qubit, q.id_qpu, mq.valor FROM Qubit q JOIN Experimento_Qubit mq ON q.id_qubit = mq.id_qubit WHERE mq.nome_metrica = 'T1' ORDER BY mq.valor ASC LIMIT 5;",
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
      sql: "SELECT id_qubit, indice_qubit, status_qubit, id_qpu FROM Qubit WHERE status_qubit IN ('Atenção', 'Inativo');",
      template: (rows) => {
        if (!rows || rows.length === 0) return "Excelente notícia! Todos os qubits cadastrados estão ativos no banco de dados (Modo Demonstrativo/Contingência).";
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
      sql: "SELECT nome, fabricante, modelo, temperatura_nominal FROM Criostato WHERE temperatura_nominal < 0.1;",
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
      sql: "SELECT resultado, COUNT(*) as total FROM Calibracao GROUP BY resultado;",
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

1. Qpu (id_qpu, nome, fabricante, modelo, tecnologia, data_instalacao, status_operacional, id_criostato)
   - Valores típicos para status_operacional: 'Ativo', 'Manutenção', 'Inativo'
2. Criostato (id_criostato, nome, fabricante, modelo, temperatura_nominal, status_operacional)
   - Valores típicos para status_operacional: 'Ativo', 'Manutenção', 'Inativo'
3. Qubit (id_qubit, indice_qubit, tipo_qubit, frequencia_ressonancia, status_qubit, observacoes, id_qpu)
   - Valores típicos para status_qubit: 'Ativo', 'Atenção', 'Inativo'
4. Pesquisador (id_pesquisador, nome, email, instituicao, area_atuacao)
5. Experimento (id_experimento, nome, objetivo, data_hora_inicio, data_hora_fim, status_execucao, observacoes, id_pesquisador, id_qpu, id_registro_ambiente)
6. Calibracao (id_calibracao, data_hora_inicio, data_hora_fim, tipo_calibracao, versao_parametros, resultado, observacoes, id_pesquisador, id_qpu, id_registro_ambiente)
   - Valores típicos para resultado: 'Sucesso', 'Falha'
7. RegistroAmbiente (id_registro_ambiente, data_hora_registro, temperatura, pressao, umidade, vibracao, campo_magnetico, observacoes)
8. Experimento_Qubit (id_experimento, id_qubit, nome_metrica, valor, unidade, data_hora_medicao, metodo_obtencao, observacoes)
   - Valores típicos para nome_metrica: 'T1', 'T2', 'Fidelidade', 'TaxaErro'
9. Experimento_Porta (id_experimento, id_porta, nome_metrica, valor, unidade, data_hora_medicao, metodo_obtencao, observacoes)
   - Valores típicos para nome_metrica: 'Fidelidade'
10. PortaQuantica (id_porta, nome_porta, categoria, numero_qubits_alvo, descricao)
11. SequenciaPulso (id_sequencia, nome, finalidade, versao, descricao)
12. Pulso (id_pulso, ordem, tipo_pulso, amplitude, duracao, frequencia, fase, forma_onda, id_sequencia)
13. Calibracao_Qubit (id_calibracao, id_qubit, parametro_ajustado, valor_antes, valor_depois)
14. Porta_Qubit (id_porta, id_qubit)
15. SequenciaPulso_Porta (id_sequencia, id_porta)
16. SequenciaPulso_Calibracao (id_calibracao, id_sequencia)
17. SequenciaPulso_Experimento (id_experimento, id_sequencia)

Regras Importantes de Execução (Conversa e Interpretação):
1. **Seja Conversacional e Amigável:** Não se limite a responder apenas com dados puros. Responda saudações (como "Oi", "Olá", "Tudo bem?"), agradecimentos, apresente-se como o Copilot e mantenha uma atitude acolhedora e prestativa de colega de trabalho.
2. **Capacidade de Conversa Conceitual:** Se o usuário fizer perguntas conceituais (ex: "O que é o tempo T1?", "Como funciona um criostato?", "O que faz a métrica Fidelidade?"), responda de forma rica e didática diretamente, em português, sem gerar blocos "[SQL]".
3. **Interpretação Flexível (NLP-to-SQL):** Não seja rígido. Se o usuário fizer perguntas vagas ou informais (ex: "quem está trabalhando mais?", "como está a temperatura lá?", "tem alguma máquina com problemas?"), interprete quais tabelas contêm a resposta adequada:
   - "quem trabalha mais?" -> conte experimentos ou calibrações agrupados por pesquisador.
   - "máquina com problemas" -> busque QPUs com status 'Manutenção' ou 'Inativo', ou qubits com status 'Atenção' ou 'Inativo'.
   - Escreva a query SELECT necessária para obter os dados relevantes.
4. **Respostas em duas etapas:** Se o usuário pedir informações do banco, responda APENAS com a instrução SQL SELECT necessária no formato "[SQL] <sua consulta SELECT>". Quando receber os dados JSON do banco (começando com "[RESULTADO]"), elabore uma resposta final bem estruturada em português usando Markdown. Não exiba a query SQL no texto da resposta final.
5. **Segurança:** Nunca execute comandos que alterem dados (INSERT, UPDATE, DELETE). Apenas execute queries SELECT.
6. **Limite de Resultados:** Sempre limite as consultas SQL a no máximo 20 registros (ex: `LIMIT 20`), a menos que o usuário solicite explicitamente mais dados.
7. **Segurança Matemática e Busca:** Sempre use `NULLIF(divisor, 0)` ao calcular divisões/variações percentuais para evitar erros de divisão por zero no PostgreSQL. Para buscas textuais parciais, prefira usar `ILIKE` em vez de `LIKE` para garantir que a pesquisa seja case-insensitive.

Exemplos de Tradução (NLP-to-SQL):
- Pergunta: "Olá, pode me dizer quais QPUs estão ativas?"
  Resposta: [SQL] SELECT nome, fabricante, modelo, status_operacional FROM Qpu WHERE status_operacional = 'Ativo' LIMIT 20;
- Pergunta: "Quais qubits tem o menor T1?"
  Resposta: [SQL] SELECT q.id_qubit, q.indice_qubit, q.id_qpu, mq.valor as t1_valor FROM Qubit q JOIN Experimento_Qubit mq ON q.id_qubit = mq.id_qubit WHERE mq.nome_metrica = 'T1' ORDER BY mq.valor ASC LIMIT 5;
- Pergunta: "Quem fez mais experimentos aqui no laboratório?"
  Resposta: [SQL] SELECT p.nome, COUNT(e.id_experimento) as total_experimentos FROM Pesquisador p JOIN Experimento e ON p.id_pesquisador = e.id_pesquisador GROUP BY p.nome ORDER BY total_experimentos DESC LIMIT 3;`;

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
        'gemini-2.5-flash',
        'gemini-2.5-pro'
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
      CREATE TABLE IF NOT EXISTS RegistroAmbiente (
        id_registro_ambiente SERIAL PRIMARY KEY,
        data_hora_registro TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        temperatura NUMERIC(10,4),
        pressao NUMERIC(10,4),
        umidade NUMERIC(10,4),
        vibracao NUMERIC(10,4),
        campo_magnetico NUMERIC(10,4),
        observacoes TEXT
      );
    `);

    // 2. Criostato
    await client.query(`
      CREATE TABLE IF NOT EXISTS Criostato (
        id_criostato SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        fabricante VARCHAR(255),
        modelo VARCHAR(255),
        temperatura_nominal NUMERIC(10,4),
        status_operacional VARCHAR(255) DEFAULT 'Ativo'
      );
    `);

    // 3. Pesquisador
    await client.query(`
      CREATE TABLE IF NOT EXISTS Pesquisador (
        id_pesquisador SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        instituicao VARCHAR(255),
        area_atuacao VARCHAR(255)
      );
    `);

    // 4. Qpu
    await client.query(`
      CREATE TABLE IF NOT EXISTS Qpu (
        id_qpu SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        fabricante VARCHAR(255),
        modelo VARCHAR(255),
        tecnologia VARCHAR(255),
        data_instalacao DATE,
        status_operacional VARCHAR(255) DEFAULT 'Ativo',
        id_criostato INT NOT NULL REFERENCES Criostato(id_criostato) ON DELETE RESTRICT
      );
    `);

    // 5. Qubit
    await client.query(`
      CREATE TABLE IF NOT EXISTS Qubit (
        id_qubit SERIAL PRIMARY KEY,
        indice_qubit INT,
        tipo_qubit VARCHAR(255),
        frequencia_ressonancia NUMERIC(10,4),
        status_qubit VARCHAR(255) DEFAULT 'Ativo',
        observacoes TEXT,
        id_qpu INT NOT NULL REFERENCES Qpu(id_qpu) ON DELETE CASCADE
      );
    `);

    // 6. Experimento
    await client.query(`
      CREATE TABLE IF NOT EXISTS Experimento (
        id_experimento SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        objetivo TEXT,
        data_hora_inicio TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        data_hora_fim TIMESTAMP WITHOUT TIME ZONE,
        status_execucao VARCHAR(255) DEFAULT 'Planejado',
        observacoes TEXT,
        id_pesquisador INT NOT NULL REFERENCES Pesquisador(id_pesquisador) ON DELETE RESTRICT,
        id_qpu INT NOT NULL REFERENCES Qpu(id_qpu) ON DELETE CASCADE,
        id_registro_ambiente INT REFERENCES RegistroAmbiente(id_registro_ambiente) ON DELETE SET NULL
      );
    `);

    // 7. Calibracao
    await client.query(`
      CREATE TABLE IF NOT EXISTS Calibracao (
        id_calibracao SERIAL PRIMARY KEY,
        data_hora_inicio TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        data_hora_fim TIMESTAMP WITHOUT TIME ZONE,
        tipo_calibracao VARCHAR(255),
        versao_parametros VARCHAR(255),
        resultado VARCHAR(255),
        observacoes TEXT,
        id_pesquisador INT NOT NULL REFERENCES Pesquisador(id_pesquisador) ON DELETE RESTRICT,
        id_qpu INT NOT NULL REFERENCES Qpu(id_qpu) ON DELETE CASCADE,
        id_registro_ambiente INT REFERENCES RegistroAmbiente(id_registro_ambiente) ON DELETE SET NULL
      );
    `);

    // 8. Experimento_Qubit
    await client.query(`
      CREATE TABLE IF NOT EXISTS Experimento_Qubit (
        id_experimento INT REFERENCES Experimento(id_experimento) ON DELETE CASCADE,
        id_qubit INT REFERENCES Qubit(id_qubit) ON DELETE CASCADE,
        nome_metrica VARCHAR(255) NOT NULL,
        valor NUMERIC(12,6),
        unidade VARCHAR(255),
        data_hora_medicao TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        metodo_obtencao VARCHAR(255),
        observacoes TEXT,
        PRIMARY KEY (id_experimento, id_qubit, nome_metrica)
      );
    `);

    // 9. PortaQuantica
    await client.query(`
      CREATE TABLE IF NOT EXISTS PortaQuantica (
        id_porta SERIAL PRIMARY KEY,
        nome_porta VARCHAR(255) NOT NULL,
        categoria VARCHAR(255),
        numero_qubits_alvo SMALLINT DEFAULT 1,
        descricao TEXT
      );
    `);

    // 10. Experimento_Porta
    await client.query(`
      CREATE TABLE IF NOT EXISTS Experimento_Porta (
        id_experimento INT REFERENCES Experimento(id_experimento) ON DELETE CASCADE,
        id_porta INT REFERENCES PortaQuantica(id_porta) ON DELETE CASCADE,
        nome_metrica VARCHAR(255) NOT NULL,
        valor NUMERIC(12,6),
        unidade VARCHAR(255),
        data_hora_medicao TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        metodo_obtencao VARCHAR(255),
        observacoes TEXT,
        PRIMARY KEY (id_experimento, id_porta, nome_metrica)
      );
    `);

    // 11. SequenciaPulso
    await client.query(`
      CREATE TABLE IF NOT EXISTS SequenciaPulso (
        id_sequencia SERIAL PRIMARY KEY,
        nome VARCHAR(255),
        finalidade VARCHAR(255),
        versao VARCHAR(255),
        descricao TEXT
      );
    `);

    // 12. Pulso
    await client.query(`
      CREATE TABLE IF NOT EXISTS Pulso (
        id_pulso SERIAL PRIMARY KEY,
        ordem INT,
        tipo_pulso VARCHAR(255),
        amplitude NUMERIC(10,4),
        duracao NUMERIC(10,4),
        frequencia NUMERIC(10,4),
        fase NUMERIC(10,4),
        forma_onda VARCHAR(255),
        id_sequencia INT NOT NULL REFERENCES SequenciaPulso(id_sequencia) ON DELETE CASCADE
      );
    `);

    // 13. SequenciaPulso_Porta (Relação N:M)
    await client.query(`
      CREATE TABLE IF NOT EXISTS SequenciaPulso_Porta (
        id_sequencia INT REFERENCES SequenciaPulso(id_sequencia) ON DELETE CASCADE,
        id_porta INT REFERENCES PortaQuantica(id_porta) ON DELETE CASCADE,
        PRIMARY KEY (id_sequencia, id_porta)
      );
    `);

    // 14. Porta_Qubit (Relação N:M)
    await client.query(`
      CREATE TABLE IF NOT EXISTS Porta_Qubit (
        id_porta INT REFERENCES PortaQuantica(id_porta) ON DELETE CASCADE,
        id_qubit INT REFERENCES Qubit(id_qubit) ON DELETE CASCADE,
        PRIMARY KEY (id_porta, id_qubit)
      );
    `);

    // 15. SequenciaPulso_Calibracao (Relação N:M)
    await client.query(`
      CREATE TABLE IF NOT EXISTS SequenciaPulso_Calibracao (
        id_calibracao INT REFERENCES Calibracao(id_calibracao) ON DELETE CASCADE,
        id_sequencia INT REFERENCES SequenciaPulso(id_sequencia) ON DELETE CASCADE,
        PRIMARY KEY (id_calibracao, id_sequencia)
      );
    `);

    // 16. SequenciaPulso_Experimento (Relação N:M)
    await client.query(`
      CREATE TABLE IF NOT EXISTS SequenciaPulso_Experimento (
        id_experimento INT REFERENCES Experimento(id_experimento) ON DELETE CASCADE,
        id_sequencia INT REFERENCES SequenciaPulso(id_sequencia) ON DELETE CASCADE,
        PRIMARY KEY (id_experimento, id_sequencia)
      );
    `);

    // 17. Calibracao_Qubit (Relação N:M)
    await client.query(`
      CREATE TABLE IF NOT EXISTS Calibracao_Qubit (
        id_calibracao INT REFERENCES Calibracao(id_calibracao) ON DELETE CASCADE,
        id_qubit INT REFERENCES Qubit(id_qubit) ON DELETE CASCADE,
        parametro_ajustado VARCHAR(255),
        valor_antes NUMERIC(12,6),
        valor_depois NUMERIC(12,6),
        PRIMARY KEY (id_calibracao, id_qubit)
      );
    `);

    // Carga de dados (inserindo apenas se as tabelas estiverem vazias para evitar duplicados)
    const countQpus = await client.query('SELECT COUNT(*) FROM Qpu;');
    if (parseInt(countQpus.rows[0].count) === 0) {
      // Criostatos
      await client.query("INSERT INTO Criostato (nome, fabricante, modelo, temperatura_nominal, status_operacional) VALUES ('Criostato Principal', 'Bluefors', 'LD250', 0.0100, 'Ativo'), ('Criostato de Testes', 'Oxford Instruments', 'Triton', 0.0150, 'Ativo');");
      
      // QPUs (cada uma com 20 qubits)
      await client.query("INSERT INTO Qpu (nome, fabricante, modelo, tecnologia, data_instalacao, status_operacional, id_criostato) VALUES ('QPU Triton-20', 'IBM', 'Quantum Eagle v3', 'Supercondutor', '2025-01-15', 'Ativo', 1), ('QPU Borealis-20', 'Xanadu', 'Photonic 20Q', 'Fotônica', '2025-05-10', 'Ativo', 2);");

      // Qubits para Triton-20
      for (let i = 0; i < 20; i++) {
        let status = 'Ativo';
        if (i === 13) status = 'Inativo';
        else if ([5, 17].includes(i)) status = 'Atenção';
        await client.query(`INSERT INTO Qubit (indice_qubit, tipo_qubit, frequencia_ressonancia, status_qubit, observacoes, id_qpu) VALUES ($1, 'Transmon', $2, $3, 'Qubit padrão da grade supercondutora', 1);`, [i, 5.0 + i * 0.05, status]);
      }
      // Qubits para Borealis-20
      for (let i = 0; i < 20; i++) {
        await client.query(`INSERT INTO Qubit (indice_qubit, tipo_qubit, frequencia_ressonancia, status_qubit, observacoes, id_qpu) VALUES ($1, 'Fóton polarizado', $2, 'Ativo', 'Qubit óptico', 2);`, [i, 193.1 + i * 0.1]);
      }

      // Pesquisadores
      await client.query("INSERT INTO Pesquisador (nome, email, instituicao, area_atuacao) VALUES ('Dr. Alice Smith', 'alice@ufsc.br', 'UFSC', 'Controle Quântico'), ('Bob Jones', 'bob@ufsc.br', 'UFSC', 'Mitigação de Erros');");

      // Deterministic LCG random number generator (Seed: 4242)
      let lcgState = 4242;
      function rand() {
        lcgState = (lcgState * 1664525 + 1013904223) % 4294967296;
        return lcgState / 4294967296;
      }

      // Gerar registros ambientais para os últimos 105 dias
      const ambValues = [];
      for (let day = 105; day >= 0; day--) {
        // Temperatura base muito estável em torno de 10 mK (0.0100 Kelvin)
        let temp = 0.0100 + (rand() - 0.5) * 0.0002;
        
        // Picos de calor (desafios ambientais isolados)
        if (day === 70 || day === 71) {
          temp = 0.038 + rand() * 0.005; // Spike térmico de ~40mK (catastrófico)
        } else if (day === 30) {
          temp = 0.022 + rand() * 0.003; // Flutuação média
        }
        
        const pressao = (0.8 + rand() * 0.1).toFixed(4);
        const umidade = (30.0 + Math.sin(day) * 2.0).toFixed(4);
        // Vibração correlacionada com a temperatura (sistemas mecânicos de bombeamento em estresse)
        const vibracao = (temp > 0.030) 
          ? (0.12 + rand() * 0.04).toFixed(4) 
          : (0.02 + rand() * 0.01).toFixed(4);
        const campo_magnetico = (0.10 + rand() * 0.02).toFixed(4);
        
        let obs = 'Estável';
        if (temp > 0.030) obs = 'Pico de temperatura - Anomalia Térmica';
        else if (temp > 0.020) obs = 'Pequena flutuação de temperatura';
        
        ambValues.push(`(NOW() - (${day} * INTERVAL '1 day'), ${temp.toFixed(6)}, ${pressao}, ${umidade}, ${vibracao}, ${campo_magnetico}, '${obs}')`);
      }
      
      const ambResult = await client.query(`
        INSERT INTO RegistroAmbiente (data_hora_registro, temperatura, pressao, umidade, vibracao, campo_magnetico, observacoes)
        VALUES ${ambValues.join(',\n')}
        RETURNING id_registro_ambiente, temperatura;
      `);
      
      const ambRows = ambResult.rows;

      const expValues = [];
      // Experimento 1 (Fidelidade original): 103 dias atrás na QPU 1
      const ambId103 = ambRows[2].id_registro_ambiente; // 105 - 103 = 2
      expValues.push(`('Fidelidade CNOT', 'Medir fidelidade de porta de dois qubits', NOW() - INTERVAL '103 days', NOW() - INTERVAL '103 days' + INTERVAL '1 hour', 'Concluído', 'Fidelidade aceitável', 1, 1, ${ambId103})`);
      
      // Criar experimentos diários para QPU 1 e QPU 2 nos últimos 100 dias (202 experimentos)
      const dailyExpMap = [];
      for (let day = 100; day >= 0; day--) {
        const ambIdx = 105 - day;
        const ambRow = ambRows[ambIdx];
        const ambId = ambRow.id_registro_ambiente;
        
        // Experimento na QPU 1 (Triton-20)
        expValues.push(`('Caracterização Triton-20', 'Rotina diária de calibração e telemetria', NOW() - (${day} * INTERVAL '1 day'), NOW() - (${day} * INTERVAL '1 day') + INTERVAL '30 minutes', 'Concluído', 'Rotina automatizada', 2, 1, ${ambId})`);
        dailyExpMap.push({ day, qpuId: 1, temp: parseFloat(ambRow.temperatura) });
        
        // Experimento na QPU 2 (Borealis-20)
        expValues.push(`('Caracterização Borealis-20', 'Rotina diária de calibração e telemetria', NOW() - (${day} * INTERVAL '1 day') + INTERVAL '10 minutes', NOW() - (${day} * INTERVAL '1 day') + INTERVAL '40 minutes', 'Concluído', 'Rotina automatizada', 2, 2, ${ambId})`);
        dailyExpMap.push({ day, qpuId: 2, temp: parseFloat(ambRow.temperatura) });
      }
      
      // Experimento extra 203 (Caracterização Óptica) na QPU 2: 1 dia atrás
      const ambId1 = ambRows[104].id_registro_ambiente; // 105 - 1 = 104
      expValues.push(`('Caracterização Óptica', 'Medir fontes de fótons únicos', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '2 hours', 'Concluído', 'Taxa de coincidência excelente', 1, 2, ${ambId1})`);
      
      // Experimento extra 204 (Simulação VQE) na QPU 1: planejado para hoje
      const ambId0 = ambRows[105].id_registro_ambiente; // 105 - 0 = 105
      expValues.push(`('Simulação VQE', 'Rodar algoritmo VQE para molécula de H2', NOW(), NULL, 'Planejado', 'Executando em background', 2, 1, ${ambId0})`);
      
      const insertExpQuery = `
        INSERT INTO Experimento (nome, objetivo, data_hora_inicio, data_hora_fim, status_execucao, observacoes, id_pesquisador, id_qpu, id_registro_ambiente)
        VALUES ${expValues.join(',\n')}
        RETURNING id_experimento, id_qpu;
      `;
      const expResult = await client.query(insertExpQuery);
      const expRows = expResult.rows;

      // Calibrações periódicas a cada 15 dias para criar o padrão dente de serra no T1
      const calValues = [];
      const calDays = [100, 85, 70, 55, 40, 25, 10];
      
      for (const calDay of calDays) {
        const ambIdx = 105 - calDay;
        const ambRow = ambRows[ambIdx];
        const ambId = ambRow.id_registro_ambiente;
        
        // Calibração QPU 1
        calValues.push(`(NOW() - (${calDay} * INTERVAL '1 day'), NOW() - (${calDay} * INTERVAL '1 day') + INTERVAL '1 hour', 'Frequência e Pi-Pulso', 'v2.0.${100 - calDay}', 'Sucesso', 'Recalibração periódica automática dos qubits', 1, 1, ${ambId})`);
        
        // Calibração QPU 2
        calValues.push(`(NOW() - (${calDay} * INTERVAL '1 day'), NOW() - (${calDay} * INTERVAL '1 day') + INTERVAL '1 hour', 'Frequência e Pi-Pulso', 'v2.0.${100 - calDay}', 'Sucesso', 'Recalibração periódica automática dos qubits', 2, 2, ${ambId})`);
      }
      
      // Calibração que falhou (dia 52)
      const ambIdxFailed = 105 - 52;
      const ambIdFailed = ambRows[ambIdxFailed].id_registro_ambiente;
      calValues.push(`(NOW() - (52 * INTERVAL '1 day'), NOW() - (52 * INTERVAL '1 day') + INTERVAL '45 minutes', 'Alinhamento Ótico', 'v2.0.48', 'Falha', 'Perda de lock térmico no criostato', 1, 1, ${ambIdFailed})`);

      const insertCalQuery = `
        INSERT INTO Calibracao (data_hora_inicio, data_hora_fim, tipo_calibracao, versao_parametros, resultado, observacoes, id_pesquisador, id_qpu, id_registro_ambiente) 
        VALUES ${calValues.join(',\n')}
        RETURNING id_calibracao, id_qpu;
      `;
      const calResult = await client.query(insertCalQuery);
      const calRows = calResult.rows;

      // Porta Quantica (9 portas)
      const gateInsertQuery = `
        INSERT INTO PortaQuantica (nome_porta, categoria, numero_qubits_alvo, descricao)
        VALUES 
        ('Hadamard', '1-Qubit', 1, 'Cria superposição de estados (eixo X + Z)'),
        ('Pauli-X', '1-Qubit', 1, 'Porta NOT quântica (inversão de qubit)'),
        ('Pauli-Y', '1-Qubit', 1, 'Rotação de pi radianos em torno do eixo Y'),
        ('Pauli-Z', '1-Qubit', 1, 'Inversão de fase (rotação de pi radianos em torno do eixo Z)'),
        ('S (Fase)', '1-Qubit', 1, 'Rotação de pi/2 radianos em torno do eixo Z (raiz quadrada de Z)'),
        ('T', '1-Qubit', 1, 'Rotação de pi/4 radianos em torno do eixo Z (raiz octogonal de Z)'),
        ('CNOT', '2-Qubits', 2, 'Porta lógica controlada-NOT (emaranhamento)'),
        ('CZ', '2-Qubits', 2, 'Porta controlada-Z (inversão de fase condicionada)'),
        ('SWAP', '2-Qubits', 2, 'Troca o estado quântico de dois qubits')
        RETURNING id_porta, nome_porta, numero_qubits_alvo;
      `;
      const gatesResult = await client.query(gateInsertQuery);
      const gatesRows = gatesResult.rows;

      // MedeQubit (T1 e TaxaErro) dinâmico para todos os qubits gerados, associando ao experimento de cada dia
      const allQubits = await client.query('SELECT id_qubit, indice_qubit, id_qpu FROM Qubit;');
      const qubitsByQpu = {
        1: allQubits.rows.filter(q => q.id_qpu === 1),
        2: allQubits.rows.filter(q => q.id_qpu === 2)
      };

      const qubitValues = [];
      for (let k = 0; k < dailyExpMap.length; k++) {
        const { day, qpuId, temp } = dailyExpMap[k];
        const expId = expRows[1 + k].id_experimento;
        const qubits = qubitsByQpu[qpuId];
        
        for (const q of qubits) {
          const qId = q.id_qubit;
          const idx = q.indice_qubit;
          
          let t1Val;
          let errVal;
          
          if (qpuId === 1) {
            // Triton-20 (Supercondutora): Restauração do T1 original com ruídos extremamente pequenos e tendência de queda
            const baseT1 = 85.0 + Math.sin(idx * 0.7) * 15.0;
            const ageFactor = 1.0 - (100 - day) * 0.003;
            const noiseT1 = (rand() - 0.5) * 0.4; // ruído diário muito pequeno
            t1Val = baseT1 * ageFactor + noiseT1;
            t1Val = Math.max(5.0, t1Val);

            const baseErr = 0.0015 + (idx % 4) * 0.0005;
            const tempErrFactor = Math.pow(temp / 0.010, 2.5);
            const ageErrorFactor = 1.0 + (100 - day) * 0.005;
            errVal = baseErr * tempErrFactor * ageErrorFactor + (rand() - 0.5) * 0.0001;
            errVal = Math.max(0.0001, Math.min(0.25, errVal));
          } else {
            // Borealis-20 (Fotônica): Restauração do T1 original com ruídos extremamente pequenos e tendência de queda
            const baseT1 = 140.0 + Math.cos(idx * 0.7) * 20.0;
            const ageFactor = 1.0 - (100 - day) * 0.001; // queda bem lenta
            const noiseT1 = (rand() - 0.5) * 0.2; // ruído diário muito pequeno
            t1Val = baseT1 * ageFactor + noiseT1;
            t1Val = Math.max(5.0, t1Val);

            const baseErr = 0.0010 + (idx % 3) * 0.0004;
            const tempErrFactor = Math.pow(temp / 0.010, 2.5);
            const ageErrorFactor = 1.0 + (100 - day) * 0.003;
            errVal = baseErr * tempErrFactor * ageErrorFactor + (rand() - 0.5) * 0.00005;
            errVal = Math.max(0.0001, Math.min(0.25, errVal));
          }
          
          qubitValues.push(`(${expId}, ${qId}, 'T1', ${t1Val.toFixed(4)}, 'μs', NOW() - (${day} * INTERVAL '1 day'), 'Decaimento Livre')`);
          qubitValues.push(`(${expId}, ${qId}, 'TaxaErro', ${errVal.toFixed(6)}, 'taxa', NOW() - (${day} * INTERVAL '1 day'), 'Tomografia de Leitura')`);
        }
      }
      
      const batchSize = 1000;
      for (let i = 0; i < qubitValues.length; i += batchSize) {
        const batch = qubitValues.slice(i, i + batchSize);
        const insertBatchQuery = `INSERT INTO Experimento_Qubit (id_experimento, id_qubit, nome_metrica, valor, unidade, data_hora_medicao, metodo_obtencao) VALUES ${batch.join(',\n')};`;
        await client.query(insertBatchQuery);
      }

      // MedePorta (Fidelidade) associando ao experimento de cada dia
      const portaValues = [];
      for (let k = 0; k < dailyExpMap.length; k++) {
        const { day, qpuId, temp } = dailyExpMap[k];
        const expId = expRows[1 + k].id_experimento;
        
        for (const gate of gatesRows) {
          const isTwoQubit = (gate.numero_qubits_alvo === 2);
          
          let baseFidelity;
          if (isTwoQubit) {
            // Portas de 2 qubits têm menor fidelidade (simulando crosstalk/física difícil)
            baseFidelity = qpuId === 1
              ? (0.960 - (gate.id_porta % 3) * 0.005) // ~95.0% - 96.0%
              : (0.970 - (gate.id_porta % 3) * 0.004); // ~96.2% - 97.0%
          } else {
            // Portas de 1 qubit têm fidelidade excelente (99.9%+)
            baseFidelity = qpuId === 1
              ? (0.9992 - (gate.id_porta % 5) * 0.0002) // ~99.9%
              : (0.9997 - (gate.id_porta % 5) * 0.0001); // ~99.95%+
          }
          
          // Degradação térmica
          const lossCoeff = isTwoQubit ? 0.003 : 0.0005;
          const tempLoss = lossCoeff * (Math.pow(temp / 0.010, 1.8) - 1.0);
          
          // Degradação temporal (drift)
          const gateAgeLoss = (100 - day) * (isTwoQubit ? 0.00012 : 0.000012);
          
          // Ruído diário pequeno
          const noise = (rand() - 0.5) * 0.0002;
          
          let fidelity = baseFidelity - tempLoss - gateAgeLoss + noise;
          fidelity = Math.max(0.75, Math.min(0.9999, fidelity));
          
          portaValues.push(`(${expId}, ${gate.id_porta}, 'Fidelidade', ${fidelity.toFixed(6)}, 'taxa', NOW() - (${day} * INTERVAL '1 day'), 'Randomized Benchmarking')`);
        }
      }
      
      // Inserir medição para o primeiro experimento de fidelidade CNOT (103 dias atrás)
      portaValues.push(`(1, 7, 'Fidelidade', 0.981500, 'taxa', NOW() - INTERVAL '103 days', 'Randomized Benchmarking')`);
      
      // Inserir medição para o experimento de Caracterização Óptica (1 dia atrás)
      const expId203 = expRows[203].id_experimento;
      portaValues.push(`(${expId203}, 1, 'Fidelidade', 0.999500, 'taxa', NOW() - INTERVAL '1 day', 'Spectroscopy')`);
      
      for (let i = 0; i < portaValues.length; i += batchSize) {
        const batch = portaValues.slice(i, i + batchSize);
        const insertBatchQuery = `INSERT INTO Experimento_Porta (id_experimento, id_porta, nome_metrica, valor, unidade, data_hora_medicao, metodo_obtencao) VALUES ${batch.join(',\n')};`;
        await client.query(insertBatchQuery);
      }

      // Sequencias de Pulso
      await client.query(`
        INSERT INTO SequenciaPulso (nome, finalidade, versao, descricao) 
        VALUES 
        ('Seq-RB-1Q', 'Fidelidade', 'v1.0.0', 'Sequência de Clifford para Randomized Benchmarking de 1 qubit'), 
        ('Seq-Calib-Pi', 'Calibração', 'v2.1.0', 'Sequência de pulso de pi para calibração de amplitude'),
        ('Seq-Echo-Z', 'Coerência', 'v1.1.2', 'Sequência de eco de spin com pulsos pi/2 e pi para desacoplamento dinâmico');
      `);

      // Pulsos
      await client.query(`
        INSERT INTO Pulso (ordem, tipo_pulso, amplitude, duracao, frequencia, fase, forma_onda, id_sequencia) 
        VALUES 
        (1, 'Gaussian', 0.50, 20.0, 5.12, 0.0, 'Gaussiana', 1), 
        (2, 'DRAG', 0.48, 20.0, 5.12, 90.0, 'Formato DRAG', 1), 
        (1, 'Rabi', 0.60, 40.0, 5.10, 0.0, 'Retangular', 2),
        (1, 'X/2', 0.25, 10.0, 5.12, 0.0, 'Gaussiana', 3),
        (2, 'Y', 0.50, 20.0, 5.12, 90.0, 'Gaussiana', 3),
        (3, 'X/2', 0.25, 10.0, 5.12, 0.0, 'Gaussiana', 3);
      `);

      // Relações N:M (Seed)
      await client.query(`
        INSERT INTO SequenciaPulso_Porta (id_sequencia, id_porta) 
        VALUES 
        (1, 1), -- Seq-RB-1Q implementa Hadamard
        (2, 2), -- Seq-Calib-Pi implementa Pauli-X
        (3, 4); -- Seq-Echo-Z implementa Pauli-Z
      `);

      await client.query(`
        INSERT INTO Porta_Qubit (id_porta, id_qubit) VALUES 
        (1, 1), -- Hadamard no qubit 1
        (2, 2), -- Pauli-X no qubit 2
        (3, 3), -- Pauli-Y no qubit 3
        (4, 4), -- Pauli-Z no qubit 4
        (5, 5), -- S no qubit 5
        (6, 6), -- T no qubit 6
        (7, 1), -- CNOT no qubit 1
        (7, 2), -- CNOT no qubit 2
        (8, 3), -- CZ no qubit 3
        (8, 4), -- CZ no qubit 4
        (9, 5), -- SWAP no qubit 5
        (9, 6); -- SWAP no qubit 6
      `);

      // Popular tabelas relacionais de calibração
      const abrangeValues = [];
      const utilizacalValues = [];
      for (const cal of calRows) {
        const calId = cal.id_calibracao;
        const qpuId = cal.id_qpu;
        const qubits = qubitsByQpu[qpuId];
        
        // Fase DRAG (melhora de 0.5% a 6.5%)
        const dragBefore = 90.0;
        const dragAfter = dragBefore * (1.0 - (0.005 + rand() * 0.06));
        
        // Frequência Rabi (melhora de 3% a 15%)
        const rabiBefore = 5.250;
        const rabiAfter = rabiBefore * (1.0 - (0.03 + rand() * 0.12));
        
        // Amplitude Pi (melhora de 8% a 28%)
        const piBefore = 0.600;
        const piAfter = piBefore * (1.0 - (0.08 + rand() * 0.20));
        
        if (qubits && qubits.length >= 3) {
          // Seleciona 3 qubits aleatórios determinísticos para calibração
          const q0Idx = Math.floor(rand() * qubits.length);
          let q1Idx = Math.floor(rand() * qubits.length);
          while (q1Idx === q0Idx) { q1Idx = Math.floor(rand() * qubits.length); }
          let q2Idx = Math.floor(rand() * qubits.length);
          while (q2Idx === q0Idx || q2Idx === q1Idx) { q2Idx = Math.floor(rand() * qubits.length); }

          const q0 = qubits[q0Idx];
          const q1 = qubits[q1Idx];
          const q2 = qubits[q2Idx];
          
          abrangeValues.push(`(${calId}, ${q0.id_qubit}, 'Fase DRAG', ${dragBefore.toFixed(6)}, ${dragAfter.toFixed(6)})`);
          abrangeValues.push(`(${calId}, ${q1.id_qubit}, 'Frequência Rabi', ${rabiBefore.toFixed(6)}, ${rabiAfter.toFixed(6)})`);
          abrangeValues.push(`(${calId}, ${q2.id_qubit}, 'Amplitude Pi', ${piBefore.toFixed(6)}, ${piAfter.toFixed(6)})`);
        }
        utilizacalValues.push(`(${calId}, 2)`);
      }
      
      if (abrangeValues.length > 0) {
        await client.query(`INSERT INTO Calibracao_Qubit (id_calibracao, id_qubit, parametro_ajustado, valor_antes, valor_depois) VALUES ${abrangeValues.join(',\n')};`);
      }
      if (utilizacalValues.length > 0) {
        await client.query(`INSERT INTO SequenciaPulso_Calibracao (id_calibracao, id_sequencia) VALUES ${utilizacalValues.join(',\n')};`);
      }
      // Popular SequenciaPulso_Experimento (associa cada experimento com uma sequência de pulsos)
      const utilizaexpValues = [];
      // Exp ID 1 (Fidelidade CNOT) -> Seq-RB-1Q (ID 1)
      utilizaexpValues.push(`(1, 1)`);
      
      for (let k = 0; k < dailyExpMap.length; k++) {
        const expId = expRows[1 + k].id_experimento;
        // Alternamos entre a Seq-RB-1Q (ID 1) e Seq-Echo-Z (ID 3)
        const seqId = (k % 2 === 0) ? 1 : 3;
        utilizaexpValues.push(`(${expId}, ${seqId})`);
      }
      
      // Exp ID 203 (Caracterização Óptica) -> Seq-RB-1Q (ID 1)
      utilizaexpValues.push(`(${expRows[203].id_experimento}, 1)`);
      
      // Exp ID 204 (Simulação VQE) -> Seq-Echo-Z (ID 3)
      utilizaexpValues.push(`(${expRows[204].id_experimento}, 3)`);

      if (utilizaexpValues.length > 0) {
        await client.query(`INSERT INTO SequenciaPulso_Experimento (id_experimento, id_sequencia) VALUES ${utilizaexpValues.join(',\n')};`);
      }
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
    await client.query('DROP TABLE IF EXISTS Calibracao_Qubit CASCADE;');
    await client.query('DROP TABLE IF EXISTS SequenciaPulso_Experimento CASCADE;');
    await client.query('DROP TABLE IF EXISTS SequenciaPulso_Calibracao CASCADE;');
    await client.query('DROP TABLE IF EXISTS Porta_Qubit CASCADE;');
    await client.query('DROP TABLE IF EXISTS SequenciaPulso_Porta CASCADE;');
    
    // Deleta as tabelas com dependências secundárias
    await client.query('DROP TABLE IF EXISTS Pulso CASCADE;');
    await client.query('DROP TABLE IF EXISTS SequenciaPulso CASCADE;');
    await client.query('DROP TABLE IF EXISTS Experimento_Porta CASCADE;');
    await client.query('DROP TABLE IF EXISTS PortaQuantica CASCADE;');
    await client.query('DROP TABLE IF EXISTS Experimento_Qubit CASCADE;');
    await client.query('DROP TABLE IF EXISTS Calibracao CASCADE;');
    await client.query('DROP TABLE IF EXISTS Experimento CASCADE;');
    await client.query('DROP TABLE IF EXISTS Qubit CASCADE;');
    await client.query('DROP TABLE IF EXISTS Qpu CASCADE;');
    await client.query('DROP TABLE IF EXISTS Criostato CASCADE;');
    await client.query('DROP TABLE IF EXISTS RegistroAmbiente CASCADE;');
    await client.query('DROP TABLE IF EXISTS Pesquisador CASCADE;');
    
    // Deleta sequências residuais
    await client.query('DROP SEQUENCE IF EXISTS Qpu_id_qpu_seq CASCADE;');
    await client.query('DROP SEQUENCE IF EXISTS Pesquisador_id_pesquisador_seq CASCADE;');
    await client.query('DROP SEQUENCE IF EXISTS Qubit_id_qubit_seq CASCADE;');
    await client.query('DROP SEQUENCE IF EXISTS Criostato_id_criostato_seq CASCADE;');
    await client.query('DROP SEQUENCE IF EXISTS Experimento_id_experimento_seq CASCADE;');
    await client.query('DROP SEQUENCE IF EXISTS Calibracao_id_calibracao_seq CASCADE;');
    await client.query('DROP SEQUENCE IF EXISTS SequenciaPulso_id_sequencia_seq CASCADE;');
    await client.query('DROP SEQUENCE IF EXISTS Pulso_id_pulso_seq CASCADE;');
    await client.query('DROP SEQUENCE IF EXISTS PortaQuantica_id_porta_seq CASCADE;');
    await client.query('DROP SEQUENCE IF EXISTS RegistroAmbiente_id_registro_ambiente_seq CASCADE;');

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

app.post('/api/db/config', async (req, res) => {
  const { user, host, database, password, port } = req.body;
  try {
    const tempConfig = {
      user: user || 'postgres',
      host: host || 'localhost',
      database: database || 'qtrack',
      password: password !== undefined ? password : '1234',
      port: parseInt(port || '5432'),
    };
    
    // Test connection
    const tempPool = new Pool(tempConfig);
    const client = await tempPool.connect();
    client.release();
    await tempPool.end();

    // Recreate active pool
    await pool.end();
    dbConfig = tempConfig;
    pool = new Pool(dbConfig);
    console.log(`Conexão com o banco atualizada: ${dbConfig.database} no host ${dbConfig.host}`);
    res.json({ message: "Conexão com o banco de dados atualizada e testada com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar conexão com o banco:", err);
    res.status(500).json({ error: "Falha ao conectar com os dados informados: " + err.message });
  }
});

app.listen(8000, () => { console.log('Backend rodando na porta 8000'); });