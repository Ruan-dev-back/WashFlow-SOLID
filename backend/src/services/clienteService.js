const AppError = require('../domain/appError');

/** @param {{clientes: import('../ports/clienteRepositoryPort').ClienteCadastroPort}} deps */
function criarClienteService({ clientes }) {
  const listarClientes = () => clientes.listar();

  async function criarCliente({ nome, telefone }) {
    if (await clientes.buscarPorTelefone(telefone)) {
      throw new AppError('Ja existe um cliente com este telefone.', 409);
    }
    return clientes.criar({ nome, telefone });
  }

  return { listarClientes, criarCliente };
}

module.exports = { criarClienteService };
