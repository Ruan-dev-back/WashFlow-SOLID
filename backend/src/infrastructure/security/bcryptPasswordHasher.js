const bcrypt = require('bcryptjs');

function criarBcryptPasswordHasher({ custo = 10 } = {}) {
  return {
    comparar: (senha, hash) => bcrypt.compare(senha, hash),
    gerarHash: (senha) => bcrypt.hash(senha, custo),
  };
}

module.exports = { criarBcryptPasswordHasher };
