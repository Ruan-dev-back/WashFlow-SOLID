# Relatório da refatoração SOLID do WashFlow

## Introdução

Este relatório compara a implementação anterior à conclusão do enunciado oficial com a arquitetura da branch `refactor/solid`. O objetivo é preservar o fluxo da recepção e os endpoints enquanto cada caso de uso depende de contratos pequenos. O C4 Nível 3 atualizado está em `docs/c4-nivel3-componentes.mmd`; o diagrama de sequência UML da equipe permanece separado em `docs/diagrama-sequencia-original.png` e `docs/diagrama-sequencia.mmd`.

O cadastro rápido continua a consultar a placa, cadastrar cliente e veículo quando necessário, escolher um serviço ativo, criar o atendimento, derivar sua posição na fila e retornar a previsão de conclusão. A fila não é uma tabela adicional. Notificações e relatórios continuam planejados, sem implementação fictícia nesta refatoração.

## Diagnóstico inicial

| Problema após a primeira etapa | Evidência anterior | Consequência |
|---|---|---|
| Um serviço concentrava três cadastros | `backend/src/services/cadastroService.js` | Cliente, veículo e serviço mudavam no mesmo módulo. |
| Serviços ainda montavam dependências concretas | `backend/src/services/{atendimento,fila}Service.js` | A factory existia, mas o próprio arquivo importava repositories Sequelize. |
| Autenticação conhecia bibliotecas e banco | `backend/src/services/authService.js` | A regra de autenticação importava `bcryptjs`, `jsonwebtoken` e `usuarioRepository`. |
| Contratos não estavam documentados por consumidor | Inexistência de `backend/src/ports/` | Fakes e adaptadores não tinham capacidades esperadas explícitas. |
| C4 atualizado ainda mostrava dependência direta | Versão anterior de `docs/c4-nivel3-componentes.mmd` | O diagrama não representava a inversão de dependência desejada. |

## SRP — responsabilidade única

- **Problema identificado:** `CadastroService` misturava regras de cliente, veículo e serviço.
- **Arquivo antes:** `backend/src/services/cadastroService.js`.
- **Alteração realizada:** divisão por caso de uso; `CadastroController` apenas traduz HTTP e delega a três serviços injetados. O arquivo antigo foi removido.
- **Arquivos depois:** `backend/src/services/clienteService.js`, `backend/src/services/veiculoService.js`, `backend/src/services/servicoService.js` e `backend/src/controllers/cadastroController.js`.
- **Justificativa:** uma mudança nas regras de preço não exige editar o módulo de clientes; a orquestração da entrada, a previsão e a persistência permanecem em responsabilidades próprias.
- **Evidência/teste:** `backend/test/api-cadastro.test.js` percorre login e os endpoints de clientes, veículos e serviços; `backend/test/fluxo-atendimento.test.js` cobre a entrada.

## OCP — aberto para extensão, fechado para alteração central

- **Problema identificado:** a transição de status era escolhida dentro de `FilaService`; a primeira etapa a extraiu, mas ainda faltava uma política substituível.
- **Arquivos antes:** `backend/src/services/filaService.js` e a primeira versão de `backend/src/domain/fluxoStatus.js`.
- **Alteração realizada:** `criarFluxoStatus(transicoes)` constrói um registro de transições e `FilaService` recebe a política por injeção. A política padrão mantém `AGUARDANDO → EM_LAVAGEM → SECAGEM → FINALIZADO`, com `horaInicio` e `horaFim` nas etapas corretas.
- **Arquivos depois:** `backend/src/domain/fluxoStatus.js`, `backend/src/ports/fluxoStatusPort.js`, `backend/src/services/filaService.js` e `backend/src/container.js`.
- **Justificativa:** uma política alternativa pode ser composta sem alterar `FilaService`. Um novo status persistido ainda exigiria atualizar modelo, vocabulário e interface; por isso a extensão do sistema completo é parcial.
- **Evidência/teste:** `backend/test/regras-fila.test.js` injeta uma política alternativa; `backend/test/contratos-services.test.js` confirma a sequência padrão e os horários.

## LSP — substituição de implementações

- **Problema identificado:** havia evidência de substituição apenas para a fila; autenticação e entrada ainda não haviam sido executadas com colaboradores alternativos.
- **Arquivos antes:** `backend/src/services/authService.js`, `backend/src/services/atendimentoService.js` e a primeira suíte em `backend/test/`.
- **Alteração realizada:** as factories recebem capacidades estruturais; fakes implementam os métodos necessários e produzem o mesmo resultado observável, sem herança artificial.
- **Arquivos depois:** `backend/src/services/{auth,atendimento,fila}Service.js`, `backend/src/ports/` e `backend/test/contratos-services.test.js`.
- **Justificativa:** a regra não deve depender da identidade do adapter; um fake ou outro provedor válido deve respeitar o mesmo contrato de entrada, saída e erro.
- **Evidência/teste:** `backend/test/contratos-services.test.js` usa `fakeUsuarioRepository`, `fakePasswordHasher`, `fakeTokenProvider` e repositories/fila fake; `backend/test/regras-fila.test.js` usa repository substituto. `backend/test/api-cadastro.test.js` exercita os adapters reais.

## ISP — contratos pequenos e específicos

- **Problema identificado:** as dependências recebidas por factory não tinham contratos explícitos, e um contrato agregado poderia forçar métodos não usados.
- **Arquivo antes:** parâmetros sem tipos de `backend/src/services/{auth,atendimento,fila}Service.js`; não existia `backend/src/ports/`.
- **Alteração realizada:** portas JSDoc por capacidade e caso de uso. Por exemplo, `AuthService` exige apenas `comparar` do hasher e `emitir` do token; o seed usa `gerarHash`, e o middleware HTTP usa `verificar`. As portas de atendimento distinguem entrada e gestão da fila.
- **Arquivos depois:** `backend/src/ports/*.js` e assinaturas JSDoc em `backend/src/services/*.js`.
- **Justificativa:** nenhum fake de autenticação precisa implementar geração de hash ou verificação de token; não há método vazio nem exceção `NotImplemented`.
- **Evidência/teste:** os fakes mínimos de `backend/test/contratos-services.test.js` e `backend/test/regras-fila.test.js` executam os casos de uso sem métodos inúteis.

## DIP — inversão de dependência

- **Problema identificado:** factories de atendimento e fila continuavam importando repositories; `AuthService` importava Sequelize indiretamente, BCrypt e JWT diretamente.
- **Arquivos antes:** `backend/src/services/{atendimento,fila,auth}Service.js`.
- **Alteração realizada:** os serviços exportam apenas factories. `backend/src/container.js` monta repositories Sequelize, adapters BCrypt/JWT, política de status, serviços, controllers e middleware. `authService.js` recebe `usuarios`, `passwordHasher` e `tokenProvider`. A implementação concreta de autenticação está em `backend/src/infrastructure/security/`.
- **Arquivos depois:** `backend/src/container.js`, `backend/src/services/{auth,atendimento,fila}Service.js`, `backend/src/infrastructure/security/{bcryptPasswordHasher,jwtTokenProvider}.js`, `backend/src/controllers/*.js` e `backend/src/routes/*.js`.
- **Justificativa:** o alto nível declara o que precisa; o ponto de entrada escolhe como fornecer a capacidade. As rotas e os controllers continuam sem regras de negócio.
- **Evidência/teste:** `backend/test/contratos-services.test.js` substitui colaboradores, `backend/test/api-entrada.test.js` e `backend/test/api-cadastro.test.js` verificam a composição HTTP real. Uma busca por `repositories/`, `bcryptjs`, `jsonwebtoken`, `sequelize` e `express` em `backend/src/services/` e `backend/src/domain/` não encontra imports dessas implementações.

## Antes x Depois

| Aspecto | Antes | Depois |
|---|---|---|
| Cadastros | Um `cadastroService.js` para três domínios | `clienteService.js`, `veiculoService.js`, `servicoService.js` |
| Dependência dos serviços | Imports de repositories e bibliotecas concretas | Capacidades injetadas via `container.js` e documentadas em `ports/` |
| Autenticação | BCrypt, JWT e repository dentro do serviço | `AuthService` puro em relação à infraestrutura; adapters em `infrastructure/security/` |
| Cálculo da fila | DTO montado dentro do domínio | `domain/fila.js` calcula dados puros; `FilaService` transforma em DTO |
| Status | Regras centrais fixas | Política de transições configurável, injetada no serviço |
| Apresentação HTTP | Controllers importavam serviços concretos | Controllers e rotas recebem dependências montadas no container |
| Fluxo funcional | Consulta/cadastro, atendimento e fila | Mesmos endpoints e fluxo, com posição e previsão preservadas |

## Relação com C4

O [C4 Nível 3 atualizado](c4-nivel3-componentes.mmd) usa componentes que correspondem a arquivos ou pacotes reais:

| Componente C4 | Código correspondente | Relação observável |
|---|---|---|
| Interface Web | `frontend/src/` | Chama a API por HTTP/JSON. |
| Routes | `backend/src/routes/*.js` | Recebem controllers e middleware montados no container. |
| Validação | `backend/src/validators/*.js`, `backend/src/middlewares/validar.js` | Executa validação antes dos controllers. |
| Controllers | `backend/src/controllers/*.js` | Recebem serviços por factory. |
| Middleware de autenticação | `backend/src/middlewares/auth.js` | Recebe a capacidade de verificar token do container. |
| Tratamento de erros | `backend/src/middlewares/errorHandler.js` | Trata erros encaminhados pela cadeia Express. |
| Application Services | `backend/src/services/*.js` | Recebem capacidades descritas em `ports/`; não importam repositories concretos. |
| Ports | `backend/src/ports/*.js` | Contratos JSDoc usados nas assinaturas dos serviços e do middleware. |
| Domínio | `backend/src/domain/*.js` | Cálculo, transições, placa e erro sem banco, HTTP ou bibliotecas externas. |
| Persistence Adapters | `backend/src/repositories/*.js` | Satisfazem os contratos e acessam `models/*.js`/Sequelize. |
| Security Adapters | `backend/src/infrastructure/security/*.js` | Satisfazem capacidades de senha e token por BCrypt/JWT. |
| Composition Root | `backend/src/container.js` | Escolhe e injeta implementações concretas. |
| Modelos de persistência | `backend/src/models/*.js` | Mapeiam as tabelas usadas pelos repositories. |
| Banco de dados | `backend/src/config/database.js` | Configura SQLite local ou PostgreSQL documentado. |
| BCrypt e JWT | `backend/package.json` | Bibliotecas chamadas apenas pelos adapters de segurança. |

Os diagramas C4 de contexto e containers continuam em `docs/c4-nivel1-contexto.mmd` e `docs/c4-nivel2-container.mmd`. O diagrama de classes atualizado está em `docs/diagrama-classes.mmd`. O diagrama de sequência da equipe é UML, não C4; sua imagem foi preservada sem alteração.

## Testes

Executar na raiz do repositório:

```bash
cd backend && npm test
cd ../frontend && npm run build
```

A suíte cobre autenticação e entrada com fakes, política alternativa de status, horários das transições, fila calculada, seed idempotente com adapter de senha, fluxo com SQLite em memória e endpoints HTTP de autenticação, clientes, veículos, serviços e atendimento. Na conclusão desta etapa: **11 testes passaram**, sem falhas; **build do front-end passou**.

## Checklist final dos 13 critérios

`ATENDE` significa que o critério está implementado no escopo atual. `PARCIAL` explicita uma função planejada ou um limite de extensão ainda existente.

| # | Critério | Avaliação | Evidência e limite |
|---:|---|---|---|
| 1 | Correspondência C4 → código | ATENDE | `docs/c4-nivel3-componentes.mmd` e `backend/src/{routes,controllers,services,ports,infrastructure,repositories}/`. |
| 2 | Domínio isolado de infraestrutura | ATENDE | `backend/src/domain/{fila,fluxoStatus,placa,appError}.js` não importa banco, API ou framework; `backend/src/models/` é mapeamento de persistência. |
| 3 | Dependências do C4 coincidem com contratos/injeções | ATENDE | `docs/c4-nivel3-componentes.mmd`, `backend/src/ports/` e `backend/src/container.js`. |
| 4 | Responsabilidade única | ATENDE | `backend/src/services/{cliente,veiculo,servico,auth,atendimento,fila}Service.js` separa casos de uso. |
| 5 | Ausência de God Classes | ATENDE | Antigo `backend/src/services/cadastroService.js` removido; regras distribuídas pelos serviços e `backend/src/domain/`. |
| 6 | Validação, notificação e persistência delegadas | PARCIAL | Validação: `backend/src/validators/*.js` e `middlewares/validar.js`; persistência: `backend/src/repositories/`. Notificação RF08 ainda não existe e não foi simulada. |
| 7 | Extensão por novos componentes | PARCIAL | `backend/src/domain/fluxoStatus.js` e `backend/src/container.js` aceitam outra política sem mudar `FilaService`; um status persistido novo ainda exige atualizar modelo e interface. |
| 8 | Mudança de requisitos com baixo impacto central | PARCIAL | `backend/src/ports/`, `container.js` e serviços separados reduzem impacto; mudanças no esquema e no fluxo HTTP ainda atravessam camadas. |
| 9 | Substituibilidade | ATENDE | `backend/test/contratos-services.test.js` e `backend/test/regras-fila.test.js`. |
| 10 | Contratos pequenos e coerentes | ATENDE | `backend/src/ports/{clienteRepositoryPort,atendimentoRepositoryPort,passwordHasherPort,tokenProviderPort}.js` documenta capacidades específicas. |
| 11 | Nenhum método inútil ou vazio | ATENDE | Fakes mínimos em `backend/test/contratos-services.test.js` e capacidades separadas em `backend/src/ports/`. |
| 12 | Alto nível depende de abstrações | ATENDE | Factories em `backend/src/services/` recebem portas JSDoc; somente `backend/src/container.js` escolhe repositories e adapters concretos. |
| 13 | Composition Root configura implementações | ATENDE | `backend/src/container.js`, consumido por `backend/src/app.js` e `backend/src/server.js`. |
