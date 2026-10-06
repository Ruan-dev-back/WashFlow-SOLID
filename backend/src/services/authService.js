/**
 * Camada de Negocio -- autenticacao (RNF04 - Seguranca).
 */
const AppError = require('../domain/appError');
const { paraUsuarioDTO } = require('../dtos/usuarioDTO');

/**
 * @param {{usuarios: import('../ports/usuarioRepositoryPort').UsuarioRepositoryPort,
 * passwordHasher: import('../ports/passwordHasherPort').ComparadorSenhaPort,
 * tokenProvider: import('../ports/tokenProviderPort').EmissorTokenPort}} deps
 */
function criarAuthService({ usuarios, passwordHasher, tokenProvider }) {
  async function autenticar(login, senha) {
    const usuario = await usuarios.buscarPorLogin(login);

    // Nao revela se o login existe.
    const credenciaisInvalidas = new AppError('Login ou senha invalidos.', 401);

    if (!usuario || !usuario.ativo) {
      throw credenciaisInvalidas;
    }

    const senhaConfere = await passwordHasher.comparar(senha, usuario.senhaHash);
    if (!senhaConfere) {
      throw credenciaisInvalidas;
    }

    const token = tokenProvider.emitir({
      id: usuario.id, login: usuario.login, perfil: usuario.perfil,
    });

    return { token, usuario: paraUsuarioDTO(usuario) };
  }

  return { autenticar };
}

module.exports = { criarAuthService };
