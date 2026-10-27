const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.JWT_SECRET = 'segredo-apenas-para-testes';

const { sequelize, Usuario, Servico } = require('../src/models');
const { executarSeed } = require('../src/config/seed');
const { passwordHasher, services } = require('../src/container');

test('seed usa adapter de senha injetado e permanece idempotente', async () => {
  await sequelize.sync({ force: true });
  try {
    await executarSeed({ passwordHasher });
    await executarSeed({ passwordHasher });
    assert.equal(await Usuario.count(), 2);
    assert.equal(await Servico.count(), 3);
    const sessao = await services.auth.autenticar('recepcao', 'recepcao123');
    assert.equal(sessao.usuario.perfil, 'FUNCIONARIO');
    assert.ok(sessao.token);
  } finally {
    await sequelize.close();
  }
});
