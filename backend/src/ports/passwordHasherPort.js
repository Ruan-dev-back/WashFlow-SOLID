/**
 * AuthService depende apenas da comparacao; o seed usa a geracao do hash.
 * Nenhum fake de AuthService precisa implementar gerarHash.
 * @typedef {Object} ComparadorSenhaPort
 * @property {(senha: string, hash: string) => Promise<boolean>} comparar
 *
 * @typedef {Object} GeradorHashSenhaPort
 * @property {(senha: string) => Promise<string>} gerarHash
 */
