function criarTelegramVinculoController(service) {
  return {
    gerarLink: async (req, res) => {
      const dados = await service.gerarLink(req.params.id);
      return res.json({ sucesso: true, dados });
    },
    status: async (req, res) => {
      const dados = await service.consultarStatus(req.params.id);
      return res.json({ sucesso: true, dados });
    },
  };
}
module.exports = { criarTelegramVinculoController };
