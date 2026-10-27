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
- Telegram Bot API como **única integração externa de mensagens planejada para o MVP**. A integração agora associa cada cliente ao seu chat privado via link temporário de /start; o número de telefone permanece para cadastro, mas não endereça mensagens do Telegram.

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
| RF08 Notificação Telegram | Código implementado com vínculo por cliente; envio externo depende de token e bot real |
| RF09 Histórico diário | Implementado |
| RF10 Duração média | Implementado |

Esta tabela indica **cobertura funcional implementada**, não comprovação de 70% de esforço nem homologação integral. A validação integrada e os requisitos não funcionais continuam pendentes.

## Fluxo de ponta a ponta para demonstrar
1. Login em `recepcao / recepcao123`.
2. Registrar placa, cliente e serviço em **Recepção**. A tela oferece **Gerar link de vinculação** para o Telegram daquele cliente.
3. O cliente abre o link no próprio Telegram e toca **Iniciar**; o monólito registra o chat individual. Abrir **Fila** e avançar AGUARDANDO → EM_LAVAGEM → SECAGEM → FINALIZADO.
4. No mesmo processo Node, registrar a notificação em banco para envio assíncrono.
5. Configurar o bot no `.env` para que o worker envie a mensagem apenas para o Telegram vinculado ao cliente do veículo.
6. Login como gerente para abrir **Relatórios**, conferir atendimentos e status de notificação.

## Como configurar o Telegram
1. Criar um bot com **@BotFather** usando `/newbot`; copiar token e nome do bot, sem compartilhar token.
2. No arquivo `backend/.env` configurar `TELEGRAM_BOT_TOKEN` e `TELEGRAM_BOT_USERNAME`. Reiniciar o backend.
3. Registrar a entrada de um carro em Recepção; clicar em **Gerar link de vinculação**.
4. Enviar ou mostrar o link ao próprio cliente. Ele deve abrir o Telegram e tocar **Iniciar** no bot dentro dos 20 minutos de validade.
5. O backend recebe o `/start <token>` por `getUpdates`, valida o token (armazenado como hash), registra o `chat_id` individual no vínculo do cliente e consome o token.
6. O atendente clica **Verificar se cliente vinculou**. Quando o veículo é marcado **FINALIZADO**, a notificação é persistida e enviada ao chat desse cliente pelo worker interno.
7. Caso ainda não tenha vinculado, o aviso permanece pendente; não deve ser enviado para outros clientes nem para um grupo.
8. O MVP utiliza polling no mesmo processo; não configurar webhook simultaneamente e executar uma única instância da API. Cada chat só pode estar vinculado a um cadastro de cliente por vez.

## Critérios de resiliência
- Enfileiramento persistido em tabela `notificacoes`.
- Telegram sem resposta: status `FALHOU`, incremento de tentativas e retentativas com atraso.
- Configuração ausente ou cliente sem vínculo: a operação de pátio não é interrompida; ficam registros `PENDENTE`.
- Após três tentativas sem sucesso, erro permanece para consulta gerencial.
- **Limites conhecidos**: o job no mesmo processo não implementa fila distribuída com lock entre instâncias; falhas no banco também podem impedir registro de notificação. Não reivindicar entrega garantida em todos os cenários.

## Critérios ainda a validar
- Conflitos concorrentes na entrada (duplicação de veículo), transações de banco.
- Restrição física de apenas um carro em atendimento por vez.
- Teste integrado com Telegram de verdade para **dois clientes distintos**, certificando que cada mensagem chega somente ao titular, e medição da meta de p95 em 500 ms.
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
