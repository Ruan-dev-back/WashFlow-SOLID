const { STATUS_ATENDIMENTO, FLUXO_STATUS } = require('../config/constants');

const HORARIOS = Object.freeze({
  [STATUS_ATENDIMENTO.EM_LAVAGEM]: 'horaInicio',
  [STATUS_ATENDIMENTO.FINALIZADO]: 'horaFim',
});

function proximaTransicao(status) {
  const indice = FLUXO_STATUS.indexOf(status);
  const proximo = FLUXO_STATUS[indice + 1];
  if (indice < 0 || !proximo) return null;
  return HORARIOS[proximo]
    ? { status: proximo, horario: HORARIOS[proximo] }
    : { status: proximo };
}

module.exports = { proximaTransicao };
