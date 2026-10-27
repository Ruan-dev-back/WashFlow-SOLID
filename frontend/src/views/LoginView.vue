<!--
  Tela de Login -- porta de entrada do sistema (RNF04 - Seguranca).

  Layout em duas colunas: painel de marca a esquerda, formulario a
  direita. Estilo exclusivo desta tela -- as demais views seguem o
  visual simples definido em src/index.css.
-->
<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { entrar } from '../services/washflowService';

const router = useRouter();

const form = reactive({ login: '', senha: '' });
const erro = ref('');
const enviando = ref(false);
const mostrarSenha = ref(false);

async function submeter() {
  erro.value = '';
  enviando.value = true;

  try {
    const usuario = await entrar(form.login, form.senha);
    router.push({ name: usuario.perfil === 'GERENTE' ? 'admin-servicos' : 'fila' });
  } catch (e) {
    erro.value = e.message;
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <div class="login-pagina">
    <aside class="login-hero">
      <div class="hero-decoracoes" aria-hidden="true">
        <span class="anel anel-1"></span>
        <span class="anel anel-2"></span>
        <span class="bolha"></span>
        <span class="gota gota-1"></span>
        <span class="gota gota-2"></span>
        <span class="gota gota-3"></span>
        <span class="gota gota-4"></span>
      </div>

      <p class="hero-marca">WashFlow</p>

      <h1 class="hero-titulo">Cada carro,<br />impecável.</h1>
    </aside>

    <main class="login-conteudo">
      <form class="login-form" @submit.prevent="submeter">
        <p class="login-eyebrow">Bem-vindo</p>
        <h2 class="login-titulo">Acesse sua conta</h2>

        <p v-if="erro" class="login-erro">{{ erro }}</p>

        <div class="campo-login">
          <label for="login">Usuário</label>
          <input
            id="login"
            v-model="form.login"
            placeholder="recepcao ou gerente"
            autofocus
          />
        </div>

        <div class="campo-login">
          <label for="senha">Senha</label>
          <div class="campo-senha">
            <input
              id="senha"
              v-model="form.senha"
              :type="mostrarSenha ? 'text' : 'password'"
              placeholder="••••••••"
            />
            <button
              type="button"
              class="alternar-senha"
              @click="mostrarSenha = !mostrarSenha"
            >
              {{ mostrarSenha ? 'Ocultar' : 'Ver' }}
            </button>
          </div>
        </div>

        <button class="login-botao" type="submit" :disabled="enviando">
          {{ enviando ? 'Entrando...' : 'Entrar' }}
        </button>

        <div class="login-dica">
          <p class="dica-titulo">Usuários para testes</p>
          <div class="dica-linha">
            <span>Recepção</span>
            <code>recepcao / recepcao123</code>
          </div>
          <div class="dica-linha">
            <span>Gerente</span>
            <code>gerente / gerente123</code>
          </div>
        </div>
      </form>
    </main>
  </div>
</template>

<style scoped>
.login-pagina {
  min-height: 100vh;
  width: 100%;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  background: #f7f8fa;
  font-family: 'Manrope', system-ui, -apple-system, sans-serif;
}

/* ---------- Painel esquerdo (marca) ---------- */

.login-hero {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 56px;
  min-height: 100vh;
  background: linear-gradient(160deg, #2c4a6e 0%, #1f3752 55%, #172a3d 100%);
}

.hero-decoracoes {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.anel {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.anel-1 {
  width: 520px;
  height: 520px;
  top: -180px;
  right: -160px;
}

.anel-2 {
  width: 380px;
  height: 380px;
  top: -80px;
  right: -60px;
  border-color: rgba(255, 255, 255, 0.06);
}

.bolha {
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: rgba(120, 190, 230, 0.12);
  bottom: -100px;
  left: -80px;
  animation: flutuar 7s ease-in-out infinite;
}

.gota {
  position: absolute;
  width: 3px;
  border-radius: 3px;
  background: linear-gradient(rgba(210, 235, 250, 0.55), transparent);
  animation: pingar 4s ease-in infinite;
}

.gota-1 {
  left: 68px;
  top: 18%;
  height: 90px;
  animation-delay: 0.2s;
}

.gota-2 {
  left: 130px;
  top: 10%;
  height: 70px;
  animation-duration: 4.6s;
  animation-delay: 1.4s;
}

.gota-3 {
  left: 220px;
  top: 24%;
  height: 60px;
  width: 2px;
  animation-duration: 3.8s;
  animation-delay: 0.8s;
}

.gota-4 {
  left: 300px;
  top: 6%;
  height: 100px;
  animation-duration: 5.2s;
  animation-delay: 2.2s;
}

@keyframes pingar {
  0% {
    transform: translateY(-10%);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(620%);
    opacity: 0;
  }
}

@keyframes flutuar {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-14px);
  }
}

.hero-marca {
  position: relative;
  z-index: 1;
  color: #fff;
  font-weight: 800;
  font-size: 20px;
  letter-spacing: -0.02em;
  margin: 0;
}

.hero-titulo {
  position: relative;
  z-index: 1;
  max-width: 420px;
  color: #fff;
  font-size: 40px;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
}

/* ---------- Painel direito (formulário) ---------- */

.login-conteudo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #f7f8fa;
}

.login-form {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-eyebrow {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #3d7bb0;
  margin: 0 0 8px;
}

.login-titulo {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #212936;
  margin: 0 0 12px;
}

.login-erro {
  margin: 0;
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  background: #fdecea;
  color: #c0392b;
  font-size: 0.88rem;
}

.campo-login {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.campo-login label {
  font-size: 13px;
  font-weight: 600;
  color: #5b6878;
}

.campo-login input {
  height: 50px;
  border-radius: 12px;
  border: 1.5px solid #e2e5ea;
  background: #fff;
  padding: 0 16px;
  font-size: 15px;
  font-family: inherit;
  color: #212936;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  width: 100%;
  box-sizing: border-box;
}

.campo-login input:focus {
  border-color: #3f83c4;
  box-shadow: 0 0 0 4px rgba(63, 131, 196, 0.15);
}

.campo-senha {
  position: relative;
}

.campo-senha input {
  padding-right: 64px;
}

.alternar-senha {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: #3f83c4;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  cursor: pointer;
  padding: 6px 8px;
}

.login-botao {
  height: 52px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #3f83c4, #2e5f92);
  color: #fff;
  font-size: 15.5px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  margin-top: 8px;
  box-shadow: 0 8px 20px -6px rgba(46, 95, 146, 0.5);
  transition: transform 0.15s, box-shadow 0.15s;
}

.login-botao:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px -6px rgba(46, 95, 146, 0.55);
}

.login-botao:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-dica {
  margin-top: 12px;
  padding: 18px 20px;
  border-radius: 14px;
  background: #eef4fa;
  border: 1px dashed #b9d3ea;
}

.dica-titulo {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #4a7aa8;
  margin: 0 0 10px;
}

.dica-linha {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13.5px;
  color: #4b5563;
  margin-top: 6px;
}

.dica-linha code {
  font-family: 'Courier New', monospace;
  color: #3f83c4;
  font-weight: 600;
}

/* ---------- Responsivo ---------- */

@media (max-width: 860px) {
  .login-pagina {
    grid-template-columns: 1fr;
  }

  .login-hero {
    min-height: 260px;
    padding: 32px;
  }

  .hero-titulo {
    font-size: 30px;
  }

  .login-conteudo {
    padding: 28px 20px 48px;
  }
}
</style>
