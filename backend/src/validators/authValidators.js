const { body } = require('express-validator');
const validar = require('../middlewares/validar');

const validarLogin = [
  body('login').notEmpty().withMessage('Informe o login.').trim(),
  body('senha').notEmpty().withMessage('Informe a senha.'),
  validar,
];

module.exports = { validarLogin };
