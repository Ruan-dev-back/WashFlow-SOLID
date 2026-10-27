/** Persistencia do catalogo. Desativar preserva historico de atendimento. */
const { Servico } = require('../models');
const listar = () => Servico.findAll({ where: { ativo: true }, order: [['nome', 'ASC']] });
const listarTodos = () => Servico.findAll({ order: [['nome', 'ASC']] });
const buscarPorId = (id) => Servico.findByPk(id);
const buscarPorNome = (nome) => Servico.findOne({ where: { nome } });
const criar = (dados) => Servico.create(dados);
const atualizar = (servico, dados) => servico.update(dados);
module.exports = { listar, listarTodos, buscarPorId, buscarPorNome, criar, atualizar };
