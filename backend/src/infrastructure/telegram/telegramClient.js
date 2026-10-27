/**
 * Telegram Bot API oficial. Contato privado precisa ter iniciado /start.
 * Nunca enviar por numero de telefone ou para um chat global.
 */
function criarTelegramClient({ token, fetchImpl = fetch }) {
  const configurado = Boolean(token);

  async function chamar(metodo, corpo) {
    if (!configurado) throw new Error('Telegram nao configurado.');
    const resposta = await fetchImpl('https://api.telegram.org/bot' + token + '/' + metodo, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
      signal: AbortSignal.timeout(8000),
    });
    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok || !dados.ok) {
      // Jamais incluir URL/token ou dados brutos de resposta no erro.
      throw new Error('Telegram recusou requisicao (HTTP ' + resposta.status + ').');
    }
    return dados.result;
  }

  return {
    configurado,
    enviar: (texto, chatId) => {
      if (!chatId) throw new Error('Chat individual do cliente nao vinculado.');
      return chamar('sendMessage', { chat_id: chatId, text: texto });
    },
    obterAtualizacoes: (offset = 0) =>
      chamar('getUpdates', { offset, timeout: 0, allowed_updates: ['message'] }),
  };
}

module.exports = { criarTelegramClient };
