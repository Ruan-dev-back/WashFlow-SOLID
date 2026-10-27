/**
 * Autenticacao precisa somente de consulta por login.
 * @typedef {Object} UsuarioRepositoryPort
 * @property {(login: string) => Promise<object|null>} buscarPorLogin
 */
