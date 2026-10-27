/** Composition Root: unica montagem das implementacoes concretas da API. */
const clienteRepository = require('./repositories/clienteRepository');
const veiculoRepository = require('./repositories/veiculoRepository');
const servicoRepository = require('./repositories/servicoRepository');
const atendimentoRepository = require('./repositories/atendimentoRepository');
const notificacaoRepository = require('./repositories/notificacaoRepository');
const { criarTelegramClient } = require('./infrastructure/telegram/telegramClient');
const { criarNotificacaoService } = require('./services/notificacaoService');
const { criarRelatorioService } = require('./services/relatorioService');
const { criarRelatorioController } = require('./controllers/relatorioController');
const { criarNotificacaoController } = require('./controllers/notificacaoController');
const usuarioRepository = require('./repositories/usuarioRepository');

const { criarBcryptPasswordHasher } = require('./infrastructure/security/bcryptPasswordHasher');
const { criarJwtTokenProvider } = require('./infrastructure/security/jwtTokenProvider');
const { fluxoStatusPadrao } = require('./domain/fluxoStatus');
const { criarAuthService } = require('./services/authService');
const { criarAtendimentoService } = require('./services/atendimentoService');
const { criarFilaService } = require('./services/filaService');
const { criarClienteService } = require('./services/clienteService');
const { criarVeiculoService } = require('./services/veiculoService');
const { criarServicoService } = require('./services/servicoService');
const { criarAuthController } = require('./controllers/authController');
const { criarAtendimentoController } = require('./controllers/atendimentoController');
const { criarFilaController } = require('./controllers/filaController');
const { criarCadastroController } = require('./controllers/cadastroController');
const { criarAutenticar } = require('./middlewares/auth');

const passwordHasher = criarBcryptPasswordHasher();
const tokenProvider = criarJwtTokenProvider({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '8h',
});

const telegram = criarTelegramClient({
  token: process.env.TELEGRAM_BOT_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID,
});
const notificacoes = criarNotificacaoService({
  notificacoes: notificacaoRepository, telegram,
});
const relatorio = criarRelatorioService({ atendimentos: atendimentoRepository });

const fila = criarFilaService({
  atendimentos: atendimentoRepository,
  fluxoStatus: fluxoStatusPadrao,
  notificacoes,
});

const services = {
  auth: criarAuthService({
    usuarios: usuarioRepository,
    passwordHasher,
    tokenProvider,
  }),
  atendimento: criarAtendimentoService({
    clientes: clienteRepository,
    veiculos: veiculoRepository,
    servicos: servicoRepository,
    atendimentos: atendimentoRepository,
    fila,
  }),
  fila,
  notificacoes,
  relatorio,
  cliente: criarClienteService({ clientes: clienteRepository }),
  veiculo: criarVeiculoService({ clientes: clienteRepository, veiculos: veiculoRepository }),
  servico: criarServicoService({ servicos: servicoRepository }),
};

const controllers = {
  auth: criarAuthController(services.auth),
  atendimento: criarAtendimentoController(services.atendimento),
  fila: criarFilaController(services.fila),
  relatorio: criarRelatorioController(services.relatorio),
  notificacao: criarNotificacaoController(services.notificacoes),
  cadastro: criarCadastroController({
    clienteService: services.cliente,
    veiculoService: services.veiculo,
    servicoService: services.servico,
  }),
};

module.exports = {
  services,
  controllers,
  autenticar: criarAutenticar({ tokenProvider }),
  passwordHasher,
};
