const { Op } = require('sequelize');
const { Notificacao, Atendimento, Veiculo, Cliente, Servico, TelegramVinculo } = require('../models');

async function enfileirar(atendimentoId) {
  const [notificacao] = await Notificacao.findOrCreate({
    where: { atendimentoId },
    defaults: { atendimentoId, status: 'PENDENTE' },
  });
  return notificacao;
}

function listarPendentes() {
  return Notificacao.findAll({
    where: {
      status: { [Op.in]: ['PENDENTE', 'FALHOU'] },
      tentativas: { [Op.lt]: 3 },
      proximaTentativaEm: { [Op.lte]: new Date() },
    },
    include: [{
      model: Atendimento, as: 'atendimento',
      include: [
        { model: Veiculo, as: 'veiculo', include: [{
          model: Cliente, as: 'cliente', include: [{
            model: TelegramVinculo, as: 'telegramVinculo',
            attributes: ['chatId'],
          }],
        }] },
        { model: Servico, as: 'servico' },
      ],
    }],
    order: [['proximaTentativaEm', 'ASC']],
    limit: 10,
  });
}

function listarRecentes() {
  return Notificacao.findAll({
    order: [['createdAt', 'DESC']],
    limit: 40,
    attributes: ['id', 'atendimentoId', 'status', 'tentativas', 'proximaTentativaEm', 'enviadoEm', 'createdAt'],
  });
}

async function adiarSemVinculo(notificacao) {
  await notificacao.update({
    status: 'PENDENTE',
    proximaTentativaEm: new Date(Date.now() + 60_000),
  });
}

async function marcarEnviado(notificacao) {
  await notificacao.update({
    status: 'ENVIADO',
    tentativas: notificacao.tentativas + 1,
    enviadoEm: new Date(),
    ultimoErro: null,
  });
}

async function marcarFalha(notificacao, erro) {
  const tentativas = notificacao.tentativas + 1;
  await notificacao.update({
    status: 'FALHOU', tentativas,
    ultimoErro: String(erro).slice(0, 255),
    proximaTentativaEm: new Date(Date.now() + Math.min(60_000 * 2 ** (tentativas - 1), 600_000)),
  });
}

module.exports = { enfileirar, listarPendentes, listarRecentes, marcarEnviado, marcarFalha, adiarSemVinculo };
