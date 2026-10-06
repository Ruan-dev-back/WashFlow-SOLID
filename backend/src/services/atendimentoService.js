/**
 * Camada de Negocio -- Modulo de Atendimento (recepcao).
 *
 * Concentra a regra do cadastro rapido de entrada: com placa, modelo,
 * telefone e tipo de lavagem, o recepcionista coloca o veiculo no patio
 * em uma unica requisicao (RNF05 - Usabilidade).
 */
const clienteRepository = require('../repositories/clienteRepository');
const veiculoRepository = require('../repositories/veiculoRepository');
const servicoRepository = require('../repositories/servicoRepository');
const atendimentoRepository = require('../repositories/atendimentoRepository');
const filaService = require('./filaService');
const AppError = require('../middlewares/appError');
const { normalizarPlaca } = require('../domain/placa');

/**
 * Registra a entrada de um veiculo no patio.
 *
 * Cliente e veiculo sao reaproveitados quando ja existem: no balcao, o
 * recepcionista nao deve precisar saber se aquele carro ja e cadastrado.
 */
function criarAtendimentoService({ clientes, veiculos, servicos, atendimentos, fila }) {
  async function registrarEntrada(
    { placa, modelo, cor, nomeCliente, telefone, servicoId },
    usuarioId
  ) {
    const placaNormalizada = normalizarPlaca(placa);
    let veiculo = await veiculos.buscarPorPlaca(placaNormalizada);

    const servico = await servicos.buscarPorId(servicoId);
    if (!servico || !servico.ativo) {
      throw new AppError('Servico nao encontrado.', 404);
    }

    if (veiculo) {
      const jaNaFila = await atendimentos.buscarEmAndamentoPorVeiculo(veiculo.id);
      if (jaNaFila) {
        throw new AppError(`O veiculo ${placaNormalizada} ja esta na fila.`, 409);
      }
    } else {
      let cliente = await clientes.buscarPorTelefone(telefone);
      if (!cliente) {
        cliente = await clientes.criar({ nome: nomeCliente, telefone });
      }
      veiculo = await veiculos.criar({
        placa: placaNormalizada,
        modelo,
        cor,
        clienteId: cliente.id,
      });
    }

    const criado = await atendimentos.criar({
      veiculoId: veiculo.id,
      servicoId: servico.id,
      usuarioId,
    });
    const atendimento = await atendimentos.buscarPorId(criado.id);
    const itemFila = (await fila.consultarFila()).find((item) => item.id === criado.id);

    // Mantem os campos antigos da resposta e acrescenta a previsao do painel.
    const dados = atendimento.toJSON ? atendimento.toJSON() : atendimento;
    return {
      ...dados,
      posicao: itemFila ? itemFila.posicao : null,
      tempoEsperaEstimadoMinutos: itemFila
        ? itemFila.tempoEsperaEstimadoMinutos
        : null,
    };
  }

  return { registrarEntrada };
}

const { registrarEntrada } = criarAtendimentoService({
  clientes: clienteRepository,
  veiculos: veiculoRepository,
  servicos: servicoRepository,
  atendimentos: atendimentoRepository,
  fila: filaService,
});

module.exports = { criarAtendimentoService, registrarEntrada };
