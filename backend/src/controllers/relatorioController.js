function criarRelatorioController(relatorioService) {
  return {
    consultar: async (req, res) => {
      const data = req.query.data || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
      res.json({ sucesso: true, dados: await relatorioService.consultar(data) });
    },
  };
}
module.exports = { criarRelatorioController };
