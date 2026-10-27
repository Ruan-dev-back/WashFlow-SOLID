/**
 * Camada de Apresentacao (MVC: Controller) -- autenticacao.
 *
 * O controller so traduz HTTP <-> servico. Nenhuma regra de negocio aqui.
 */
function criarAuthController(authService) {
  async function login(req, res) {
    const { login: usuarioLogin, senha } = req.body;
    const resultado = await authService.autenticar(usuarioLogin, senha);

    return res.json({
      sucesso: true,
      mensagem: 'Autenticado com sucesso.',
      dados: resultado,
    });
  }

  return { login };
}

module.exports = { criarAuthController };
