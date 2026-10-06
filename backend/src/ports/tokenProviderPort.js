/**
 * Emissao e verificacao sao capacidades separadas do mesmo adapter JWT.
 * AuthService requer somente EmissorTokenPort; o middleware usa VerificadorTokenPort.
 * @typedef {Object} EmissorTokenPort
 * @property {(payload: object) => string} emitir
 *
 * @typedef {Object} VerificadorTokenPort
 * @property {(token: string) => object} verificar
 */
