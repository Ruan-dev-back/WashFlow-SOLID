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
    return {
      atendimento,
      posicao: indice + 1,
      tempoEsperaEstimadoMinutos: acumulado,
    };
  });
}

module.exports = { calcularFila, minutosRestantes };
