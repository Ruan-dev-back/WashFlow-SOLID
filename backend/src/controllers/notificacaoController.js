function criarNotificacaoController(notificacaoService) {
  return {
    listar: async (_req, res) =>
      res.json({ sucesso: true, dados: await notificacaoService.listarRecentes() }),
  };
}
module.exports = { criarNotificacaoController };
