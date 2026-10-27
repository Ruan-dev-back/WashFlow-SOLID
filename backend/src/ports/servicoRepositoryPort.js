/**
 * @typedef {Object} ServicoEntradaPort
 * @property {(id: number) => Promise<object|null>} buscarPorId
 *
 * @typedef {Object} ServicoCadastroPort
 * @property {() => Promise<object[]>} listar
 * @property {() => Promise<object[]>} listarTodos
 * @property {(id: number) => Promise<object|null>} buscarPorId
 * @property {(nome: string) => Promise<object|null>} buscarPorNome
 * @property {(dados: object) => Promise<object>} criar
 * @property {(servico: object, dados: object) => Promise<object>} atualizar
 */
