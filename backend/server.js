const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Coloque os dados do seu pgAdmin aqui
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'qtrack',
  password: '1234',
  port: 5432,
});

// Rota de consulta exigida pelo trabalho (Lista as QPUs)
app.get('/api/qpus', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_qpu, nome, fabricante, modelo FROM QPU;');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro interno do servidor');
  }
});

app.listen(8000, () => {
  console.log('Backend rodando na porta 8000');
});