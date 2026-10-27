/**
 * Ponto unico de comunicacao com a API.
 * Nenhuma tela chama fetch diretamente -- assim a View nao conhece a URL
 * da API nem o formato do envelope de resposta.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const CHAVE_TOKEN = 'washflow.token';
const CHAVE_USUARIO = 'washflow.usuario';

export const obterToken = () => localStorage.getItem(CHAVE_TOKEN);

export const obterUsuario = () => {
  const bruto = localStorage.getItem(CHAVE_USUARIO);
  return bruto ? JSON.parse(bruto) : null;
};

export const guardarSessao = (token, usuario) => {
  localStorage.setItem(CHAVE_TOKEN, token);
  localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
};

export const limparSessao = () => {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_USUARIO);
};

async function requisitar(caminho, { method = 'GET', body } = {}) {
  const token = obterToken();

  const resposta = await fetch(`${API_URL}${caminho}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const conteudo = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    // Token expirado: derruba a sessao para a aplicacao voltar ao login.
    if (resposta.status === 401) {
      limparSessao();
    }
    throw new Error(conteudo.mensagem || 'Falha na comunicacao com a API.');
  }

  return conteudo;
}

export const api = {
  get: (caminho) => requisitar(caminho),
  post: (caminho, body) => requisitar(caminho, { method: 'POST', body }),
  patch: (caminho, body) => requisitar(caminho, { method: 'PATCH', body }),
};
