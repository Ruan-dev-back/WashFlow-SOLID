/**
 * Rotas da Interface Web.
 *
 * O guard global e a porta de entrada do front: nenhuma tela de operacao
 * e alcancavel sem sessao, nem digitando a URL na mao (RNF04 - Seguranca).
 * A decisao final continua sendo do back-end, que exige o token em toda
 * rota protegida -- o guard existe para experiencia do usuario.
 */
import { createRouter, createWebHistory } from 'vue-router';
import { obterToken, obterUsuario } from '../services/api';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/recepcao',
    name: 'recepcao',
    component: () => import('../views/RecepcaoView.vue'),
    meta: { exigeAutenticacao: true },
  },
  {
    path: '/fila',
    name: 'fila',
    component: () => import('../views/FilaView.vue'),
    meta: { exigeAutenticacao: true },
  },
  {
    path: '/relatorios',
    name: 'relatorios',
    component: () => import('../views/RelatoriosView.vue'),
    meta: { exigeAutenticacao: true, exigeGerente: true },
  },
  {
    path: '/admin/servicos',
    name: 'admin-servicos',
    component: () => import('../views/AdminServicosView.vue'),
    meta: { exigeAutenticacao: true, exigeGerente: true },
  },
  { path: '/:pathMatch(.*)*', redirect: { name: 'fila' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const autenticado = Boolean(obterToken());

  if (to.meta.exigeAutenticacao && !autenticado) {
    return { name: 'login' };
  }

  if (to.meta.exigeGerente && obterUsuario()?.perfil !== 'GERENTE') {
    return { name: 'fila' };
  }
  // Quem ja entrou nao precisa ver a tela de login de novo.
  if (to.name === 'login' && autenticado) {
    return { name: obterUsuario()?.perfil === 'GERENTE' ? 'admin-servicos' : 'fila' };
  }

  return true;
});

export default router;
