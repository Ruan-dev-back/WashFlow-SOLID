/**
 * Erro de negocio com status HTTP proprio.
 *
 * Permite que a camada de servico sinalize "cliente nao encontrado" ou
 * "placa ja na fila" sem importar nada do Express -- quem traduz isso em
 * resposta HTTP e o errorHandler.
 */
module.exports = require('../domain/appError');
