/**
 * Camada de Apresentacao (MVC: Controller) -- cadastros de apoio.
 */
const ok = (res, dados) => res.json({ sucesso: true, dados });
const criado = (res, dados, mensagem) =>
  res.status(201).json({ sucesso: true, mensagem, dados });

function criarCadastroController({ clienteService, veiculoService, servicoService }) {
  return {
    listarClientes: async (req, res) => ok(res, await clienteService.listarClientes()),
    criarCliente: async (req, res) =>
      criado(res, await clienteService.criarCliente(req.body), 'Cliente cadastrado.'),
    listarVeiculos: async (req, res) => ok(res, await veiculoService.listarVeiculos()),
    criarVeiculo: async (req, res) =>
      criado(res, await veiculoService.criarVeiculo(req.body), 'Veiculo cadastrado.'),
    listarServicos: async (req, res) => ok(res, await servicoService.listarServicos()),
    criarServico: async (req, res) =>
      criado(res, await servicoService.criarServico(req.body), 'Servico cadastrado.'),
  };
}

module.exports = { criarCadastroController };
