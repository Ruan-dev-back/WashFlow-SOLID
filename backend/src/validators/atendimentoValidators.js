const { body } = require('express-validator');
const validar = require('../middlewares/validar');
const { VALIDACAO } = require('../config/constants');
const { normalizarPlaca } = require('../domain/placa');

const validarEntrada = [
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
];

module.exports = { validarEntrada };
