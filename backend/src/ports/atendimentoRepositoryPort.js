/**
 * @typedef {Object} AtendimentoEntradaPort
 * @property {(id: number) => Promise<object|null>} buscarPorId
 * @property {(veiculoId: number) => Promise<object|null>} buscarEmAndamentoPorVeiculo
 * @property {(dados: object) => Promise<object>} criar
 *
 * @typedef {Object} AtendimentoFilaPort
 * @property {() => Promise<object[]>} listarEmAndamento
 * @property {(id: number) => Promise<object|null>} buscarPorId
 * @property {(atendimento: object) => Promise<object>} salvar
 */
