/**
 * Camada de Rotas -- apenas mapeia URL para validacao e controller.
 */
const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { validarLogin } = require('../validators/authValidators');

function criarAuthRoutes(authController) {
  const router = express.Router();

  router.post(
    '/auth/login',
    validarLogin,
    asyncHandler(authController.login)
  );

  return router;
}

module.exports = { criarAuthRoutes };
