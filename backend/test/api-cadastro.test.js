const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.JWT_SECRET = 'segredo-apenas-para-testes';

const app = require('../src/app');
const { passwordHasher } = require('../src/container');
const { sequelize, Usuario } = require('../src/models');

test('login e endpoints de clientes, veiculos e servicos mantem contratos HTTP', async () => {
  await sequelize.sync({ force: true });
  const server = app.listen(0);
  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}/api`;
    await Usuario.create({
      nome: 'Gerente', login: 'gerente',
      senhaHash: await passwordHasher.gerarHash('segredo'), perfil: 'GERENTE',
    });

    const semToken = await fetch(`${base}/clientes`);
    assert.equal(semToken.status, 401);

    const login = await fetch(`${base}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: 'gerente', senha: 'segredo' }),
    });
    assert.equal(login.status, 200);
    const { dados: sessao } = await login.json();
    assert.equal(sessao.usuario.perfil, 'GERENTE');
    assert.equal(Object.hasOwn(sessao.usuario, 'senhaHash'), false);

    const headers = {
      'Content-Type': 'application/json', Authorization: `Bearer ${sessao.token}`,
    };
    const criar = async (path, dados) => fetch(`${base}${path}`, {
      method: 'POST', headers, body: JSON.stringify(dados),
    });
    const clienteResposta = await criar('/clientes', {
      nome: 'Ana', telefone: '11999999999',
    });
    assert.equal(clienteResposta.status, 201);
    const cliente = (await clienteResposta.json()).dados;

    const veiculoResposta = await criar('/veiculos', {
      placa: 'abc-1234', modelo: 'Gol', cor: 'Branco', clienteId: cliente.id,
    });
    assert.equal(veiculoResposta.status, 201);
    assert.equal((await veiculoResposta.json()).dados.placa, 'ABC1234');

    const servicoResposta = await criar('/servicos', {
      nome: 'Simples', preco: 40, duracaoEstimadaMinutos: 30,
    });
    assert.equal(servicoResposta.status, 201);

    for (const path of ['/clientes', '/veiculos', '/servicos']) {
      const resposta = await fetch(`${base}${path}`, { headers });
      assert.equal(resposta.status, 200);
      assert.equal((await resposta.json()).dados.length, 1);
    }
  } finally {
    await new Promise((resolve, reject) => server.close((erro) => erro ? reject(erro) : resolve()));
    await sequelize.close();
  }
});
