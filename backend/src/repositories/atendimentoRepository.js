/**
 * Camada de Persistencia -- atendimentos.
 *
 * A consulta listarEmAndamento e a que materializa a "fila": atendimentos
 * ainda no patio, na ordem de chegada.
 */
const { Op } = require('sequelize');
const { Atendimento, Veiculo, Cliente, Servico } = require('../models');
const { STATUS_EM_ANDAMENTO } = require('../config/constants');

/** Traz sempre veiculo, dono e servico -- o painel precisa dos tres. */
const INCLUDES = [
  {
    model: Veiculo,
    as: 'veiculo',
    include: [{ model: Cliente, as: 'cliente' }],
  },
  { model: Servico, as: 'servico' },
];

const listarEmAndamento = () =>
  Atendimento.findAll({
    where: { status: { [Op.in]: STATUS_EM_ANDAMENTO } },
    include: INCLUDES,
    order: [['horaEntrada', 'ASC']],
  });

const buscarPorId = (id) => Atendimento.findByPk(id, { include: INCLUDES });

/** Impede que o mesmo veiculo seja colocado duas vezes na fila. */
const buscarEmAndamentoPorVeiculo = (veiculoId) =>
  Atendimento.findOne({
    where: { veiculoId, status: { [Op.in]: STATUS_EM_ANDAMENTO } },
  });

const listarFinalizadosEntre = (inicio, fim) =>
  Atendimento.findAll({
    where: {
      status: 'FINALIZADO',
      horaFim: { [Op.gte]: inicio, [Op.lt]: fim },
    },
    include: INCLUDES,
    order: [['horaFim', 'DESC']],
  });

const criar = (dados) => Atendimento.create(dados);

const salvar = (atendimento) => atendimento.save();

module.exports = {
  listarEmAndamento,
  listarFinalizadosEntre,
  buscarPorId,
  buscarEmAndamentoPorVeiculo,
  criar,
  salvar,
};
