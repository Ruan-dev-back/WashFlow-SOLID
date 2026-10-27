/**
 * @typedef {Object} VeiculoEntradaPort
 * @property {(placa: string) => Promise<object|null>} buscarPorPlaca
 * @property {(dados: object) => Promise<object>} criar
 *
 * @typedef {VeiculoEntradaPort & {listar: () => Promise<object[]>}} VeiculoCadastroPort
 */
