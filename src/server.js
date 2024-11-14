const express = require('express');
const path = require('path'); // Para manipular os caminhos dos arquivos
const { Pool } = require('pg');
const app = express();
const port = 3000;

// Configuração do cliente PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'psychologytimemanager',

    connectionString: process.env.DATABASE_URL, // Usar a variável de ambiente no Heroku
    ssl: {
      rejectUnauthorized: false
    },
    
    port: 5432,
    max: 20,               // Número máximo de conexões simultâneas
    idleTimeoutMillis: 30000, // Tempo de inatividade antes de liberar a conexão
    connectionTimeoutMillis: 2000, // Tempo máximo de espera para estabelecer a conexão
});

// Middleware para parsear JSON no corpo das requisições
app.use(express.json());

// Servir o frontend (arquivos estáticos)
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a página inicial (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Envia o index.html da pasta 'frontend'
  });
  

// Função para salvar os arrays no banco de dados

const saveData = async (events, patients) => {
    const query = `
        INSERT INTO psychologist_data (events, patients)
        VALUES ($1::jsonb[], $2::jsonb[])
        RETURNING *;
    `
    const values = [events, patients];

    try {
        const res = await pool.query(query, values);
        return res.rows[0];
    } catch (err) {
        console.error('Erro ao salvar dados:', err);
        throw err;
    }
};

// Função para recuperar os dados do banco de dados
const getData = async () => {
    const query = 'SELECT * FROM psychologist_data ORDER BY id DESC LIMIT 1;';
    
    try {
    const res = await pool.query(query);
    return res.rows[0];
    } catch (err) {
    console.error('Erro ao recuperar dados:', err);
    throw err;
    }
};

// Rota para salvar os arrays no banco de dados
app.post('/save', async (req, res) => {
    const { events, patients } = req.body;
    if (Array.isArray(events) && Array.isArray(patients)) {
    try {
        const savedData = await saveData(events, patients);
        return res.status(200).json({ message: 'Dados salvos com sucesso!', data: savedData });
        } catch (error) {
        return res.status(500).json({ message: 'Erro ao salvar os dados.' });
    }
    } else if (
        Array.events === undefined ||
        Array.events === null ||
        (Array.events && Array.events.length === 0) ||
        Array.patients === undefined ||
        Array.patients === null ||
        (Array.patients && Array.events.length === 0)
    ) {
        return res.status(400).json({ message: 'Algum dos dados são indefinidos, nulos ou vazios.'})
    }
    else {
        return res.status(400).json({ message: 'Os dados precisam ser arrays.' });
    }
});

  // Rota para obter os dados salvos
app.get('/get-data', async (req, res) => {
    try {
    const data = await getData();
    if (data) {
        return res.status(200).json(data);
    } else {
        return res.status(404).json({ message: 'Nenhum dado encontrado.' });
    }
    } catch (error) {
    return res.status(500).json({ message: 'Erro ao recuperar os dados.' });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});