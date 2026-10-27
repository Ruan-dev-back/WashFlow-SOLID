const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.JWT_SECRET = 'segredo-so-para-testes';

const app = require('../src/app');
const { sequelize, Usuario } = require('../src/models');

test('admin cadastra, edita, desativa; funcionario nao administra lavagens', async () => {
  await sequelize.sync({ force: true });
  const server = app.listen(0);
  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const base = 'http://127.0.0.1:' + server.address().port + '/api';
    const gerente = await Usuario.create({
      nome:'ADM', login:'admin-test', senhaHash:'hash', perfil:'GERENTE',
    });
    const funcionario = await Usuario.create({
      nome:'Atendente', login:'staff-test', senhaHash:'hash', perfil:'FUNCIONARIO',
    });
    const cabecalho = (u) => ({
      Authorization:'Bearer ' + jwt.sign({ id:u.id, perfil:u.perfil }, process.env.JWT_SECRET),
      'Content-Type':'application/json',
    });
    const adminHeaders = cabecalho(gerente);
    const staffHeaders = cabecalho(funcionario);
    const requisicao = (rota, method, headers, dados) => fetch(base + rota, {
      method,headers,...(dados !== undefined ? {body:JSON.stringify(dados)} : {}),
    });

    assert.equal((await requisicao('/servicos/admin','GET',{})).status, 401);
    assert.equal((await requisicao('/servicos/admin','GET',staffHeaders)).status, 403);
    assert.equal((await requisicao('/servicos','POST',staffHeaders,{nome:'Premium',preco:90,duracaoEstimadaMinutos:45})).status, 403);

    const criado = await requisicao('/servicos','POST',adminHeaders,{
      nome:'Lavagem Premium',preco:90,duracaoEstimadaMinutos:45,
    });
    assert.equal(criado.status, 201);
    const novo = (await criado.json()).dados;
    assert.equal(novo.ativo,true);

    assert.equal((await requisicao('/servicos/' + novo.id, 'PATCH',staffHeaders,{preco:1})).status,403);
    const atualizacao = await requisicao('/servicos/' + novo.id,'PATCH',adminHeaders,{
      nome:'Lavagem Premium Plus', preco:110,duracaoEstimadaMinutos:55,
    });
    assert.equal(atualizacao.status,200);
    assert.equal(Number((await atualizacao.json()).dados.preco),110);

    const desativado = await requisicao('/servicos/' + novo.id,'PATCH',adminHeaders,{ativo:false});
    assert.equal(desativado.status,200);
    assert.equal((await desativado.json()).dados.ativo,false);

    const listaRecepcao = await requisicao('/servicos','GET',staffHeaders);
    assert.equal(listaRecepcao.status,200);
    assert.equal((await listaRecepcao.json()).dados.length,0);

    const listaAdmin = await requisicao('/servicos/admin','GET',adminHeaders);
    assert.equal(listaAdmin.status,200);
    assert.equal((await listaAdmin.json()).dados[0].ativo,false);

    assert.equal((await requisicao('/servicos/' + novo.id,'PATCH',adminHeaders,{ativo:true})).status,200);
    assert.equal((await requisicao('/servicos','GET',staffHeaders)).status,200);
    assert.equal((await requisicao('/servicos/' + novo.id,'PATCH',adminHeaders,{preco:-1})).status,400);
    assert.equal((await requisicao('/servicos/999999','PATCH',adminHeaders,{preco:40})).status,404);

    const duplicado = await requisicao('/servicos','POST',adminHeaders,{
      nome:'Lavagem Premium Plus',preco:10,duracaoEstimadaMinutos:10,
    });
    assert.equal(duplicado.status,409);
  } finally {
    await new Promise((resolve,reject)=>server.close((e)=>e?reject(e):resolve()));
    await sequelize.close();
  }
});
