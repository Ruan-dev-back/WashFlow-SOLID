/**
 * Camada de Negocio -- Modulo de Gestao de Fila.
 *
 * Coordena a consulta aos atendimentos e aplica a regra pura de domain/fila.
 *
 * Premissa operacional: o lava-rapido atende um veiculo por vez, na ordem
 * de chegada. A previsao de conclusao de um veiculo e, portanto, a soma do
 * tempo restante de todos os veiculos a frente dele mais o proprio tempo
 * de servico.
 */
const AppError = require('../domain/appError');
const { calcularFila } = require('../domain/fila');
const { paraItemFilaDTO } = require('../dtos/filaDTO');

/**
 * Consulta a fila e persiste mudancas de status usando regras de dominio puras.
 * @param {{atendimentos: import('../ports/atendimentoRepositoryPort').AtendimentoFilaPort,
 * fluxoStatus: import('../ports/fluxoStatusPort').FluxoStatusPort,
 * relogio?: () => Date}} deps */
function criarFilaService({ atendimentos, fluxoStatus, notificacoes, relogio = () => new Date() }) {
  async function consultarFila() {
    const emAndamento = await atendimentos.listarEmAndamento();
    return calcularFila(emAndamento, relogio()).map((item) =>
      paraItemFilaDTO(item.atendimento, item.posicao, item.tempoEsperaEstimadoMinutos)
    );
  }

  async function avancarStatus(id) {
    const atendimento = await atendimentos.buscarPorId(id);
    if (!atendimento) {
      throw new AppError('Atendimento nao encontrado.', 404);
    }

    const transicao = fluxoStatus.proximaTransicao(atendimento.status);
    if (!transicao) {
      throw new AppError('Este atendimento ja foi finalizado.', 409);
    }

    atendimento.status = transicao.status;
    if (transicao.horario) atendimento[transicao.horario] = relogio();

    // A notificacao e persistida em fila, sem chamada HTTP ao Telegram neste fluxo.
    await atendimentos.salvar(atendimento);
    const atualizado = await atendimentos.buscarPorId(id);
    if (transicao.status === 'FINALIZADO' && notificacoes) {
      try {
        // Persistir na fila de notificações, nunca aguardar HTTP do Telegram.
        await notificacoes.enfileirarFinalizacao(atualizado);
      } catch (erro) {
        // Uma falha secundária não desfaz a finalização do carro.
        console.error('Nao foi possivel enfileirar aviso do atendimento:', id, erro.message);
      }
    }
    return atualizado;
  }

  return { consultarFila, avancarStatus };
}

module.exports = { criarFilaService };
