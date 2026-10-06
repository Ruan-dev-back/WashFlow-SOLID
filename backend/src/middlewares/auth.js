/**
 * Autenticacao e autorizacao (RNF04 - Seguranca).
 *
 * Toda rota de operacao exige um JWT valido; algumas exigem tambem o
 * perfil de Gerente. Sem isso, dados pessoais de clientes (nome, telefone,
 * placa) ficariam expostos a qualquer chamada.
 */
const AppError = require('./appError');

/** @param {{tokenProvider: import('../ports/tokenProviderPort').VerificadorTokenPort}} deps */
const criarAutenticar = ({ tokenProvider }) => (req, res, next) => {
  const cabecalho = req.headers.authorization || '';

  if (!cabecalho.startsWith('Bearer ')) {
    return next(new AppError('Token nao informado.', 401));
  }

  try {
    const token = cabecalho.slice(7);
    req.usuario = tokenProvider.verificar(token);
    return next();
  } catch {
    return next(new AppError('Token invalido ou expirado.', 401));
  }
};

/** Restringe a rota aos perfis informados. */
const autorizar =
  (...perfis) =>
  (req, res, next) => {
    if (!req.usuario || !perfis.includes(req.usuario.perfil)) {
      return next(new AppError('Acesso negado para este perfil.', 403));
    }
    return next();
  };

module.exports = { criarAutenticar, autorizar };
