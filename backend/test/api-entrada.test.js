const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.JWT_SECRET = 'segredo-apenas-para-testes';

const app = require('../src/app');
const { sequelize, Usuario, Servico } = require('../src/models');

test('POST /api/atendimentos devolve os dados anteriores mais posicao e previsao', async () => {
  await sequelize.sync({ force: true });
  const server = app.listen(0);
  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const usuario = await Usuario.create({
      nome: 'Atendente', login: 'api', senhaHash: 'hash', perfil: 'FUNCIONARIO',
    });
    const servico = await Servico.create({
      nome: 'Simples', preco: 40, duracaoEstimadaMinutos: 30,
    });
    const token = jwt.sign({ id: usuario.id, perfil: usuario.perfil }, process.env.JWT_SECRET);
    const resposta = await fetch(`http://127.0.0.1:${server.address().port}/api/atendimentos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        placa: 'abc-1234', modelo: 'Gol', cor: 'Branco',
        nomeCliente: 'Ana', telefone: '11999999999', servicoId: servico.id,
      }),
    });
    const corpo = await resposta.json();
    assert.equal(resposta.status, 201);
    assert.equal(corpo.dados.veiculo.placa, 'ABC1234');
    assert.equal(corpo.dados.servico.id, servico.id);
    assert.equal(corpo.dados.posicao, 1);
    assert.equal(corpo.dados.tempoEsperaEstimadoMinutos, 30);
  } finally {
    await new Promise((resolve, reject) => server.close((erro) => erro ? reject(erro) : resolve()));
    await sequelize.close();
  }
});
