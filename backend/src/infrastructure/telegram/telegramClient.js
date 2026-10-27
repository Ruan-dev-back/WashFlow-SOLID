/**
 * Adaptador da Bot API oficial do Telegram. O token nunca deve ser logado.
 * O chat de demonstração precisa ter iniciado o bot ou adicionado o bot ao grupo.
 */
function criarTelegramClient({ token, chatId, fetchImpl = fetch }) {
  const configurado = Boolean(token && chatId);
  return {
    configurado,
    async enviar(texto) {
      if (!configurado) throw new Error('Telegram nao configurado.');
      const resposta = await fetchImpl('https://api.telegram.org/bot' + token + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: texto }),
        signal: AbortSignal.timeout(8000),
      });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok || !dados.ok) {
        throw new Error('Telegram recusou envio (HTTP ' + resposta.status + ').');
      }
      return dados.result;
    },
  };
}

module.exports = { criarTelegramClient };
