/**
 * Camada de Apresentacao (MVC: Controller) -- Modulo de Gestao de Fila.
 */
function criarFilaController(filaService) {
  async function consultarFila(req, res) {
    const fila = await filaService.consultarFila();

    return res.json({
      sucesso: true,
      mensagem: 'Fila atual do patio.',
      dados: fila,
    });
  }

  async function avancarStatus(req, res) {
    const atendimento = await filaService.avancarStatus(req.params.id);

    return res.json({
      sucesso: true,
      mensagem: `Status atualizado para ${atendimento.status}.`,
      dados: atendimento,
    });
  }

  return { consultarFila, avancarStatus };
}

module.exports = { criarFilaController };
