/**
 * Camada de Rotas -- cadastros de apoio.
 *
 * Consultar e cadastrar clientes/veiculos e rotina de recepcao; criar
 * tipo de lavagem (preco e duracao) e decisao de gestao, restrita ao
 * Gerente (RNF04).
 */
const express = require('express');
const { body } = require('express-validator');
const cadastroController = require('../controllers/cadastroController');
const asyncHandler = require('../middlewares/asyncHandler');
const validar = require('../middlewares/validar');
const { autenticar, autorizar } = require('../middlewares/auth');
const { VALIDACAO, PERFIS } = require('../config/constants');
const { normalizarPlaca } = require('../domain/placa');

const router = express.Router();

router.use(autenticar);

router.get('/clientes', asyncHandler(cadastroController.listarClientes));

router.post(
  '/clientes',
  [
    body('nome').notEmpty().withMessage('Informe o nome do cliente.').trim(),
    body('telefone')
      .customSanitizer((v) => String(v || '').replace(/\D/g, ''))
      .matches(VALIDACAO.TELEFONE_REGEX)
      .withMessage('Telefone invalido. Informe DDD + numero.'),
    validar,
  ],
  asyncHandler(cadastroController.criarCliente)
);

router.get('/veiculos', asyncHandler(cadastroController.listarVeiculos));

router.post(
  '/veiculos',
  [
    body('placa')
      .customSanitizer(normalizarPlaca)
      .matches(VALIDACAO.PLACA_REGEX)
      .withMessage('Placa invalida. Use o formato ABC1234 ou ABC1D23.'),
    body('modelo').notEmpty().withMessage('Informe o modelo do veiculo.').trim(),
    body('cor').optional().trim(),
    body('clienteId').isInt({ min: 1 }).withMessage('Selecione o cliente.'),
    validar,
  ],
  asyncHandler(cadastroController.criarVeiculo)
);

router.get('/servicos', asyncHandler(cadastroController.listarServicos));

router.post(
  '/servicos',
  autorizar(PERFIS.GERENTE),
  [
    body('nome').notEmpty().withMessage('Informe o nome do servico.').trim(),
    body('preco').isFloat({ min: 0 }).withMessage('Informe um preco valido.'),
    body('duracaoEstimadaMinutos')
      .isInt({ min: 1 })
      .withMessage('Informe a duracao estimada em minutos.'),
    validar,
  ],
  asyncHandler(cadastroController.criarServico)
);

module.exports = router;
