/**
 * @typedef {Object} ServicoEntradaPort
 * @property {(id: number) => Promise<object|null>} buscarPorId
 *
 * @typedef {Object} ServicoCadastroPort
 * @property {() => Promise<object[]>} listar
 * @property {(nome: string) => Promise<object|null>} buscarPorNome
 * @property {(dados: object) => Promise<object>} criar
 */
