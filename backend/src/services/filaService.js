/**
 * Camada de Negocio -- Modulo de Gestao de Fila.
 *
 * Esta e a regra central do WashFlow e o motivo de existir uma camada de
 * servico separada: nem o controller nem o repositorio sabem calcular a
 * fila, so este arquivo sabe.
 *
 * Premissa operacional: o lava-rapido atende um veiculo por vez, na ordem
 * de chegada. A previsao de conclusao de um veiculo e, portanto, a soma do
 * tempo restante de todos os veiculos a frente dele mais o proprio tempo
 * de servico.
 */
const atendimentoRepository = require('../repositories/atendimentoRepository');
const AppError = require('../middlewares/appError');
const { calcularFila } = require('../domain/fila');
const { proximaTransicao } = require('../domain/fluxoStatus');

/** Consulta a fila e persiste mudancas de status usando regras de dominio puras. */
function criarFilaService({ atendimentos, relogio = () => new Date() }) {
  async function consultarFila() {
    const emAndamento = await atendimentos.listarEmAndamento();
    return calcularFila(emAndamento, relogio());
  }

  async function avancarStatus(id) {
    const atendimento = await atendimentos.buscarPorId(id);
    if (!atendimento) {
      throw new AppError('Atendimento nao encontrado.', 404);
    }

    const transicao = proximaTransicao(atendimento.status);
    if (!transicao) {
      throw new AppError('Este atendimento ja foi finalizado.', 409);
    }

    atendimento.status = transicao.status;
    if (transicao.horario) atendimento[transicao.horario] = relogio();

    // A futura notificacao sera assincrona e nao impedira a finalizacao.
    await atendimentos.salvar(atendimento);
    return atendimentos.buscarPorId(id);
  }

  return { consultarFila, avancarStatus };
}

const { consultarFila, avancarStatus } = criarFilaService({
  atendimentos: atendimentoRepository,
});

module.exports = { criarFilaService, consultarFila, avancarStatus };
