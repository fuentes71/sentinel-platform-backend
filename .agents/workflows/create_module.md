---
description: Como criar um novo módulo no projeto (Controllers, Services e Prisma)
---

# Criando um Novo Módulo no Sentinel Platform

Sempre que o usuário solicitar a criação de uma nova feature ou entidade no sistema, siga estes passos:

1. **Gere os arquivos básicos do NestJS**
   - Utilize o Nest CLI (se disponível) ou crie manualmente a pasta dentro de `src/`.
   - Crie o `[nome].module.ts`, `[nome].controller.ts` e `[nome].service.ts`.

2. **Integração com o Banco de Dados (Prisma)**
   - O projeto utiliza Prisma ORM com o driver `better-sqlite3`.
   - Injete o `PrismaService` no construtor do novo serviço:
     ```typescript
     constructor(private prisma: PrismaService) {}
     ```
   - Lembre-se que todas as chamadas ao Prisma (`this.prisma.[model].findUnique()`, etc.) devem ser funções assíncronas (`async`/`await`). Evite retornar Promises não resolvidas diretamente no fluxo se houver blocos `try/catch`.

3. **Validação de Entrada (DTOs)**
   - Crie uma pasta `dto/` dentro do seu módulo.
   - Utilize as bibliotecas `class-validator` e `class-transformer` para validar o payload das requisições (ex: `@IsString()`, `@IsOptional()`, etc.).

4. **Registro no Módulo Principal**
   - Garanta que o novo módulo (`[Nome]Module`) seja importado no array `imports` do `app.module.ts`.

5. **Testes**
   - Se o usuário pedir para incluir testes, crie o arquivo `[nome].service.spec.ts` utilizando as convenções do Jest configuradas no projeto.
