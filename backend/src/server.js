/**
 * Bootstrap da API: sincroniza o banco, carrega a carga inicial e sobe o servidor.
 */
const app = require('./app');
const { sequelize } = require('./models');
const { executarSeed } = require('./config/seed');
const { passwordHasher, services } = require('./container');
const { iniciarWorker } = require('./infrastructure/telegram/iniciarWorker');

const PORT = process.env.PORT || 3000;

async function iniciar() {
  try {
    await sequelize.authenticate();
    // Em SQLite, alter:true recria tabelas usando *_backup e pode falhar
    // em reinicializacoes (UNIQUE constraint). No MVP, so cria tabelas ausentes.
    // Mudancas em tabelas existentes devem ser feitas por migrations.
    await sequelize.sync();
    await executarSeed({ passwordHasher });
    iniciarWorker({ notificacoes: services.notificacoes, telegramVinculo: services.telegramVinculo });

    app.listen(PORT, () =>
      console.log(`API WashFlow ouvindo em http://localhost:${PORT}/api`)
    );
  } catch (erro) {
    console.error('Falha ao iniciar a API:', erro);
    process.exit(1);
  }
}

iniciar();
