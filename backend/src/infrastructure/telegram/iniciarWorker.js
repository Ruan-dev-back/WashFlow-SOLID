/** Worker simples no mesmo processo do monolito: reprocessa pendências sem bloquear HTTP. */
function iniciarWorker(notificacaoService, intervaloMs = 15000) {
  const executar = () => {
    notificacaoService.processarPendentes().catch((erro) =>
      console.error('Erro ao processar notificacoes pendentes:', erro.message)
    );
  };
  executar();
  const temporizador = setInterval(executar, intervaloMs);
  temporizador.unref?.();
  return () => clearInterval(temporizador);
}

module.exports = { iniciarWorker };
