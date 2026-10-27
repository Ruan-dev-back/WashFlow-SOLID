<!--
  Tela de Recepcao -- Modulo de Atendimento.

  Cadastro rapido de entrada: um unico formulario resolve cliente, veiculo
  e tipo de lavagem, para o recepcionista nao segurar a fila fisica de
  carros na rua (RNF05 - Usabilidade).
-->
<script setup>
import { onMounted, reactive, ref } from 'vue';
import { listarServicos, registrarEntrada, consultarStatusTelegram, gerarLinkTelegram } from '../services/washflowService';

const FORMULARIO_VAZIO = {
  placa: '',
  modelo: '',
  cor: '',
  nomeCliente: '',
  telefone: '',
  servicoId: '',
};

const servicos = ref([]);
const form = reactive({ ...FORMULARIO_VAZIO });
const erro = ref('');
const sucesso = ref('');
const enviando = ref(false);
const clienteTelegramId = ref(null);
const telegramVinculado = ref(false);
const telegramUrl = ref('');
const avisoTelegram = ref('');
const gerandoLink = ref(false);

async function atualizarStatusTelegram() {
  if (!clienteTelegramId.value) return;
  try {
    const dados = await consultarStatusTelegram(clienteTelegramId.value);
    telegramVinculado.value = dados.vinculado;
    if (dados.vinculado) {
      telegramUrl.value = '';
      avisoTelegram.value = 'Telegram vinculado com sucesso!';
    }
  } catch (e) {
    avisoTelegram.value = e.message;
  }
}

async function vincularTelegram() {
  if (!clienteTelegramId.value) return;
  gerandoLink.value = true;
  avisoTelegram.value = '';
  try {
    const dados = await gerarLinkTelegram(clienteTelegramId.value);
    telegramVinculado.value = dados.vinculado;
    telegramUrl.value = dados.url || '';
    avisoTelegram.value = dados.vinculado
      ? 'Este cliente ja tem Telegram vinculado.'
      : 'O cliente deve abrir o link no proprio Telegram e tocar em Iniciar.';
  } catch (e) {
    avisoTelegram.value = e.message;
  } finally {
    gerandoLink.value = false;
  }
}

async function copiarLink() {
  try {
    await navigator.clipboard.writeText(telegramUrl.value);
    avisoTelegram.value = 'Link copiado. Compartilhe com o cliente.';
  } catch {
    avisoTelegram.value = 'Copie o endereco do link manualmente.';
  }
}


onMounted(async () => {
  try {
    servicos.value = await listarServicos();
  } catch (e) {
    erro.value = e.message;
  }
});

async function submeter() {
  erro.value = '';
  sucesso.value = '';
  enviando.value = true;
  clienteTelegramId.value = null;
  telegramUrl.value = '';
  telegramVinculado.value = false;
  avisoTelegram.value = '';

  try {
    const atendimento = await registrarEntrada({
      ...form,
      servicoId: Number(form.servicoId),
    });
    const previsao = atendimento.posicao == null
      ? ''
      : ` Posicao ${atendimento.posicao}, previsao de conclusao em ~${atendimento.tempoEsperaEstimadoMinutos} min.`;
    sucesso.value = `${atendimento.veiculo.placa} entrou na fila para ${atendimento.servico.nome}.${previsao}`;
    clienteTelegramId.value = atendimento.veiculo?.cliente?.id || null;
    if (clienteTelegramId.value) await atualizarStatusTelegram();
    Object.assign(form, FORMULARIO_VAZIO);
  } catch (e) {
    erro.value = e.message;
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <form class="cartao" @submit.prevent="submeter">
    <h2>Entrada de veiculo</h2>

    <p v-if="erro" class="aviso erro">{{ erro }}</p>
    <p v-if="sucesso" class="aviso sucesso">{{ sucesso }}</p>

    <div class="linha">
      <div class="campo">
        <label for="placa">Placa</label>
        <input id="placa" v-model="form.placa" placeholder="ABC1234" required />
      </div>

      <div class="campo">
        <label for="modelo">Modelo</label>
        <input id="modelo" v-model="form.modelo" placeholder="VW Gol" required />
      </div>
    </div>

    <div class="linha">
      <div class="campo">
        <label for="cor">Cor</label>
        <input id="cor" v-model="form.cor" />
      </div>

      <div class="campo">
        <label for="nomeCliente">Cliente</label>
        <input id="nomeCliente" v-model="form.nomeCliente" required />
      </div>
    </div>

    <div class="linha">
      <div class="campo">
        <label for="telefone">Telefone</label>
        <input id="telefone" v-model="form.telefone" placeholder="11988887777" required />
      </div>

      <div class="campo">
        <label for="servicoId">Tipo de lavagem</label>
        <select id="servicoId" v-model="form.servicoId" required>
          <option value="">Selecione...</option>
          <option v-for="servico in servicos" :key="servico.id" :value="servico.id">
            {{ servico.nome }} ({{ servico.duracaoEstimadaMinutos }} min)
          </option>
        </select>
      </div>
    </div>

    <button class="primario" type="submit" :disabled="enviando">
      {{ enviando ? 'Registrando...' : 'Registrar entrada' }}
    </button>
    <div v-if="clienteTelegramId" class="telegram-box">
      <h3>Telegram do cliente</h3>
      <p>O telefone fica no cadastro, mas o Telegram exige uma vinculacao unica pelo proprio cliente.</p>
      <p v-if="telegramVinculado" class="telegram-ok">✓ Telegram vinculado. Ao finalizar a lavagem, o aviso sera enviado para esse cliente.</p>
      <template v-else>
        <button type="button" class="telegram-botao" :disabled="gerandoLink" @click="vincularTelegram">
          {{ gerandoLink ? 'Gerando link...' : 'Gerar link de vinculacao' }}
        </button>
        <div v-if="telegramUrl" class="telegram-link">
          <a :href="telegramUrl" target="_blank" rel="noopener noreferrer">Abrir Telegram para vincular</a>
          <button type="button" @click="copiarLink">Copiar link</button>
        </div>
        <button type="button" class="telegram-atualizar" @click="atualizarStatusTelegram">
          Verificar se cliente vinculou
        </button>
      </template>
      <p v-if="avisoTelegram" class="telegram-aviso">{{ avisoTelegram }}</p>
    </div>
  </form>
</template>

<style scoped>
.telegram-box { margin-top:22px;border:1px solid #b8d5fa;background:#f0f7ff;padding:18px;border-radius:12px }
.telegram-box h3 { margin:0 0 8px;color:#124a87 }
.telegram-box p { color:#465a6e;font-size:.9rem }
.telegram-botao { background:#0c75c9;color:white;border:0;padding:11px 16px;border-radius:8px;cursor:pointer }
.telegram-link { margin-top:12px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;overflow-wrap:anywhere }
.telegram-link a { font-weight:700;color:#0c65ae }
.telegram-link button,.telegram-atualizar { background:white;border:1px solid #88b5d5;color:#135c8f;padding:8px 12px;border-radius:8px;cursor:pointer }
.telegram-atualizar { margin-top:14px }
.telegram-ok { color:#166534!important;font-weight:700 }
.telegram-aviso { margin-bottom:0 }
</style>
