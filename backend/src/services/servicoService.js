const AppError = require('../domain/appError');

/** @param {{servicos: import('../ports/servicoRepositoryPort').ServicoCadastroPort}} deps */
function criarServicoService({ servicos }) {
  const listarServicos = () => servicos.listar();
  const listarTodosServicos = () => servicos.listarTodos();

  async function criarServico({ nome, preco, duracaoEstimadaMinutos }) {
    const nomeLimpo = String(nome || '').trim();
    if (await servicos.buscarPorNome(nomeLimpo)) {
      throw new AppError('Ja existe um servico com este nome.', 409);
    }
    return servicos.criar({ nome: nomeLimpo, preco, duracaoEstimadaMinutos });
  }

  async function atualizarServico(id, dados) {
    const servico = await servicos.buscarPorId(id);
    if (!servico) throw new AppError('Tipo de lavagem nao encontrado.', 404);
    const campos = ['nome', 'preco', 'duracaoEstimadaMinutos', 'ativo'];
    const alteracoes = Object.fromEntries(
      campos.filter((campo) => Object.hasOwn(dados, campo)).map((campo) => [campo, dados[campo]])
    );
    if (!Object.keys(alteracoes).length) throw new AppError('Nenhum campo valido informado.', 400);
    if (Object.hasOwn(alteracoes, 'nome')) {
      const nomeLimpo = String(alteracoes.nome).trim();
      const duplicado = await servicos.buscarPorNome(nomeLimpo);
      if (duplicado && Number(duplicado.id) !== Number(servico.id)) {
        throw new AppError('Ja existe outro servico com este nome.', 409);
      }
      alteracoes.nome = nomeLimpo;
    }
    return servicos.atualizar(servico, alteracoes);
  }

  return { listarServicos, listarTodosServicos, criarServico, atualizarServico };
}
module.exports = { criarServicoService };
