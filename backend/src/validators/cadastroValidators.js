const { body, param } = require('express-validator');
const validar = require('../middlewares/validar');
const { VALIDACAO } = require('../config/constants');
const { normalizarPlaca } = require('../domain/placa');

const validarCliente = [
  body('nome').notEmpty().withMessage('Informe o nome do cliente.').trim(),
  body('telefone')
    .customSanitizer((v) => String(v || '').replace(/\D/g, ''))
    .matches(VALIDACAO.TELEFONE_REGEX)
    .withMessage('Telefone invalido. Informe DDD + numero.'),
  validar,
];

const validarVeiculo = [
  body('placa')
    .customSanitizer(normalizarPlaca)
    .matches(VALIDACAO.PLACA_REGEX)
    .withMessage('Placa invalida. Use o formato ABC1234 ou ABC1D23.'),
  body('modelo').notEmpty().withMessage('Informe o modelo do veiculo.').trim(),
  body('cor').optional().trim(),
  body('clienteId').isInt({ min: 1 }).withMessage('Selecione o cliente.'),
  validar,
];

const validarServico = [
  body('nome').notEmpty().withMessage('Informe o nome do servico.').trim(),
  body('preco').isFloat({ min: 0 }).withMessage('Informe um preco valido.'),
  body('duracaoEstimadaMinutos')
    .isInt({ min: 1 })
    .withMessage('Informe a duracao estimada em minutos.'),
  validar,
];


const validarAtualizacaoServico = [
  param('id').isInt({ min: 1 }).withMessage('Identificador invalido.'),
  body('nome').optional().trim().notEmpty().withMessage('Informe o nome do servico.'),
  body('preco').optional().isFloat({ min: 0 }).withMessage('Informe um preco valido.'),
  body('duracaoEstimadaMinutos').optional().isInt({ min: 1 })
    .withMessage('Informe a duracao estimada em minutos.'),
  body('ativo').optional().isBoolean().withMessage('Ativo deve ser verdadeiro ou falso.').toBoolean(),
  body().custom((dados) => {
    if (!dados || !['nome', 'preco', 'duracaoEstimadaMinutos', 'ativo']
      .some((campo) => Object.hasOwn(dados, campo))) {
      throw new Error('Informe ao menos um campo para atualizar.');
    }
    return true;
  }),
  validar,
];
module.exports = { validarCliente, validarVeiculo, validarServico, validarAtualizacaoServico };
