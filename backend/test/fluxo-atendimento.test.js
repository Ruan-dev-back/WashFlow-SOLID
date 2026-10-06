const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';

const { sequelize, Usuario, Cliente, Veiculo, Servico } = require('../src/models');
const { services } = require('../src/container');
const atendimentoService = services.atendimento;
const filaService = services.fila;

test('consulta ou cadastra veiculo, cria atendimento e informa fila sem duplicar cadastro', async () => {
  await sequelize.sync({ force: true });
  try {
    const usuario = await Usuario.create({
      nome: 'Atendente', login: 'atendente', senhaHash: 'hash', perfil: 'FUNCIONARIO',
    });
    const simples = await Servico.create({
      nome: 'Simples', preco: 40, duracaoEstimadaMinutos: 30,
    });
    const completa = await Servico.create({
      nome: 'Completa', preco: 80, duracaoEstimadaMinutos: 60,
    });

    const primeiro = await atendimentoService.registrarEntrada({
      placa: 'abc-1234', modelo: 'Gol', cor: 'Branco',
      nomeCliente: 'Ana', telefone: '11999999999', servicoId: simples.id,
    }, usuario.id);
    assert.equal(primeiro.veiculo.placa, 'ABC1234');
    assert.equal(primeiro.posicao, 1);
    assert.equal(primeiro.tempoEsperaEstimadoMinutos, 30);

    // Deixa a ordem de chegada inequivoca mesmo em bancos com precisao de segundos.
    await sequelize.models.Atendimento.update(
      { horaEntrada: new Date(Date.now() - 60000) },
      { where: { id: primeiro.id } }
    );

    const segundo = await atendimentoService.registrarEntrada({
      placa: 'xyz-9876', modelo: 'Onix', cor: 'Azul',
      nomeCliente: 'Bruno', telefone: '11888888888', servicoId: completa.id,
    }, usuario.id);
    assert.equal(segundo.posicao, 2);
    assert.equal(segundo.tempoEsperaEstimadoMinutos, 90);
    assert.deepEqual((await filaService.consultarFila()).map((item) => item.placa), [
      'ABC1234', 'XYZ9876',
    ]);

    await assert.rejects(
      atendimentoService.registrarEntrada({
        placa: 'ABC1234', modelo: 'Gol', nomeCliente: 'Outro',
        telefone: '11777777777', servicoId: simples.id,
      }, usuario.id),
      { status: 409 }
    );
    assert.equal(await Cliente.count(), 2);
    assert.equal(await Veiculo.count(), 2);

    await filaService.avancarStatus(primeiro.id);
    await filaService.avancarStatus(primeiro.id);
    await filaService.avancarStatus(primeiro.id);
    await assert.rejects(filaService.avancarStatus(primeiro.id), { status: 409 });
    assert.deepEqual((await filaService.consultarFila()).map((item) => item.id), [segundo.id]);

    const retorno = await atendimentoService.registrarEntrada({
      placa: 'ABC1234', modelo: 'Gol', nomeCliente: 'Outro',
      telefone: '11777777777', servicoId: simples.id,
    }, usuario.id);
    assert.equal(retorno.veiculo.id, primeiro.veiculo.id);
    assert.equal(retorno.posicao, 2);
    assert.equal(retorno.tempoEsperaEstimadoMinutos, 90);
    assert.equal(await Cliente.count(), 2);
    assert.equal(await Veiculo.count(), 2);
  } finally {
    await sequelize.close();
  }
});
