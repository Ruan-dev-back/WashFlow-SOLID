const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { autorizar } = require('../middlewares/auth');
const { PERFIS } = require('../config/constants');

function criarGestaoRoutes({ controllers, autenticar }) {
  const router = express.Router();
  router.use(autenticar, autorizar(PERFIS.GERENTE));
  router.get('/relatorios', asyncHandler(controllers.relatorio.consultar));
  router.get('/notificacoes', asyncHandler(controllers.notificacao.listar));
  return router;
}
module.exports = { criarGestaoRoutes };
