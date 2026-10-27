# WashFlow — entrega parcial (meta: 70%)

## A dor do negócio
Lava-rápidos que registram chegadas em papel, planilhas ou memória perdem a ordem dos veículos, têm dificuldade para prever entregas e gastam tempo informando clientes. Nos horários de pico surgem atrasos, filas no balcão e baixa visibilidade para a gerência.

## Solução proposta
O WashFlow é uma aplicação web de controle do pátio. A recepção cadastra cliente, placa, veículo, tipo de lavagem e entrada; o operador avança o atendimento de AGUARDANDO para EM_LAVAGEM, SECAGEM e FINALIZADO. O painel mostra a fila e a previsão aproximada. O gerente acompanha histórico, duração média real e notificações.

## Arquitetura
- Back-end **monolítico em camadas**, Node.js e Express, módulos internos coesos.
- Front-end SPA Vue 3, comunicação HTTP/JSON.
- Sequelize; SQLite local e PostgreSQL como destino projetado.
- SOLID aplicado nas regras de negócio: **SRP** serviços por responsabilidade, **OCP** política de status injetada, **LSP/ISP** colaboradores substituíveis e contratos menores, **DIP** dependências injetadas em `backend/src/container.js`.
- Telegram Bot API como **única integração externa de mensagens planejada para o MVP**. A integração atual envia a um chat de teste configurado, não ao telefone automaticamente.

## Critério objetivo da meta
| Requisito | Estado nesta branch |
| --- | --- |
| RF01 Login e perfis | Implementado |
| RF02 Clientes e veículos | Implementado |
| RF03 Serviços | Implementado |
| RF04 Entrada no pátio | Implementado |
| RF05 Fila e status | Implementado |
| RF06 Estimativa de espera | Implementado |
| RF07 Transições de atendimento | Implementado |
| RF08 Notificação Telegram | Código implementado; entrega externa depende de bot/chat de teste |
| RF09 Histórico diário | Implementado |
| RF10 Duração média | Implementado |

Esta tabela indica **cobertura funcional implementada**, não comprovação de 70% de esforço nem homologação integral. A validação integrada e os requisitos não funcionais continuam pendentes.

## Fluxo de ponta a ponta para demonstrar
1. Login em `recepcao / recepcao123`.
2. Registrar placa, cliente e serviço em **Recepção**.
3. Abrir **Fila** e avançar AGUARDANDO → EM_LAVAGEM → SECAGEM → FINALIZADO.
4. No mesmo processo Node, registrar a notificação em banco para envio assíncrono.
5. Configurar o bot no `.env` para que o worker publique a mensagem no chat Telegram.
6. Login como gerente para abrir **Relatórios**, conferir atendimentos e status de notificação.

## Como configurar o Telegram
1. No Telegram, abrir **@BotFather**, executar `/newbot` e receber um token. Guardar o token somente no `backend/.env`.
2. Iniciar uma conversa com o bot usando `/start` ou adicioná-lo a um grupo de testes.
3. Enviar mensagem ao bot/grupo, e usar a API oficial `getUpdates` em ambiente local para identificar o ID do chat.
4. Configurar `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` em `backend/.env`.
5. Reiniciar a API. Quando um veículo é finalizado, será enfileirado; o worker verifica notificações a cada 15 segundos.
6. O cliente final real **não é identificado automaticamente pelo telefone**; nesta etapa a notificação vai para um chat fixo de demonstração. Não compartilhar dados pessoais reais no grupo.

## Critérios de resiliência
- Enfileiramento persistido em tabela `notificacoes`.
- Telegram sem resposta: status `FALHOU`, incremento de tentativas e retentativas com atraso.
- Configuração ausente: a operação de pátio não é interrompida; ficam registros `PENDENTE`.
- Após três tentativas sem sucesso, erro permanece para consulta gerencial.
- **Limites conhecidos**: o job no mesmo processo não implementa fila distribuída com lock entre instâncias; falhas no banco também podem impedir registro de notificação. Não reivindicar entrega garantida em todos os cenários.

## Critérios ainda a validar
- Conflitos concorrentes na entrada (duplicação de veículo), transações de banco.
- Restrição física de apenas um carro em atendimento por vez.
- Teste integrado com Telegram de verdade e medição da meta de p95 em 500 ms.
- Testes de usabilidade de 30 segundos, indicadores de disponibilidade e revisão de privacidade.
- Revisão do README/C4: distinguir claramente a arquitetura implementada dos módulos futuros.

## Comandos
```bash
cd backend
cp .env.example .env
npm ci
npm test
npm run dev
```
Outra janela:
```bash
cd frontend
npm ci
npm run dev
```
