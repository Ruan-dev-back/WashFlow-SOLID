const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notificacao = sequelize.define('Notificacao', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atendimentoId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  status: { type: DataTypes.ENUM('PENDENTE', 'FALHOU', 'ENVIADO'), allowNull: false, defaultValue: 'PENDENTE' },
  tentativas: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  proximaTentativaEm: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  ultimoErro: { type: DataTypes.STRING(255), allowNull: true },
  enviadoEm: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'notificacoes' });

module.exports = Notificacao;
