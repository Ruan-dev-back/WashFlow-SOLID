/** Histórico diário e duração média real, calculados sobre atendimentos finalizados. */
function criarRelatorioService({ atendimentos }) {
  async function consultar(data) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data || '')) {
      const erro = new Error('Data invalida. Use AAAA-MM-DD.');
      erro.status = 400;
      throw erro;
    }
    // O MVP atende um lava-rápido no Brasil (America/Sao_Paulo, UTC-3).
    const inicio = new Date(data + 'T00:00:00-03:00');
    if (Number.isNaN(inicio.getTime()) || inicio.toISOString().slice(0, 10) !==
        new Date(inicio.getTime() + 3 * 3600000).toISOString().slice(0, 10)) {
      const erro = new Error('Data invalida.'); erro.status = 400; throw erro;
    }
    const fim = new Date(inicio.getTime() + 86400000);
    const atendimentosFinalizados = await atendimentos.listarFinalizadosEntre(inicio, fim);
    const historico = atendimentosFinalizados.map((a) => {
      const minutos = a.horaInicio && a.horaFim
        ? Math.max(0, Math.round((new Date(a.horaFim) - new Date(a.horaInicio)) / 60000))
        : null;
      return {
        id: a.id, placa: a.veiculo?.placa, cliente: a.veiculo?.cliente?.nome,
        servico: a.servico?.nome, horaEntrada: a.horaEntrada, horaFim: a.horaFim,
        duracaoMinutos: minutos,
      };
    });
    const duracoes = historico.map((a) => a.duracaoMinutos).filter((m) => m !== null);
    const media = duracoes.length
      ? Math.round(duracoes.reduce((total, minutos) => total + minutos, 0) / duracoes.length)
      : null;
    return {
      data, totalFinalizados: historico.length, tempoMedioMinutos: media,
      porServico: historico.reduce((contagem, item) => {
        const nome = item.servico || 'Nao informado';
        contagem[nome] = (contagem[nome] || 0) + 1;
        return contagem;
      }, {}),
      historico,
    };
  }
  return { consultar };
}
module.exports = { criarRelatorioService };
