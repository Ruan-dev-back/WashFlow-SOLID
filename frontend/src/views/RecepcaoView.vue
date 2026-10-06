<!--
  Tela de Recepcao -- Modulo de Atendimento.

  Cadastro rapido de entrada: um unico formulario resolve cliente, veiculo
  e tipo de lavagem, para o recepcionista nao segurar a fila fisica de
  carros na rua (RNF05 - Usabilidade).
-->
<script setup>
import { onMounted, reactive, ref } from 'vue';
import { listarServicos, registrarEntrada } from '../services/washflowService';

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

  try {
    const atendimento = await registrarEntrada({
      ...form,
      servicoId: Number(form.servicoId),
    });
    const previsao = atendimento.posicao == null
      ? ''
      : ` Posicao ${atendimento.posicao}, previsao de conclusao em ~${atendimento.tempoEsperaEstimadoMinutos} min.`;
    sucesso.value = `${atendimento.veiculo.placa} entrou na fila para ${atendimento.servico.nome}.${previsao}`;
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
  </form>
</template>
