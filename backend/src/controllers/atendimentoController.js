/**
 * Camada de Apresentacao (MVC: Controller) -- Modulo de Atendimento.
 */
function criarAtendimentoController(atendimentoService) {
  async function registrarEntrada(req, res) {
    const atendimento = await atendimentoService.registrarEntrada(
      req.body,
      req.usuario.id
    );

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Entrada registrada. Veiculo adicionado a fila.',
      dados: atendimento,
    });
  }

  return { registrarEntrada };
}

module.exports = { criarAtendimentoController };
