/**
 * Camada de Negocio -- cadastros de apoio consumidos pela recepcao
 * (clientes, veiculos e tipos de lavagem).
 */
const clienteRepository = require('../repositories/clienteRepository');
const veiculoRepository = require('../repositories/veiculoRepository');
const servicoRepository = require('../repositories/servicoRepository');
const AppError = require('../middlewares/appError');
const { normalizarPlaca } = require('../domain/placa');

const listarClientes = () => clienteRepository.listar();

async function criarCliente({ nome, telefone }) {
  const existente = await clienteRepository.buscarPorTelefone(telefone);
  if (existente) {
    throw new AppError('Ja existe um cliente com este telefone.', 409);
  }
  return clienteRepository.criar({ nome, telefone });
}

const listarVeiculos = () => veiculoRepository.listar();

async function criarVeiculo({ placa, modelo, cor, clienteId }) {
  const cliente = await clienteRepository.buscarPorId(clienteId);
  if (!cliente) {
    throw new AppError('Cliente nao encontrado.', 404);
  }

  const placaNormalizada = normalizarPlaca(placa);
  const existente = await veiculoRepository.buscarPorPlaca(placaNormalizada);
  if (existente) {
    throw new AppError('Ja existe um veiculo com esta placa.', 409);
  }

  return veiculoRepository.criar({
    placa: placaNormalizada,
    modelo,
    cor,
    clienteId,
  });
}

const listarServicos = () => servicoRepository.listar();

async function criarServico({ nome, preco, duracaoEstimadaMinutos }) {
  const existente = await servicoRepository.buscarPorNome(nome);
  if (existente) {
    throw new AppError('Ja existe um servico com este nome.', 409);
  }
  return servicoRepository.criar({ nome, preco, duracaoEstimadaMinutos });
}

module.exports = {
  listarClientes,
  criarCliente,
  listarVeiculos,
  criarVeiculo,
  listarServicos,
  criarServico,
};
