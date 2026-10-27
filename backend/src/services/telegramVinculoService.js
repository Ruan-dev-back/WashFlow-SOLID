const { randomBytes, createHash } = require('node:crypto');
const AppError = require('../domain/appError');

function criarTelegramVinculoService({ clientes, vinculos, telegram, botUsername }) {
  const username = String(botUsername || '').replace(/^@/, '');
  const usuarioValido = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(username);
  let offset = 0;
  let consultando = false;

  async function consultarStatus(clienteId) {
    const cliente = await clientes.buscarPorId(clienteId);
    if (!cliente) throw new AppError('Cliente nao encontrado.', 404);
    const vinculo = await vinculos.buscarPorCliente(cliente.id);
    return { vinculado: Boolean(vinculo?.chatId) };
  }

  async function gerarLink(clienteId) {
    if (!telegram.configurado || !usuarioValido) {
      throw new AppError('Configure TELEGRAM_BOT_TOKEN e TELEGRAM_BOT_USERNAME.', 503);
    }
    const cliente = await clientes.buscarPorId(clienteId);
    if (!cliente) throw new AppError('Cliente nao encontrado.', 404);
    const status = await consultarStatus(clienteId);
    if (status.vinculado) return { vinculado: true, url: null };
    const token = randomBytes(24).toString('base64url');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiraEm = new Date(Date.now() + 20 * 60000);
    await vinculos.solicitar(cliente.id, tokenHash, expiraEm);
    return { vinculado: false, url: 'https://t.me/' + username + '?start=' + token, expiraEm };
  }

  async function confirmarPorStart(token, chatId) {
    if (!/^[A-Za-z0-9_-]{32}$/.test(token) || !chatId) return false;
    const hash = createHash('sha256').update(token).digest('hex');
    return vinculos.confirmar(hash, String(chatId));
  }

  // Long polling curto: operado no mesmo processo do back-end monolitico.
  async function processarAtualizacoes() {
    if (!telegram.configurado || consultando) return;
    consultando = true;
    try {
      const atualizacoes = await telegram.obterAtualizacoes(offset);
      for (const atualizacao of atualizacoes) {
        offset = Math.max(offset, atualizacao.update_id + 1);
        const mensagem = atualizacao.message;
        if (mensagem?.chat?.type !== 'private') continue;
        const texto = String(mensagem.text || '');
        if (!texto.startsWith('/start')) continue;
        const codigo = texto.match(/^\/start\s+([A-Za-z0-9_-]+)\s*$/)?.[1];
        let resposta = 'Ola! Solicite o link de vinculacao no balcao do WashFlow.';
        if (codigo) {
          const ok = await confirmarPorStart(codigo, mensagem.chat.id);
          resposta = ok
            ? 'Telegram vinculado ao seu cadastro WashFlow! Voce sera avisado quando seu carro estiver pronto.'
            : 'Link invalido, expirado ou ja utilizado. Solicite um novo no balcao.';
        }
        try { await telegram.enviar(resposta, mensagem.chat.id); }
        catch (erro) { console.error('Falha ao responder /start:', erro.message); }
      }
    } finally {
      consultando = false;
    }
  }

  return { gerarLink, consultarStatus, confirmarPorStart, processarAtualizacoes };
}

module.exports = { criarTelegramVinculoService };
