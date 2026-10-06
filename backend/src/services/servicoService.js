const AppError = require('../domain/appError');

/** @param {{servicos: import('../ports/servicoRepositoryPort').ServicoCadastroPort}} deps */
function criarServicoService({ servicos }) {
  const listarServicos = () => servicos.listar();

  async function criarServico({ nome, preco, duracaoEstimadaMinutos }) {
    if (await servicos.buscarPorNome(nome)) {
      throw new AppError('Ja existe um servico com este nome.', 409);
    }
    return servicos.criar({ nome, preco, duracaoEstimadaMinutos });
  }

  return { listarServicos, criarServico };
}

module.exports = { criarServicoService };
