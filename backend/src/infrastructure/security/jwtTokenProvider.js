const jwt = require('jsonwebtoken');

function criarJwtTokenProvider({ secret, expiresIn = '8h' }) {
  return {
    emitir: (payload) => jwt.sign(payload, secret, { expiresIn }),
    verificar: (token) => jwt.verify(token, secret),
  };
}

module.exports = { criarJwtTokenProvider };
