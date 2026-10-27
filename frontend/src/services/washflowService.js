/**
 * Traduz as telas para os endpoints da API.
 * Cada funcao devolve ja o conteudo util, sem o envelope da resposta.
 */
import { api, guardarSessao, limparSessao } from './api';

export async function entrar(login, senha) {
  const { dados } = await api.post('/auth/login', { login, senha });
  guardarSessao(dados.token, dados.usuario);
  return dados.usuario;
}

export function sair() {
  limparSessao();
}

export async function listarServicos() {
  const { dados } = await api.get('/servicos');
  return dados;
}

export async function registrarEntrada(dadosEntrada) {
  const { dados } = await api.post('/atendimentos', dadosEntrada);
  return dados;
}

export async function consultarFila() {
  const { dados } = await api.get('/fila');
  return dados;
}

export async function avancarStatus(id) {
  const { dados } = await api.patch(`/atendimentos/${id}/status`);
  return dados;
}

export async function consultarRelatorio(data) {
  const { dados } = await api.get('/relatorios?data=' + encodeURIComponent(data));
  return dados;
}

export async function listarNotificacoes() {
  const { dados } = await api.get('/notificacoes');
  return dados;
}
