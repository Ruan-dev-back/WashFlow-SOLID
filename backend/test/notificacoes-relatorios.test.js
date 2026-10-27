const test = require('node:test');
const assert = require('node:assert/strict');
const { criarTelegramClient } = require('../src/infrastructure/telegram/telegramClient');
const { criarNotificacaoService } = require('../src/services/notificacaoService');
const { criarRelatorioService } = require('../src/services/relatorioService');

test('Telegram envia ao chat configurado usando Bot API', async () => {
  const chamadas = [];
  const telegram = criarTelegramClient({
    token: 'token-de-teste', chatId: '1234',
    fetchImpl: async (url, options) => {
      chamadas.push({ url, options });
      return { ok: true, status: 200, json: async () => ({ ok: true, result: { message_id: 7 } }) };
    },
  });
  await telegram.enviar('Teste de entrega');
  assert.equal(chamadas.length, 1);
  assert.equal(JSON.parse(chamadas[0].options.body).chat_id, '1234');
  assert.equal(JSON.parse(chamadas[0].options.body).text, 'Teste de entrega');
});

test('falha do Telegram fica pendente e nao derruba atendimento', async () => {
  const item = { id: 1, tentativas: 0, atendimento: { veiculo: { placa: 'ABC1D23' }, servico: { nome: 'Simples' } } };
  const chamadas = [];
  const notificacoes = {
    enfileirar: async (id) => { chamadas.push(['fila', id]); return { id }; },
    listarPendentes: async () => [item],
    marcarEnviado: async () => { chamadas.push(['enviado']); },
    marcarFalha: async (_item, erro) => { chamadas.push(['falhou', erro]); },
    listarRecentes: async () => [],
  };
  const telegram = { configurado: true, enviar: async () => { throw new Error('indisponivel'); } };
  const servico = criarNotificacaoService({ notificacoes, telegram });
  await servico.enfileirarFinalizacao({ id: 8 });
  assert.equal(await servico.processarPendentes(), 0);
  assert.deepEqual(chamadas, [['fila', 8], ['falhou', 'indisponivel']]);
});

test('relatorio agrega histórico e media das finalizacoes', async () => {
  const relatorio = criarRelatorioService({
    atendimentos: { listarFinalizadosEntre: async () => [
      { id: 1, veiculo: { placa: 'ABC1234', cliente: { nome: 'Ana' } },
        servico: { nome: 'Simples' }, horaEntrada: new Date('2026-10-26T12:00:00Z'),
        horaInicio: new Date('2026-10-26T12:00:00Z'), horaFim: new Date('2026-10-26T12:30:00Z') },
      { id: 2, veiculo: { placa: 'XYZ9876', cliente: { nome: 'Bia' } },
        servico: { nome: 'Simples' }, horaEntrada: new Date('2026-10-26T13:00:00Z'),
        horaInicio: new Date('2026-10-26T13:00:00Z'), horaFim: new Date('2026-10-26T14:00:00Z') },
    ] },
  });
  const dados = await relatorio.consultar('2026-10-26');
  assert.equal(dados.totalFinalizados, 2);
  assert.equal(dados.tempoMedioMinutos, 45);
  assert.equal(dados.porServico.Simples, 2);
});
