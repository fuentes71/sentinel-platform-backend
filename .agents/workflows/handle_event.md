---
description: Como lidar com eventos em tempo real (Socket.io e RabbitMQ)
---

# Manipulação de Eventos e Tempo Real

O Sentinel Platform recebe eventos e precisa frequentemente atualizar o frontend em tempo real usando WebSockets.

1. **Recepção de Eventos**
   - O processamento principal de eventos acontece no serviço de eventos (`src/events/events.service.ts`).
   - Se um novo tipo de evento for introduzido relacioando a Ativos (Assets), crie ou atualize o método correspondente no serviço.
   - O tipo de evento aceito pela modelagem (`Prisma Event Type`) deve ser `status`, `metric` ou `system`. Se for um tipo novo, é necessário adaptar o guard/validation correspondente.

2. **Emissão de Atualizações (WebSocket)**
   - Utilize o `RealtimeGateway` (dentro de `src/realtime/`) para emitir mensagens aos clientes conectados.
   - Ao processar um evento importante em qualquer serviço, injete ou chame a camada que tem acesso ao gateway Socket.io e emita a mensagem (Ex: `socket.emit('asset_updated', data)` ou via decorators apropriados do NestJS).

3. **Comunicação por Filas (Microservices)**
   - Se a tarefa envolver AMQP/RabbitMQ, importe os clientes do `@nestjs/microservices`. O projeto usa `amqp-connection-manager` e `amqplib`.
   - Adicione logs precisos sempre que consumir mensagens da fila ou publicar nas exchanges.

4. **Regras e Alertas**
   - Ao receber uma métrica via evento, verifique se ela cruza algum limite estipulado nas tabelas de `Rule`.
   - Se cruzar, o sistema deve registrar um `Alert` (levels: `info`, `warning`, `critical`).
