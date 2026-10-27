const test = require('node:test');
const assert = require('node:assert/strict');

const { calcularFila } = require('../src/domain/fila');
const { normalizarPlaca } = require('../src/domain/placa');
const { fluxoStatusPadrao, criarFluxoStatus } = require('../src/domain/fluxoStatus');
const { criarFilaService } = require('../src/services/filaService');

function atendimento(id, duracao, horaInicio = null) {
  return {
    id, status: 'AGUARDANDO', horaEntrada: new Date('2026-01-01T10:00:00Z'),
    horaInicio, veiculo: { placa: `ABC${id}234`, modelo: 'Teste', cor: null, cliente: null },
    servico: { nome: 'Lavagem', duracaoEstimadaMinutos: duracao },
  };
}

test('calcula posicao e previsao acumulada descontando apenas o tempo em curso', () => {
  const agora = new Date('2026-01-01T10:10:00Z');
  const fila = calcularFila([
    atendimento(1, 30, new Date('2026-01-01T10:00:00Z')),
    atendimento(2, 60),
    atendimento(3, 120),
  ], agora);
  assert.deepEqual(fila.map(({ posicao, tempoEsperaEstimadoMinutos }) =>
    [posicao, tempoEsperaEstimadoMinutos]), [[1, 20], [2, 80], [3, 200]]);
});

test('normaliza placa e define as transicoes sem acessar persistencia', () => {
  assert.equal(normalizarPlaca('abc-1d23'), 'ABC1D23');
  assert.deepEqual(fluxoStatusPadrao.proximaTransicao('AGUARDANDO'), {
    status: 'EM_LAVAGEM', horario: 'horaInicio',
  });
  assert.equal(fluxoStatusPadrao.proximaTransicao('FINALIZADO'), null);
});

test('fila aceita repositório substituto e relógio controlado', async () => {
  const agora = new Date('2026-01-01T10:10:00Z');
  const registro = atendimento(1, 30);
  const chamadas = [];
  const servico = criarFilaService({
    relogio: () => agora,
    fluxoStatus: fluxoStatusPadrao,
    atendimentos: {
      listarEmAndamento: async () => [registro],
      buscarPorId: async () => registro,
      salvar: async (valor) => { chamadas.push(valor.status); },
    },
  });

  assert.equal((await servico.consultarFila())[0].tempoEsperaEstimadoMinutos, 30);
  const atualizado = await servico.avancarStatus(1);
  assert.equal(atualizado.status, 'EM_LAVAGEM');
  assert.equal(atualizado.horaInicio, agora);
  assert.deepEqual(chamadas, ['EM_LAVAGEM']);
});

test('nova politica de status pode ser injetada sem alterar FilaService', async () => {
  const registro = atendimento(1, 30);
  const fluxoStatus = criarFluxoStatus([{ de: 'AGUARDANDO', para: 'INSPECAO' }]);
  const servico = criarFilaService({
    fluxoStatus,
    atendimentos: {
      listarEmAndamento: async () => [registro],
      buscarPorId: async () => registro,
      salvar: async () => registro,
    },
  });
  assert.equal((await servico.avancarStatus(1)).status, 'INSPECAO');
});
