const { STATUS_ATENDIMENTO } = require('../config/constants');

const TRANSICOES_PADRAO = Object.freeze([
  { de: STATUS_ATENDIMENTO.AGUARDANDO, para: STATUS_ATENDIMENTO.EM_LAVAGEM, horario: 'horaInicio' },
  { de: STATUS_ATENDIMENTO.EM_LAVAGEM, para: STATUS_ATENDIMENTO.SECAGEM },
  { de: STATUS_ATENDIMENTO.SECAGEM, para: STATUS_ATENDIMENTO.FINALIZADO, horario: 'horaFim' },
]);

// Outra politica pode ser criada e injetada sem mudar FilaService.
function criarFluxoStatus(transicoes = TRANSICOES_PADRAO) {
  const porOrigem = new Map(transicoes.map(({ de, para, horario }) => [
    de,
    horario ? { status: para, horario } : { status: para },
  ]));
  return {
    proximaTransicao: (status) => porOrigem.get(status) || null,
  };
}

module.exports = { criarFluxoStatus, fluxoStatusPadrao: criarFluxoStatus() };
