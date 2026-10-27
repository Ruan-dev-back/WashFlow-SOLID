<script setup>
import { onMounted, ref } from 'vue';
import { consultarRelatorio, listarNotificacoes } from '../services/washflowService';

const data = ref(new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }));
const relatorio = ref(null);
const notificacoes = ref([]);
const carregando = ref(false);
const erro = ref('');

async function carregar() {
  carregando.value = true;
  erro.value = '';
  try {
    const [r, n] = await Promise.all([consultarRelatorio(data.value), listarNotificacoes()]);
    relatorio.value = r;
    notificacoes.value = n;
  } catch (e) {
    erro.value = e.message;
  } finally {
    carregando.value = false;
  }
}

onMounted(carregar);
</script>

<template>
  <section class="painel-relatorios">
    <div class="titulo-painel">
      <div>
        <p class="eyebrow">Gestao WashFlow</p>
        <h2>Relatorios e notificacoes</h2>
        <p>Acompanhe as finalizacoes e o envio de avisos pelo Telegram.</p>
      </div>
      <div class="filtros">
        <label for="data">Data de finalizacao</label>
        <input id="data" type="date" v-model="data" />
        <button class="primario" :disabled="carregando" @click="carregar">Atualizar</button>
      </div>
    </div>
    <p v-if="erro" class="aviso erro">{{ erro }}</p>
    <div v-if="relatorio" class="indicadores">
      <article class="cartao"><span>Veiculos finalizados</span><strong>{{ relatorio.totalFinalizados }}</strong></article>
      <article class="cartao"><span>Duracao media real</span><strong>{{ relatorio.tempoMedioMinutos ?? '—' }} min</strong></article>
      <article class="cartao"><span>Avisos pendentes ou falhos</span><strong>{{ notificacoes.filter(n => n.status !== 'ENVIADO').length }}</strong></article>
    </div>
    <div class="cartao">
      <h3>Historico de atendimentos finalizados</h3>
      <table>
        <thead><tr><th>Placa</th><th>Cliente</th><th>Servico</th><th>Duracao</th><th>Finalizacao</th></tr></thead>
        <tbody>
          <tr v-for="item in relatorio?.historico || []" :key="item.id">
            <td>{{ item.placa }}</td><td>{{ item.cliente }}</td><td>{{ item.servico }}</td>
            <td>{{ item.duracaoMinutos ?? '—' }} min</td>
            <td>{{ new Date(item.horaFim).toLocaleString('pt-BR') }}</td>
          </tr>
          <tr v-if="!relatorio?.historico?.length"><td colspan="5">Nenhuma finalizacao nessa data.</td></tr>
        </tbody>
      </table>
    </div>
    <div class="cartao">
      <h3>Notificacoes Telegram</h3>
      <p class="explicacao">O envio acontece em segundo plano. Sem bot configurado, o aviso continua pendente.</p>
      <table>
        <thead><tr><th>Atendimento</th><th>Status</th><th>Tentativas</th><th>Enviado em</th></tr></thead>
        <tbody>
          <tr v-for="item in notificacoes" :key="item.id">
            <td>#{{ item.atendimentoId }}</td>
            <td><span class="etiqueta" :class="item.status">{{ item.status }}</span></td>
            <td>{{ item.tentativas }}</td>
            <td>{{ item.enviadoEm ? new Date(item.enviadoEm).toLocaleString('pt-BR') : '—' }}</td>
          </tr>
          <tr v-if="!notificacoes.length"><td colspan="4">Nenhuma notificacao registrada.</td></tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.painel-relatorios { display:grid;gap:22px }
.titulo-painel { display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap }
.titulo-painel h2 { margin:4px 0;font-size:1.7rem;color:#0d325a }
.titulo-painel p {color:#66768a}
.eyebrow {text-transform:uppercase;letter-spacing:.12em;font-weight:800;font-size:.74rem}
.filtros {display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.filtros input {border:1px solid #d8dee7;padding:9px;border-radius:8px}
.indicadores {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.indicadores .cartao {display:flex;flex-direction:column;gap:12px}
.indicadores strong {font-size:2rem;color:#1168bd}
h3 {margin:0 0 16px}
.cartao {overflow-x:auto}
.explicacao {color:#66768a;font-size:.86rem}
.etiqueta.ENVIADO {background:#dcfce7;color:#166534}
.etiqueta.PENDENTE {background:#fef3c7;color:#92400e}
.etiqueta.FALHOU {background:#fee2e2;color:#991b1b}
@media(max-width:720px){.indicadores{grid-template-columns:1fr}}
</style>