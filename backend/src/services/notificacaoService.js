/**
 * Serviço de notificações do MONÓLITO. A operação de pátio não espera a API do Telegram.
 * A fila é persistida no banco e o worker é executado no mesmo processo Node.
 */
function criarNotificacaoService({ notificacoes, telegram }) {
  let emProcessamento = false;
  async function enfileirarFinalizacao(atendimento) {
    return notificacoes.enfileirar(atendimento.id);
  }

  async function processarPendentes() {
    if (!telegram.configurado || emProcessamento) return 0;
    emProcessamento = true;
    let enviados = 0;
    try {
      const pendentes = await notificacoes.listarPendentes();
      for (const item of pendentes) {
        const placa = item.atendimento?.veiculo?.placa || 'nao informada';
        const tipo = item.atendimento?.servico?.nome || 'lavagem';
        const mensagem = 'WashFlow - Aviso de atendimento\nVeiculo ' + placa +
          ' finalizado. Servico: ' + tipo + '. Pronto para retirada.';
        try {
          await telegram.enviar(mensagem);
          await notificacoes.marcarEnviado(item);
          enviados += 1;
        } catch (erro) {
          // Não armazenar o token nem dados do erro HTTP que possam contê-lo.
          await notificacoes.marcarFalha(item, erro.message);
        }
      }
      return enviados;
    } finally {
      emProcessamento = false;
    }
  }

  const listarRecentes = () => notificacoes.listarRecentes();
  return { enfileirarFinalizacao, processarPendentes, listarRecentes };
}

module.exports = { criarNotificacaoService };
