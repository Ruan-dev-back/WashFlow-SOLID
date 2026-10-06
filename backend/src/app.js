/**
 * Montagem do Express -- o "monolito" do C4 Nivel 2.
 * Mantido separado do server.js para que a aplicacao possa ser montada
 * sem abrir porta (util em teste).
 */
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { criarRoutes } = require('./routes');
const container = require('./container');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

app.use('/api', criarRoutes(container));

app.use((req, res) =>
  res.status(404).json({ sucesso: false, mensagem: 'Rota nao encontrada.', erros: [] })
);

// Sempre o ultimo: so e alcancado via next(err).
app.use(errorHandler);

module.exports = app;
