/**
 * Cada caso de uso recebe somente as capacidades de que precisa.
 * @typedef {Object} ClienteEntradaPort
 * @property {(telefone: string) => Promise<object|null>} buscarPorTelefone
 * @property {(dados: object) => Promise<object>} criar
 *
 * @typedef {ClienteEntradaPort & {listar: () => Promise<object[]>}} ClienteCadastroPort
 * @typedef {{buscarPorId: (id: number) => Promise<object|null>}} ClienteConsultaPort
 */
