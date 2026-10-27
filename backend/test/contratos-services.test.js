const test = require('node:test');
const assert = require('node:assert/strict');

const { criarAuthService } = require('../src/services/authService');
const { criarAtendimentoService } = require('../src/services/atendimentoService');
const { criarFilaService } = require('../src/services/filaService');
const { fluxoStatusPadrao } = require('../src/domain/fluxoStatus');

test('AuthService aceita repositorio, comparador e emissor substitutos', async () => {
  const chamadas = [];
  const fakeUsuarioRepository = {
    buscarPorLogin: async (login) => {
      chamadas.push(['usuario', login]);
      return { id: 7, nome: 'Ana', login, senhaHash: 'hash', perfil: 'FUNCIONARIO', ativo: true };
    },
  };
  const fakePasswordHasher = {
    comparar: async (senha, hash) => {
      chamadas.push(['senha', senha, hash]);
      return senha === 'correta';
    },
  };
  const fakeTokenProvider = {
    emitir: (payload) => {
      chamadas.push(['token', payload.id]);
      return 'token-fake';
    },
  };
  const auth = criarAuthService({
    usuarios: fakeUsuarioRepository,
    passwordHasher: fakePasswordHasher,
    tokenProvider: fakeTokenProvider,
  });

  const resultado = await auth.autenticar('ana', 'correta');
  assert.equal(resultado.token, 'token-fake');
  assert.deepEqual(resultado.usuario, {
    id: 7, nome: 'Ana', login: 'ana', perfil: 'FUNCIONARIO',
  });
  assert.deepEqual(chamadas, [
    ['usuario', 'ana'], ['senha', 'correta', 'hash'], ['token', 7],
  ]);

  await assert.rejects(auth.autenticar('ana', 'errada'), { status: 401 });
  assert.equal(chamadas.filter(([tipo]) => tipo === 'token').length, 1);
});

test('AtendimentoService aceita repositories e fila substitutos', async () => {
  const chamadas = [];
  const clientes = {
    buscarPorTelefone: async (telefone) => {
      chamadas.push(['buscarCliente', telefone]);
      return null;
    },
    criar: async (dados) => {
      chamadas.push(['criarCliente', dados.nome]);
      return { id: 2, ...dados };
    },
  };
  const veiculos = {
    buscarPorPlaca: async (placa) => {
      chamadas.push(['buscarVeiculo', placa]);
      return null;
    },
    criar: async (dados) => {
      chamadas.push(['criarVeiculo', dados.placa]);
      return { id: 3, ...dados };
    },
  };
  const servicos = { buscarPorId: async () => ({ id: 4, ativo: true }) };
  const atendimentos = {
    buscarEmAndamentoPorVeiculo: async () => null,
    criar: async (dados) => {
      chamadas.push(['criarAtendimento', dados.veiculoId]);
      return { id: 5 };
    },
    buscarPorId: async () => ({ id: 5, veiculo: { placa: 'ABC1234' }, servico: { nome: 'Simples' } }),
  };
  const fila = { consultarFila: async () => [{ id: 5, posicao: 2, tempoEsperaEstimadoMinutos: 90 }] };
  const service = criarAtendimentoService({ clientes, veiculos, servicos, atendimentos, fila });

  const resultado = await service.registrarEntrada({
    placa: 'abc-1234', modelo: 'Gol', nomeCliente: 'Ana',
    telefone: '11999999999', servicoId: 4,
  }, 1);
  assert.equal(resultado.posicao, 2);
  assert.equal(resultado.tempoEsperaEstimadoMinutos, 90);
  assert.deepEqual(chamadas, [
    ['buscarVeiculo', 'ABC1234'], ['buscarCliente', '11999999999'],
    ['criarCliente', 'Ana'], ['criarVeiculo', 'ABC1234'], ['criarAtendimento', 3],
  ]);
});

test('transicoes preservam ordem e registram somente os horarios previstos', async () => {
  const primeiraHora = new Date('2026-01-01T10:00:00Z');
  const ultimaHora = new Date('2026-01-01T10:30:00Z');
  const horas = [primeiraHora, ultimaHora];
  const registro = { id: 1, status: 'AGUARDANDO', horaInicio: null, horaFim: null };
  const fila = criarFilaService({
    fluxoStatus: fluxoStatusPadrao,
    relogio: () => horas.shift(),
    atendimentos: {
      buscarPorId: async () => registro,
      salvar: async () => registro,
    },
  });

  assert.equal((await fila.avancarStatus(1)).status, 'EM_LAVAGEM');
  assert.equal(registro.horaInicio, primeiraHora);
  assert.equal((await fila.avancarStatus(1)).status, 'SECAGEM');
  assert.equal(registro.horaFim, null);
  assert.equal((await fila.avancarStatus(1)).status, 'FINALIZADO');
  assert.equal(registro.horaFim, ultimaHora);
  await assert.rejects(fila.avancarStatus(1), { status: 409 });
});
