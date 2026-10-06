/**
 * Carga inicial minima: sem um usuario e sem tipos de lavagem nao ha como
 * fazer login nem dar entrada em nenhum veiculo.
 * Idempotente -- so cria o que ainda nao existe.
 */
const { Usuario, Servico } = require('../models');
const { PERFIS } = require('./constants');

const USUARIOS = [
  { nome: 'Gerente WashFlow', login: 'gerente', senha: 'gerente123', perfil: PERFIS.GERENTE },
  { nome: 'Recepcao WashFlow', login: 'recepcao', senha: 'recepcao123', perfil: PERFIS.FUNCIONARIO },
];

const SERVICOS = [
  { nome: 'Lavagem Simples', preco: 40.0, duracaoEstimadaMinutos: 30 },
  { nome: 'Lavagem Completa', preco: 80.0, duracaoEstimadaMinutos: 60 },
  { nome: 'Polimento', preco: 180.0, duracaoEstimadaMinutos: 120 },
];

async function executarSeed({ passwordHasher }) {
  for (const { senha, ...dados } of USUARIOS) {
    const existente = await Usuario.findOne({ where: { login: dados.login } });
    if (!existente) {
      const senhaHash = await passwordHasher.gerarHash(senha);
      await Usuario.create({ ...dados, senhaHash });
    }
  }

  for (const servico of SERVICOS) {
    const existente = await Servico.findOne({ where: { nome: servico.nome } });
    if (!existente) {
      await Servico.create(servico);
    }
  }
}

module.exports = { executarSeed };
