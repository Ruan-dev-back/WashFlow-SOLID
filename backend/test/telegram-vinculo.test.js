const test = require('node:test');
const assert = require('node:assert/strict');
const { criarTelegramVinculoService } = require('../src/services/telegramVinculoService');
const { criarTelegramClient } = require('../src/infrastructure/telegram/telegramClient');

test('link de cliente vincula somente chat privado com token valido e descartavel', async () => {
  let tokenHash = null;
  let vencimento = null;
  let chatId = null;
  const svc = criarTelegramVinculoService({
    clientes: { buscarPorId: async (id) => id === '3' ? { id: 3 } : null },
    vinculos: {
      solicitar: async (_clienteId, hash, expiraEm) => { tokenHash = hash; vencimento = expiraEm; },
      buscarPorCliente: async () => ({ chatId }),
      confirmar: async (hash, chat) => {
        if (hash !== tokenHash || vencimento < new Date() || chatId) return false;
        chatId = chat; tokenHash = null; return true;
      },
    },
    telegram: { configurado: true }, botUsername: 'WashFlowTesteBot',
  });
  const { url } = await svc.gerarLink('3');
  const token = new URL(url).searchParams.get('start');
  assert.equal(token.length, 32);
  assert.equal(await svc.confirmarPorStart(token, '777'), true);
  assert.equal(await svc.confirmarPorStart(token, '999'), false);
  assert.deepEqual(await svc.consultarStatus('3'), { vinculado: true });
});

test('Telegram envia ao chat de cada cliente e le /start', async () => {
  const chamadas = [];
  const api = criarTelegramClient({
    token: 'token-teste',
    fetchImpl: async (url, options) => {
      chamadas.push({url,body:JSON.parse(options.body)});
      return {ok:true,status:200,json:async()=>({ok:true,result:url.endsWith('getUpdates')?[]:{message_id:1}})};
    },
  });
  await api.enviar('Carro pronto', '123');
  await api.enviar('Carro pronto', '456');
  await api.obterAtualizacoes(9);
  assert.deepEqual(chamadas.map(c=>c.body.chat_id).slice(0,2), ['123','456']);
  assert.equal(chamadas[2].body.offset, 9);
});
