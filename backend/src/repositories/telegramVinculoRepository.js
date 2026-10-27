const { Op } = require('sequelize');
const { TelegramVinculo } = require('../models');

async function solicitar(clienteId, tokenHash, expiraEm) {
  const [vinculo] = await TelegramVinculo.findOrCreate({
    where: { clienteId },
    defaults: { clienteId, tokenHash, expiraEm },
  });
  await vinculo.update({ tokenHash, expiraEm });
}

async function confirmar(tokenHash, chatId) {
  const vinculo = await TelegramVinculo.findOne({
    where: { tokenHash, expiraEm: { [Op.gt]: new Date() } },
  });
  if (!vinculo) return false;
  const ocupado = await TelegramVinculo.findOne({ where: { chatId } });
  if (ocupado && ocupado.clienteId !== vinculo.clienteId) return false;
  await vinculo.update({
    chatId, tokenHash: null, expiraEm: null, vinculadoEm: new Date(),
  });
  return true;
}

function buscarPorCliente(clienteId) {
  return TelegramVinculo.findOne({ where: { clienteId } });
}

module.exports = { solicitar, confirmar, buscarPorCliente };
