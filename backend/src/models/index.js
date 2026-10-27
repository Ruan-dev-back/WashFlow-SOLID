/**
 * Camada de Modelo -- ponto unico de montagem das associacoes.
 * Concentrar as associacoes aqui evita import circular entre os modelos.
 */
const sequelize = require('../config/database');

const Usuario = require('./Usuario');
const Cliente = require('./Cliente');
const Veiculo = require('./Veiculo');
const Servico = require('./Servico');
const Atendimento = require('./Atendimento');
const Notificacao = require('./Notificacao');

// Um cliente pode ter varios veiculos.
Cliente.hasMany(Veiculo, { foreignKey: 'clienteId', as: 'veiculos' });
Veiculo.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });

// Cada atendimento e um veiculo passando por um servico.
Veiculo.hasMany(Atendimento, { foreignKey: 'veiculoId', as: 'atendimentos' });
Atendimento.belongsTo(Veiculo, { foreignKey: 'veiculoId', as: 'veiculo' });

Servico.hasMany(Atendimento, { foreignKey: 'servicoId', as: 'atendimentos' });
Atendimento.belongsTo(Servico, { foreignKey: 'servicoId', as: 'servico' });

// Registra qual recepcionista deu entrada no veiculo.
Usuario.hasMany(Atendimento, { foreignKey: 'usuarioId', as: 'atendimentos' });
Atendimento.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

Atendimento.hasOne(Notificacao, { foreignKey: 'atendimentoId', as: 'notificacao' });
Notificacao.belongsTo(Atendimento, { foreignKey: 'atendimentoId', as: 'atendimento' });

module.exports = {
  Notificacao,
  sequelize,
  Usuario,
  Cliente,
  Veiculo,
  Servico,
  Atendimento,
};
