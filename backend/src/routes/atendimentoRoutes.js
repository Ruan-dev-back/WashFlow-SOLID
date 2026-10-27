/**
 * Camada de Rotas -- Modulo de Atendimento e Modulo de Gestao de Fila.
 * Todas exigem usuario autenticado (RNF04).
 */
const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { validarEntrada } = require('../validators/atendimentoValidators');

function criarAtendimentoRoutes({ atendimentoController, filaController, autenticar }) {
  const router = express.Router();

  router.use(autenticar);

  router.post(
    '/atendimentos',
    validarEntrada,
    asyncHandler(atendimentoController.registrarEntrada)
  );

  router.get('/fila', asyncHandler(filaController.consultarFila));

  router.patch(
    '/atendimentos/:id/status',
    asyncHandler(filaController.avancarStatus)
  );

  return router;
}

module.exports = { criarAtendimentoRoutes };
