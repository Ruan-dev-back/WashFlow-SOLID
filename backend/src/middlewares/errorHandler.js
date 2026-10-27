/**
 * Destino final de todo erro da API. Traduz erros de dominio, de validacao
 * do Sequelize e falhas inesperadas em um formato unico de resposta.
 */
const errorHandler = (err, req, res, _next) => {
  if (!err.status || err.status >= 500) {
    console.error(err);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      sucesso: false,
      mensagem: 'Ja existe um registro com esses dados.',
      erros: err.errors.map((e) => e.message),
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Dados invalidos.',
      erros: err.errors.map((e) => e.message),
    });
  }

  return res.status(err.status || 500).json({
    sucesso: false,
    mensagem: (err.status || 500) >= 500 ? 'Ocorreu um erro inesperado.' : err.message,
    erros: (err.status || 500) >= 500 ? [] : err.erros || [],
  });
};

module.exports = errorHandler;
