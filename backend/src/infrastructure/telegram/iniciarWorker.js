/**
 * Worker e receptor de /start no mesmo processo do monolito.
 * Para o MVP, executar uma unica instancia; getUpdates nao pode coexistir com webhook.
 */
function iniciarWorker({ notificacoes, telegramVinculo }, intervaloMs = 5000) {
  const executar = () => {
    telegramVinculo.processarAtualizacoes().catch((e) =>
      console.error('Falha ao ler Telegram /start:', e.message));
    notificacoes.processarPendentes().catch((e) =>
      console.error('Falha ao enviar notificacoes:', e.message));
  };
  executar();
  const temporizador = setInterval(executar, intervaloMs);
  temporizador.unref?.();
  return () => clearInterval(temporizador);
}

module.exports = { iniciarWorker };
