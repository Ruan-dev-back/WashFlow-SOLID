/**
 * Camada de Rotas -- cadastros de apoio.
 *
 * Consultar e cadastrar clientes/veiculos e rotina de recepcao; criar
 * tipo de lavagem (preco e duracao) e decisao de gestao, restrita ao
 * Gerente (RNF04).
 */
const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { autorizar } = require('../middlewares/auth');
const { PERFIS } = require('../config/constants');
const {
  validarCliente, validarVeiculo, validarServico,
} = require('../validators/cadastroValidators');

function criarCadastroRoutes({ cadastroController, telegramVinculoController, autenticar }) {
  const router = express.Router();

  router.use(autenticar);

  router.get('/clientes', asyncHandler(cadastroController.listarClientes));

  router.post(
    '/clientes',
    validarCliente,
    asyncHandler(cadastroController.criarCliente)
  );

  router.get('/clientes/:id/telegram', asyncHandler(telegramVinculoController.status));
  router.post('/clientes/:id/telegram/vincular', asyncHandler(telegramVinculoController.gerarLink));

  router.get('/veiculos', asyncHandler(cadastroController.listarVeiculos));

  router.post(
    '/veiculos',
    validarVeiculo,
    asyncHandler(cadastroController.criarVeiculo)
  );

  router.get('/servicos', asyncHandler(cadastroController.listarServicos));

  router.post(
    '/servicos',
    autorizar(PERFIS.GERENTE),
    validarServico,
    asyncHandler(cadastroController.criarServico)
  );

  return router;
}

module.exports = { criarCadastroRoutes };
