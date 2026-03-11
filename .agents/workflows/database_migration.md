---
description: Como atualizar o schema do Prisma e aplicar migrações
---

# Atualização de Schema do Banco de Dados

Quando for necessário adicionar ou alterar informações nas tabelas do sistema (Assets, Users, Alerts, Events, Rules):

1. **Alteração do `schema.prisma`**
   - Altere o arquivo `prisma/schema.prisma`.
   - O provider do `datasource` é `sqlite`. Assegure-se de que os tipos utilizados são suportados pelo SQLite Prisma driver.
   - Relacionamentos (como `Asset` -> `Event[]`) devem utilizar a diretiva `@relation`, incluindo `onDelete: Cascade` caso a exclusão do pai deva apagar os filhos, como é praticado no schema atual.

2. **Geração e Push das Mudanças**
   - Para ambientes de desenvolvimento:
     ```bash
     npx prisma db push
     ```
   - Ou para criar um histórico de migração consolidado (se solicitado):
     ```bash
     npx prisma migrate dev --name <nome_da_migracao>
     ```
// turbo-all

3. **Atualização do Cliente Prisma**
   - Normalmente, o Prisma gera o client automaticamente após o `push`/`migrate`. Caso ocorram problemas de tipagem subsequentes, execute:
     ```bash
     npx prisma generate
     ```

4. **Script de Seed**
   - Se uma nova entidade for fundamental para o início do funcionamento da aplicação (ex: um novo tipo de regra padrão), adicione sua criação no `prisma/seed.ts`.
