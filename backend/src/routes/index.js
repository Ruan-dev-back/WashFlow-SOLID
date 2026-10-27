/**
 * Camada de Rotas -- agregador.
 */
const express = require('express');
const { criarAuthRoutes } = require('./authRoutes');
const { criarCadastroRoutes } = require('./cadastroRoutes');
const { criarAtendimentoRoutes } = require('./atendimentoRoutes');
const { criarGestaoRoutes } = require('./gestaoRoutes');

function criarRoutes({ controllers, autenticar }) {
  const router = express.Router();

  router.get('/', (req, res) =>
    res.json({ sucesso: true, mensagem: 'API WashFlow no ar.' })
  );

  router.use(criarAuthRoutes(controllers.auth));
  router.use(criarCadastroRoutes({ cadastroController: controllers.cadastro, autenticar }));
  router.use(criarAtendimentoRoutes({
    atendimentoController: controllers.atendimento,
    filaController: controllers.fila,
    autenticar,
  }));
  router.use(criarGestaoRoutes({ controllers, autenticar }));
  return router;
}

module.exports = { criarRoutes };
