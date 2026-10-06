/**
 * Camada de Rotas -- Modulo de Atendimento e Modulo de Gestao de Fila.
 * Todas exigem usuario autenticado (RNF04).
 */
const express = require('express');
const { body } = require('express-validator');
const atendimentoController = require('../controllers/atendimentoController');
const filaController = require('../controllers/filaController');
const asyncHandler = require('../middlewares/asyncHandler');
const validar = require('../middlewares/validar');
const { autenticar } = require('../middlewares/auth');
const { VALIDACAO } = require('../config/constants');
const { normalizarPlaca } = require('../domain/placa');

const router = express.Router();

router.use(autenticar);

router.post(
  '/atendimentos',
  [
    body('placa')
      .customSanitizer(normalizarPlaca)
      .matches(VALIDACAO.PLACA_REGEX)
      .withMessage('Placa invalida. Use o formato ABC1234 ou ABC1D23.'),
    body('modelo').notEmpty().withMessage('Informe o modelo do veiculo.').trim(),
    body('cor').optional().trim(),
    body('nomeCliente').notEmpty().withMessage('Informe o nome do cliente.').trim(),
    body('telefone')
      .customSanitizer((v) => String(v || '').replace(/\D/g, ''))
      .matches(VALIDACAO.TELEFONE_REGEX)
      .withMessage('Telefone invalido. Informe DDD + numero.'),
    body('servicoId').isInt({ min: 1 }).withMessage('Selecione o tipo de lavagem.'),
    validar,
  ],
  asyncHandler(atendimentoController.registrarEntrada)
);

router.get('/fila', asyncHandler(filaController.consultarFila));

router.patch(
  '/atendimentos/:id/status',
  asyncHandler(filaController.avancarStatus)
);

module.exports = router;
