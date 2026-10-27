<!--
  Raiz da Interface Web (container Vue.js do C4 Nivel 2).
  Exibe a barra de navegacao apenas quando ha sessao ativa.
-->
<script setup>
import { computed, ref, watch } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { obterUsuario } from './services/api';
import { sair } from './services/washflowService';

const route = useRoute();
const router = useRouter();

const usuario = ref(obterUsuario());

// A sessao muda ao entrar e ao sair; reler a cada navegacao mantem a
// barra de navegacao coerente sem precisar de um store global.
watch(() => route.fullPath, () => {
  usuario.value = obterUsuario();
});

const mostrarBarra = computed(() => Boolean(usuario.value) && route.name !== 'login');

function encerrar() {
  sair();
  usuario.value = null;
  router.push({ name: 'login' });
}
</script>

<template>
  <header v-if="mostrarBarra" class="topo">
    <h1>WashFlow</h1>
    <RouterLink :to="{ name: 'recepcao' }" active-class="ativo">Recepcao</RouterLink>
    <RouterLink :to="{ name: 'fila' }" active-class="ativo">Fila</RouterLink>
    <RouterLink v-if="usuario?.perfil === 'GERENTE'" :to="{ name: 'relatorios' }" active-class="ativo">Relatorios</RouterLink>
    <span style="font-size: 0.85rem">
      {{ usuario.nome }} ({{ usuario.perfil }})
    </span>
    <button @click="encerrar">Sair</button>
  </header>

  <main :class="mostrarBarra ? 'conteudo' : ''">
    <RouterView />
  </main>
</template>
