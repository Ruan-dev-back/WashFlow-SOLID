const AppError = require('../domain/appError');
const { normalizarPlaca } = require('../domain/placa');

/** @param {{clientes: import('../ports/clienteRepositoryPort').ClienteConsultaPort,
 * veiculos: import('../ports/veiculoRepositoryPort').VeiculoCadastroPort}} deps */
function criarVeiculoService({ clientes, veiculos }) {
  const listarVeiculos = () => veiculos.listar();

  async function criarVeiculo({ placa, modelo, cor, clienteId }) {
    const cliente = await clientes.buscarPorId(clienteId);
    if (!cliente) throw new AppError('Cliente nao encontrado.', 404);

    const placaNormalizada = normalizarPlaca(placa);
    if (await veiculos.buscarPorPlaca(placaNormalizada)) {
      throw new AppError('Ja existe um veiculo com esta placa.', 409);
    }
    return veiculos.criar({ placa: placaNormalizada, modelo, cor, clienteId });
  }

  return { listarVeiculos, criarVeiculo };
}

module.exports = { criarVeiculoService };
