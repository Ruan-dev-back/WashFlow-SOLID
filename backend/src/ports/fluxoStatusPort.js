/**
 * Politica substituivel de transicao de status.
 * @typedef {Object} FluxoStatusPort
 * @property {(status: string) => ({status: string, horario?: string}|null)} proximaTransicao
 */
