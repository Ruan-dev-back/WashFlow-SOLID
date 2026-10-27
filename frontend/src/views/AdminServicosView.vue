<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { listarTodosServicos, criarTipoLavagem, atualizarTipoLavagem } from '../services/washflowService';

const servicos = ref([]);
const carregando = ref(true);
const salvando = ref(false);
const alternando = ref(null);
const erro = ref('');
const sucesso = ref('');
const form = reactive({ id: null, nome: '', preco: '', duracaoEstimadaMinutos: '' });
const editando = computed(() => form.id !== null);
const totalAtivos = computed(() => servicos.value.filter((s) => s.ativo).length);
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

async function carregar() {
  carregando.value = true;
  erro.value = '';
  try {
    servicos.value = await listarTodosServicos();
  } catch (e) {
    erro.value = e.message;
  } finally {
    carregando.value = false;
  }
}

function limpar() {
  Object.assign(form, { id: null, nome: '', preco: '', duracaoEstimadaMinutos: '' });
}

function editar(servico) {
  erro.value = '';
  sucesso.value = '';
  Object.assign(form, {
    id: servico.id,
    nome: servico.nome,
    preco: Number(servico.preco),
    duracaoEstimadaMinutos: Number(servico.duracaoEstimadaMinutos),
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function salvar() {
  erro.value = '';
  sucesso.value = '';
  const dados = {
    nome: form.nome.trim(),
    preco: Number(form.preco),
    duracaoEstimadaMinutos: Number(form.duracaoEstimadaMinutos),
  };
  if (!dados.nome || !Number.isFinite(dados.preco) || dados.preco < 0 ||
      !Number.isInteger(dados.duracaoEstimadaMinutos) || dados.duracaoEstimadaMinutos < 1) {
    erro.value = 'Informe nome, preco valido e duracao de pelo menos um minuto.';
    return;
  }
  salvando.value = true;
  try {
    const eraEdicao = editando.value;
    if (eraEdicao) {
      await atualizarTipoLavagem(form.id, dados);
    } else {
      await criarTipoLavagem(dados);
    }
    limpar();
    await carregar();
    sucesso.value = eraEdicao ? 'Lavagem atualizada com sucesso.' : 'Nova lavagem cadastrada.';
  } catch (e) {
    erro.value = e.message;
  } finally {
    salvando.value = false;
  }
}

async function alternar(servico) {
  alternando.value = servico.id;
  erro.value = '';
  sucesso.value = '';
  try {
    await atualizarTipoLavagem(servico.id, { ativo: !servico.ativo });
    if (form.id === servico.id) limpar();
    await carregar();
    sucesso.value = servico.ativo ? 'Lavagem desativada para novos atendimentos.' : 'Lavagem reativada.';
  } catch (e) {
    erro.value = e.message;
  } finally {
    alternando.value = null;
  }
}

onMounted(carregar);
</script>

<template>
  <section class="pagina-admin">
    <header class="cabecalho">
      <div>
        <p class="sobretitulo">WASHFLOW / ADMINISTRACAO</p>
        <h2>Tipos de lavagem</h2>
        <p>Configure os servicos oferecidos pelo seu lava-rapido. As alteracoes ficam disponiveis para a recepcao.</p>
      </div>
      <div class="resumo">
        <div><span>Servicos cadastrados</span><strong>{{ servicos.length }}</strong></div>
        <div><span>Ativos na recepcao</span><strong>{{ totalAtivos }}</strong></div>
      </div>
    </header>

    <p v-if="erro" class="alerta erro" role="alert">{{ erro }}</p>
    <p v-if="sucesso" class="alerta sucesso" role="status">{{ sucesso }}</p>

    <div class="painel">
      <div class="titulo-painel">
        <div>
          <p class="sobretitulo">{{ editando ? 'EDITAR SERVICO' : 'NOVO SERVICO' }}</p>
          <h3>{{ editando ? 'Editar lavagem' : 'Cadastrar lavagem' }}</h3>
        </div>
        <button v-if="editando" class="botao-secundario" type="button" @click="limpar">Cancelar edicao</button>
      </div>
      <form class="form-servico" @submit.prevent="salvar">
        <label>
          Nome da lavagem
          <input v-model="form.nome" type="text" maxlength="100" placeholder="Ex.: Lavagem premium" required />
        </label>
        <label>
          Preco (R$)
          <input v-model="form.preco" type="number" min="0" step="0.01" placeholder="80,00" required />
        </label>
        <label>
          Duracao estimada (min)
          <input v-model="form.duracaoEstimadaMinutos" type="number" min="1" step="1" placeholder="60" required />
        </label>
        <button class="botao-primario" type="submit" :disabled="salvando">
          {{ salvando ? 'Salvando...' : editando ? 'Salvar alteracoes' : 'Cadastrar lavagem' }}
        </button>
      </form>
    </div>

    <div class="painel lista">
      <div class="titulo-painel">
        <div>
          <p class="sobretitulo">CATALOGO</p>
          <h3>Lavagens cadastradas</h3>
        </div>
        <span class="contagem">{{ servicos.length }} tipos</span>
      </div>
      <p v-if="carregando" class="vazio">Carregando lavagens...</p>
      <div v-else-if="servicos.length === 0" class="vazio">Nenhuma lavagem cadastrada ainda.</div>
      <div v-else class="tabela">
        <table>
          <thead>
            <tr><th>Tipo de lavagem</th><th>Preco</th><th>Duracao</th><th>Situacao</th><th>Acoes</th></tr>
          </thead>
          <tbody>
            <tr v-for="servico in servicos" :key="servico.id">
              <td class="nome-servico">{{ servico.nome }}</td>
              <td>{{ moeda.format(Number(servico.preco)) }}</td>
              <td>{{ servico.duracaoEstimadaMinutos }} min</td>
              <td><span class="etiqueta" :class="servico.ativo ? 'ativo' : 'inativo'">{{ servico.ativo ? 'Ativo' : 'Inativo' }}</span></td>
              <td>
                <div class="acoes">
                  <button type="button" class="botao-texto" @click="editar(servico)">Editar</button>
                  <button type="button" class="botao-texto" :disabled="alternando === servico.id"
                    @click="alternar(servico)">{{ servico.ativo ? 'Desativar' : 'Ativar' }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="nota">Desativar uma lavagem impede novas entradas com esse tipo, mas preserva o historico dos atendimentos anteriores.</p>
    </div>
  </section>
</template>

<style scoped>
.pagina-admin{display:grid;gap:22px;padding-bottom:28px}
.cabecalho{display:flex;justify-content:space-between;align-items:end;flex-wrap:wrap;gap:24px}
.sobretitulo{font-size:.72rem;letter-spacing:.13em;color:#0a4bff;font-weight:800;margin:0 0 9px}
h2{font-size:2rem;letter-spacing:-.04em;color:#111827;margin:0 0 8px}
h3{font-size:1.22rem;color:#111827;margin:0}
.cabecalho p:not(.sobretitulo){margin:0;max-width:560px;color:#65748b;line-height:1.6}
.resumo{display:flex;gap:13px}
.resumo>div{border:1px solid #dfe7f4;background:white;border-radius:14px;padding:15px 20px;min-width:150px;display:grid;gap:8px;box-shadow:0 4px 14px #0d347010}
.resumo span{font-size:.74rem;color:#62758a}
.resumo strong{font-size:1.7rem;color:#0b4ff0}
.painel{background:white;border:1px solid #e2eaf4;border-radius:16px;padding:24px;box-shadow:0 6px 25px #18335c0b}
.titulo-painel{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:22px}
.form-servico{display:grid;grid-template-columns:minmax(0,2fr) repeat(2,minmax(0,1fr)) auto;gap:14px;align-items:end}
.form-servico label{display:grid;gap:8px;font-size:.82rem;color:#40516b;font-weight:700}
input{height:44px;padding:0 13px;border:1px solid #cfdaeb;border-radius:9px;font:inherit;width:100%;background:#fff}
input:focus{border-color:#0a4bff;outline:3px solid #0a4bff1e}
button{font:inherit;cursor:pointer;font-weight:700}
button:disabled{opacity:.55;cursor:wait}
.botao-primario{background:linear-gradient(135deg,#0a4bff,#123dff);border:0;color:white;border-radius:9px;padding:0 18px;height:44px;white-space:nowrap}
.botao-secundario{border:1px solid #d4e2f3;border-radius:8px;background:#fff;color:#235eac;padding:9px 13px}
.tabela{overflow-x:auto}
table{width:100%;border-collapse:collapse}
td,th{padding:15px 12px;text-align:left;border-bottom:1px solid #e9eff7}
th{font-size:.72rem;color:#7d8ba2;letter-spacing:.045em;text-transform:uppercase}
td{font-size:.9rem;color:#35445b}
.nome-servico{font-weight:750;color:#17273f}
.acoes{display:flex;gap:10px}
.botao-texto{border:1px solid #d8e4f4;background:white;color:#1154c0;border-radius:7px;padding:7px 10px;white-space:nowrap}
.etiqueta{border-radius:30px;padding:5px 10px;font-size:.75rem;font-weight:800}
.ativo{color:#087444;background:#e2f9ed}
.inativo{color:#9b4f10;background:#fff3df}
.contagem{font-size:.85rem;color:#6b7b93}
.nota{font-size:.82rem;color:#63738a;margin:16px 0 0}
.vazio{padding:22px;text-align:center;color:#66788e}
.alerta{border-radius:9px;padding:12px 15px;font-size:.9rem}
.alerta.erro{background:#fff0f0;color:#ab2626}
.alerta.sucesso{background:#e6faed;color:#0b773b}
@media(max-width:950px){.form-servico{grid-template-columns:1fr 1fr}.form-servico label:first-child{grid-column:1/-1}}
@media(max-width:630px){.form-servico{grid-template-columns:1fr}.form-servico label:first-child{grid-column:auto}.resumo{flex-wrap:wrap}h2{font-size:1.6rem}}
</style>
