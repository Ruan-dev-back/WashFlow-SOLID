const { paraItemFilaDTO } = require('../dtos/filaDTO');

function minutosRestantes(atendimento, agora) {
  const duracao = atendimento.servico.duracaoEstimadaMinutos;
  if (!atendimento.horaInicio) return duracao;

  const decorridos = Math.floor((agora - new Date(atendimento.horaInicio)) / 60000);
  return Math.max(duracao - decorridos, 0);
}

// Recebe atendimentos ja ordenados pela hora de entrada. Nao consulta o banco.
function calcularFila(atendimentos, agora) {
  let acumulado = 0;
  return atendimentos.map((atendimento, indice) => {
    acumulado += minutosRestantes(atendimento, agora);
    return paraItemFilaDTO(atendimento, indice + 1, acumulado);
  });
}

module.exports = { calcularFila, minutosRestantes };
