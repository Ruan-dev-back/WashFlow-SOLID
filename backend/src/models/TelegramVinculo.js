const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabela separada para nunca devolver chat_id ou token junto ao JSON do Cliente.
const TelegramVinculo = sequelize.define('TelegramVinculo', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  clienteId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  chatId: { type: DataTypes.STRING(32), allowNull: true, unique: true },
  tokenHash: { type: DataTypes.STRING(64), allowNull: true, unique: true },
  expiraEm: { type: DataTypes.DATE, allowNull: true },
  vinculadoEm: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'telegram_vinculos' });
module.exports = TelegramVinculo;
